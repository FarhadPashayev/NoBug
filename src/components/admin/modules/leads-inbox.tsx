"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/admin/client";
import { LEAD_STATUSES } from "@/lib/admin/schemas";
import { formatDate } from "@/lib/utils";
import { DataTable } from "../data-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "../ui/dialog";
import { Field, Select, Textarea } from "../ui/field";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  locale: string;
  source: string;
  status: (typeof LEAD_STATUSES)[number];
  note: string;
  answers: Record<string, unknown> | null;
  createdAt: string;
};

const LABELS: Record<Lead["status"], string> = { NEW: "Yeni", IN_PROGRESS: "İşlənir", CONTACTED: "Əlaqə saxlanıldı", ARCHIVED: "Arxiv" };
const TONES: Record<Lead["status"], "accent" | "warning" | "success" | "neutral"> = { NEW: "accent", IN_PROGRESS: "warning", CONTACTED: "success", ARCHIVED: "neutral" };

/** Read-only inbox: the submission itself is never edited — only status and an internal note. */
export function LeadsInbox() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [open, setOpen] = useState<Lead | null>(null);

  const list = useQuery({
    queryKey: ["leads", status],
    queryFn: () => api<{ leads: Lead[] }>(`/api/admin/leads${status ? `?status=${status}` : ""}`),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: Lead["status"]; note?: string }) => api(`/api/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Yeniləndi");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Silindi");
      setOpen(null);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const leads = list.data?.leads ?? [];

  return (
    <div className="space-y-4">
      {list.isError && (
        <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
          {(list.error as Error).message}
        </p>
      )}

      <DataTable
        rows={leads}
        searchPlaceholder="Ad, e-poçt, mesaj…"
        toolbar={
          <>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="w-auto min-w-40">
              <option value="">Bütün statuslar</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABELS[s]}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={() => window.open(`/api/admin/leads?format=csv${status ? `&status=${status}` : ""}`, "_blank")}>
              <Download />
              CSV
            </Button>
          </>
        }
        columns={[
          {
            key: "name",
            header: "Göndərən",
            value: (l) => `${l.name} ${l.email} ${l.phone}`,
            cell: (l) => (
              <button type="button" onClick={() => setOpen(l)} className="min-w-0 text-left">
                <span className="block truncate font-medium">{l.name}</span>
                <span className="block truncate text-xs text-ad-muted-fg">{l.email || l.phone || "—"}</span>
              </button>
            ),
          },
          { key: "service", header: "Xidmət", value: (l) => l.service, cell: (l) => l.service || <span className="text-ad-muted-fg">—</span>, className: "w-48" },
          {
            key: "message",
            header: "Mesaj",
            value: (l) => l.message,
            cell: (l) => <span className="line-clamp-2 max-w-[28ch] text-ad-muted-fg">{l.message || "—"}</span>,
          },
          {
            key: "status",
            header: "Status",
            value: (l) => l.status,
            cell: (l) => (
              <Select
                value={l.status}
                onChange={(e) => update.mutate({ id: l.id, status: e.target.value as Lead["status"] })}
                aria-label="Status"
                className="h-8 w-auto min-w-36 text-xs"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LABELS[s]}
                  </option>
                ))}
              </Select>
            ),
            className: "w-44",
          },
          { key: "createdAt", header: "Tarix", value: (l) => l.createdAt, cell: (l) => <span className="whitespace-nowrap text-ad-muted-fg">{formatDate(l.createdAt)}</span>, className: "w-44" },
        ]}
      />

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        {open && (
          <DialogContent title={open.name} description={`${formatDate(open.createdAt)} · ${open.source} · ${open.locale.toUpperCase()}`}>
            <DialogBody className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge tone={TONES[open.status]}>{LABELS[open.status]}</Badge>
                {open.email && (
                  <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 text-sm text-ad-accent hover:underline">
                    <Mail className="size-3.5" />
                    {open.email}
                  </a>
                )}
                {open.phone && (
                  <a href={`tel:${open.phone}`} className="inline-flex items-center gap-1.5 text-sm text-ad-accent hover:underline">
                    <Phone className="size-3.5" />
                    {open.phone}
                  </a>
                )}
              </div>

              {open.service && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ad-muted-fg">Xidmət</p>
                  <p className="mt-1 text-sm">{open.service}</p>
                </div>
              )}

              {open.message && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ad-muted-fg">Mesaj</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{open.message}</p>
                </div>
              )}

              {open.answers && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ad-muted-fg">Sorğu cavabları</p>
                  <dl className="mt-2 space-y-2">
                    {Object.entries(open.answers).map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-ad-muted px-3 py-2">
                        <dt className="text-xs text-ad-muted-fg">{k}</dt>
                        <dd className="text-sm">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <Field label="Daxili qeyd" htmlFor="lead-note" hint="yalnız panel üçün">
                <Textarea
                  id="lead-note"
                  rows={3}
                  defaultValue={open.note}
                  onBlur={(e) => {
                    if (e.target.value !== open.note) update.mutate({ id: open.id, note: e.target.value });
                  }}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <ConfirmDialog
                title="Müraciət silinsin?"
                description="Qeyd birdəfəlik silinir."
                onConfirm={() => remove.mutateAsync(open.id)}
                trigger={
                  <Button variant="ghost" className="text-ad-danger hover:bg-ad-danger/10">
                    <Trash2 />
                    Sil
                  </Button>
                }
              />
              <Button variant="outline" onClick={() => setOpen(null)}>
                Bağla
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
