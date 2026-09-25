"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { api } from "@/lib/admin/client";
import { cn } from "@/lib/utils";
import { DataTable, type Column } from "./data-table";
import { ImageDrop } from "./image-drop";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "./ui/dialog";
import { EmptyState } from "./ui/empty";
import { Field, Input, Select, Textarea } from "./ui/field";
import { Switch } from "./ui/switch";

export type FieldSpec<T> = {
  name: Path<T>;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "select" | "image" | "tags";
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
  rows?: number;
};

/**
 * One screen for a content collection: list (search/sort/paginate), a create
 * and edit dialog driven by the same zod schema as the API, and a confirmed
 * delete. Fields are declared, not hand-written, so the five collections stay
 * consistent and adding one is a few lines.
 */
export function CrudManager<Values extends FieldValues, Row extends { id: string }>({
  endpoint,
  queryKey,
  schema,
  emptyValues,
  fields,
  columns,
  itemLabel,
  rowsFrom = (data: { items: Row[] }) => data.items,
  toForm,
  searchPlaceholder,
}: {
  endpoint: string;
  queryKey: string;
  schema: z.ZodType<Values, unknown>;
  emptyValues: DefaultValues<Values>;
  fields: FieldSpec<Values>[];
  columns: Column<Row>[];
  itemLabel: string;
  rowsFrom?: (data: { items: Row[] }) => Row[];
  /** map a row to form values when editing (defaults to the row itself) */
  toForm?: (row: Row) => DefaultValues<Values>;
  searchPlaceholder?: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);

  const list = useQuery({ queryKey: [queryKey], queryFn: () => api<{ items: Row[] }>(endpoint) });

  // the schema's `.default()`s make its input type looser than its output;
  // the resolver is cast once here rather than at every call site
  const form = useForm<Values>({ resolver: zodResolver(schema as never) as Resolver<Values>, defaultValues: emptyValues });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(editing ? ((toForm?.(editing) ?? (editing as unknown)) as DefaultValues<Values>) : emptyValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens for a row
  }, [open, editing]);

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const save = useMutation({
    mutationFn: (values: Values) =>
      editing ? api(`${endpoint}/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) }) : api(endpoint, { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success(editing ? "Yeniləndi" : "Əlavə olundu");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`${endpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Silindi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ? rowsFrom(list.data) : [];

  const actions: Column<Row> = {
    key: "actions",
    header: "",
    className: "w-px whitespace-nowrap text-right",
    sortable: false,
    cell: (row) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Redaktə et"
          onClick={() => {
            setEditing(row);
            setOpen(true);
          }}
        >
          <Pencil />
        </Button>
        <ConfirmDialog
          title={`${itemLabel} silinsin?`}
          description="Bu əməliyyat geri qaytarılmır."
          onConfirm={() => remove.mutateAsync(row.id)}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10">
              <Trash2 />
            </Button>
          }
        />
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {list.isError && (
        <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
          {(list.error as Error).message}
        </p>
      )}

      <DataTable
        rows={rows}
        columns={[...columns, actions]}
        searchPlaceholder={searchPlaceholder}
        empty={
          list.isLoading ? (
            <EmptyState title="Yüklənir…" />
          ) : (
            <EmptyState
              title={`${itemLabel} yoxdur`}
              description="İlk qeydi əlavə edin."
              action={
                <Button
                  onClick={() => {
                    setEditing(null);
                    setOpen(true);
                  }}
                >
                  <Plus />
                  Əlavə et
                </Button>
              }
            />
          )
        }
        toolbar={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus />
            Əlavə et
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={editing ? `${itemLabel}: redaktə` : `Yeni ${itemLabel.toLocaleLowerCase("az")}`}>
          <form onSubmit={handleSubmit((v) => save.mutateAsync(v))} noValidate className="contents">
            <DialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => {
                  const error = (errors as Record<string, { message?: string }>)[f.name as string]?.message;
                  const id = `f-${String(f.name)}`;
                  const wide = f.full || f.type === "textarea" || f.type === "image";

                  return (
                    <Field key={String(f.name)} label={f.label} hint={f.hint} error={error} htmlFor={id} className={cn(wide && "sm:col-span-2")}>
                      {f.type === "textarea" && <Textarea id={id} rows={f.rows ?? 4} placeholder={f.placeholder} aria-invalid={!!error} {...register(f.name)} />}

                      {f.type === "text" && <Input id={id} placeholder={f.placeholder} aria-invalid={!!error} {...register(f.name)} />}

                      {f.type === "number" && <Input id={id} type="number" inputMode="numeric" aria-invalid={!!error} {...register(f.name, { valueAsNumber: true })} />}

                      {f.type === "select" && (
                        <Controller
                          control={control}
                          name={f.name}
                          render={({ field }) => (
                            <Select id={id} value={(field.value as string) ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}>
                              <option value="">—</option>
                              {f.options?.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        />
                      )}

                      {f.type === "switch" && (
                        <Controller
                          control={control}
                          name={f.name}
                          render={({ field }) => (
                            <div className="flex h-10 items-center">
                              <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} />
                            </div>
                          )}
                        />
                      )}

                      {f.type === "image" && (
                        <Controller
                          control={control}
                          name={f.name}
                          render={({ field }) => <ImageDrop label="" value={(field.value as string) ?? null} onChange={field.onChange} aspect="aspect-[16/9]" />}
                        />
                      )}

                      {f.type === "tags" && (
                        <Controller
                          control={control}
                          name={f.name}
                          render={({ field }) => (
                            <Input
                              id={id}
                              placeholder="vergüllə ayırın"
                              value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                )
                              }
                            />
                          )}
                        />
                      )}
                    </Field>
                  );
                })}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İmtina
              </Button>
              <Button type="submit" loading={isSubmitting || save.isPending}>
                Yadda saxla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
