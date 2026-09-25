"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Mail, Phone, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteLead, exportLeadsCsv, listLeads, updateLead } from "@/actions/leads";
import { unwrap } from "@/actions/result";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadFilter, type LeadStatus } from "@/schemas/leads";
import { formatDate } from "@/lib/utils";
import { DataTable } from "../data-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "../ui/dialog";
import { Field, Input, Select, Textarea } from "../ui/field";
import { TableSkeleton } from "../ui/skeleton";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  locale: string;
  source: string;
  status: LeadStatus;
  notes: string;
  answers: unknown;
  createdAt: Date;
};

const TONES: Record<LeadStatus, "accent" | "warning" | "success" | "neutral"> = { NEW: "accent", IN_PROGRESS: "warning", CONTACTED: "success", ARCHIVED: "neutral" };
const EMPTY_FILTER: LeadFilter = { q: "", status: "", from: "", to: "" };

/**
 * Read-only inbox: a submission itself is never edited — only its status and
 * an internal note. Status, date range and text filters run on the server;
 * the result set (capped) is searched, sorted and paginated in the table.
 */
type LeadsData = { items: Lead[]; total: number; capped: boolean; fresh: number };

export function LeadsInbox({ initial }: { initial?: LeadsData }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<LeadFilter>(EMPTY_FILTER);
  const [open, setOpen] = useState<Lead | null>(null);
  const unfiltered = !filter.q && !filter.status && !filter.from && !filter.to;

  const list = useQuery({
    queryKey: ["leads", filter],
    queryFn: async (): Promise<LeadsData> => unwrap(await listLeads(filter)) as LeadsData,
    // the server page fetched the unfiltered inbox; filtered views load on demand
    initialData: unfiltered ? initial : undefined,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["leads"] });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: LeadStatus; notes?: string }) => unwrap(await updateLead(id, data)),
    onSuccess: (row) => {
      toast.success("Yeniləndi");
      setOpen((o) => (o && o.id === row.id ? { ...o, status: row.status, notes: row.notes } : o));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteLead(id)),
    onSuccess: () => {
      toast.success("Silindi");
      setOpen(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = useMutation({
    mutationFn: async () => unwrap(await exportLeadsCsv(filter)),
    onSuccess: (csv) => {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `nobug-muracietler-${new Date().toISOString().slice(0, 10)}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const leads = (list.data?.items ?? []) as Lead[];
  const active = filter.status || filter.from || filter.to;

  if (list.isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {list.isError && (
        <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
          {(list.error as Error).message}
        </p>
      )}
      {list.data?.capped && <p className="text-xs text-ad-muted-fg">Yalnız ilk 1000 nəticə göstərilir — filtri daraldın.</p>}

      <DataTable
        rows={leads}
        loading={list.isFetching}
        searchPlaceholder="Ad, e-poçt, mesaj…"
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as LeadFilter["status"] }))} aria-label="Status" className="w-auto min-w-40">
              <option value="">Bütün statuslar</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Input type="date" value={filter.from} max={filter.to || undefined} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))} aria-label="Başlanğıc tarix" className="w-auto" />
            <span className="text-xs text-ad-muted-fg">—</span>
            <Input type="date" value={filter.to} min={filter.from || undefined} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))} aria-label="Son tarix" className="w-auto" />
            {active && (
              <Button variant="ghost" size="sm" onClick={() => setFilter(EMPTY_FILTER)}>
                <X />
                Təmizlə
              </Button>
            )}
          </div>
        }
        toolbar={
          <Button variant="outline" onClick={() => exportCsv.mutate()} loading={exportCsv.isPending} disabled={!leads.length}>
            <Download />
            CSV
          </Button>
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
          { key: "message", header: "Mesaj", value: (l) => l.message, cell: (l) => <span className="line-clamp-2 max-w-[28ch] text-ad-muted-fg">{l.message || "—"}</span> },
          {
            key: "status",
            header: "Status",
            value: (l) => LEAD_STATUS_LABELS[l.status],
            cell: (l) => (
              <Select value={l.status} onChange={(e) => update.mutate({ id: l.id, status: e.target.value as LeadStatus })} aria-label="Status" className="h-8 w-auto min-w-36 text-xs">
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            ),
            className: "w-44",
          },
          { key: "createdAt", header: "Tarix", value: (l) => new Date(l.createdAt).getTime(), cell: (l) => <span className="whitespace-nowrap text-ad-muted-fg">{formatDate(l.createdAt)}</span>, className: "w-44" },
        ]}
      />

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        {open && (
          <DialogContent title={open.name} description={`${formatDate(open.createdAt)} · ${open.source} · ${open.locale.toUpperCase()}`}>
            <DialogBody className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={TONES[open.status]}>{LEAD_STATUS_LABELS[open.status]}</Badge>
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
              {!!open.answers && typeof open.answers === "object" && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ad-muted-fg">Sorğu cavabları</p>
                  <dl className="mt-2 space-y-2">
                    {Object.entries(open.answers as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-ad-muted px-3 py-2">
                        <dt className="text-xs text-ad-muted-fg">{k}</dt>
                        <dd className="text-sm">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <Field label="Status" htmlFor="lead-status">
                <Select id="lead-status" value={open.status} onChange={(e) => update.mutate({ id: open.id, status: e.target.value as LeadStatus })}>
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Daxili qeyd" htmlFor="lead-notes" hint="yalnız panel üçün; fokusdan çıxanda saxlanılır">
                <Textarea
                  id="lead-notes"
                  rows={3}
                  key={open.id}
                  defaultValue={open.notes}
                  onBlur={(e) => {
                    if (e.target.value !== open.notes) update.mutate({ id: open.id, notes: e.target.value });
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
