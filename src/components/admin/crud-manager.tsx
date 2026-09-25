"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { unwrap, type ActionResult } from "@/actions/result";
import { cn } from "@/lib/utils";
import type { MediaFolder } from "@/lib/supabase";
import { DataTable, type Column } from "./data-table";
import { ImageDrop, type ImageValue } from "./image-drop";
import { LocalizedField, localizedError } from "./localized-field";
import { RichEditor } from "./rich-editor";
import { SortableList } from "./sortable-list";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "./ui/dialog";
import { EmptyState } from "./ui/empty";
import { Field, Input, Select, Textarea } from "./ui/field";
import { TableSkeleton } from "./ui/skeleton";
import { Switch } from "./ui/switch";

export type FieldSpec<T> = {
  name: Path<T>;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "select" | "image" | "tags" | "localized";
  /** localized: which control renders under the language tabs */
  kind?: "input" | "textarea" | "rich";
  /** image: storage folder */
  folder?: MediaFolder;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
  rows?: number;
};

export type CrudActions<Values, Row> = {
  list: () => Promise<ActionResult<Row[]>>;
  create: (values: Values) => Promise<ActionResult<unknown>>;
  update: (id: string, values: Values) => Promise<ActionResult<unknown>>;
  remove: (id: string) => Promise<ActionResult<unknown>>;
  reorder?: (input: { ids: string[] }) => Promise<ActionResult<unknown>>;
};

/**
 * One screen for a content collection: list (search/sort/paginate), a create
 * and edit dialog driven by the same zod schema as the server action, a
 * confirmed delete and — when `reorder` is given — a drag-and-drop order
 * dialog. Fields are declared, not hand-written, so the collections stay
 * consistent and adding one is a few lines.
 */
export function CrudManager<Values extends FieldValues, Row extends { id: string }>({
  queryKey,
  actions,
  schema,
  emptyValues,
  fields,
  columns,
  itemLabel,
  toForm,
  rowLabel,
  searchPlaceholder,
  filters,
  initialRows,
}: {
  queryKey: string;
  actions: CrudActions<Values, Row>;
  schema: z.ZodType<Values, unknown>;
  emptyValues: DefaultValues<Values>;
  fields: FieldSpec<Values>[];
  columns: Column<Row>[];
  itemLabel: string;
  /** map a row to form values when editing */
  toForm: (row: Row) => DefaultValues<Values>;
  /** text shown per row in the reorder dialog */
  rowLabel?: (row: Row) => string;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  /** rows fetched by the server page — skips the first client round trip */
  initialRows?: Row[];
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [ordering, setOrdering] = useState<Row[] | null>(null);

  const list = useQuery({ queryKey: [queryKey], queryFn: async () => unwrap(await actions.list()), initialData: initialRows });

  // the schema's `.default()`s make its input type looser than its output;
  // the resolver is cast once here rather than at every call site
  const form = useForm<Values>({ resolver: zodResolver(schema as never) as Resolver<Values>, defaultValues: emptyValues });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(editing ? toForm(editing) : emptyValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens for a row
  }, [open, editing]);

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const onActionError = (e: Error & { fieldErrors?: Record<string, string> }) => {
    for (const [path, message] of Object.entries(e.fieldErrors ?? {})) setError(path as Path<Values>, { message });
    toast.error(e.message);
  };

  const save = useMutation({
    mutationFn: async (values: Values) => unwrap(editing ? await actions.update(editing.id, values) : await actions.create(values)),
    onSuccess: () => {
      toast.success(editing ? "Yeniləndi" : "Əlavə olundu");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: onActionError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await actions.remove(id)),
    onSuccess: () => {
      toast.success("Silindi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => unwrap(await actions.reorder!({ ids })),
    onSuccess: () => {
      toast.success("Sıra yadda saxlanıldı");
      setOrdering(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  const actionsColumn: Column<Row> = {
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

  const addButton = (
    <Button
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus />
      Əlavə et
    </Button>
  );

  if (list.isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {list.isError && (
        <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
          {(list.error as Error).message}
        </p>
      )}

      <DataTable
        rows={rows}
        columns={[...columns, actionsColumn]}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        loading={list.isFetching}
        empty={<EmptyState title={`${itemLabel} yoxdur`} description="İlk qeydi əlavə edin." action={addButton} />}
        toolbar={
          <div className="flex gap-2">
            {actions.reorder && rowLabel && rows.length > 1 && (
              <Button variant="outline" onClick={() => setOrdering(rows)}>
                <ArrowUpDown />
                Sıra
              </Button>
            )}
            {addButton}
          </div>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={editing ? `${itemLabel}: redaktə` : `Yeni ${itemLabel.toLocaleLowerCase("az")}`} className="w-[min(94vw,760px)]">
          <form onSubmit={handleSubmit((v) => save.mutateAsync(v))} noValidate className="contents">
            <DialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => {
                  const errorNode = (errors as Record<string, unknown>)[f.name as string];
                  const error = f.type === "localized" ? localizedError(errorNode) : (errorNode as { message?: string } | undefined)?.message;
                  const id = `f-${String(f.name)}`;
                  const wide = f.full || f.type === "textarea" || f.type === "image" || f.type === "localized";

                  if (f.type === "localized") {
                    return (
                      <LocalizedField
                        key={String(f.name)}
                        control={control}
                        name={f.name}
                        label={f.label}
                        hint={f.hint}
                        error={error}
                        placeholder={f.placeholder}
                        rows={f.rows}
                        kind={f.kind === "rich" ? "custom" : (f.kind ?? "input")}
                        className="sm:col-span-2"
                        renderEditor={f.kind === "rich" ? ({ value, onChange, locale }) => <RichEditor key={locale} value={value} onChange={onChange} /> : undefined}
                      />
                    );
                  }

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
                          render={({ field }) => (
                            <ImageDrop label="" folder={f.folder ?? "projects"} value={(field.value as ImageValue | null) ?? null} onChange={(v) => field.onChange(v ?? { url: null, path: null })} aspect="aspect-[16/9]" />
                          )}
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
                              defaultValue={Array.isArray(field.value) ? field.value.join(", ") : ""}
                              onBlur={(e) =>
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

      {actions.reorder && rowLabel && (
        <Dialog open={!!ordering} onOpenChange={(o) => !o && setOrdering(null)}>
          <DialogContent title="Sıranı dəyiş" description="Sürüşdürərək düzün; yuxarıdakı saytda birinci göstərilir." className="w-[min(92vw,520px)]">
            <DialogBody>
              {ordering && <SortableList items={ordering} onReorder={setOrdering} render={(row, i) => <span className="block truncate text-sm"><span className="mr-2 font-mono text-xs text-ad-muted-fg">{i + 1}</span>{rowLabel(row)}</span>} />}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOrdering(null)}>
                İmtina
              </Button>
              <Button type="button" loading={reorder.isPending} onClick={() => ordering && reorder.mutate(ordering.map((r) => r.id))}>
                Yadda saxla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
