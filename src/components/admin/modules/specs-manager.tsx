"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { unwrap } from "@/actions/result";
import {
  createSpecGroup,
  createSpecItem,
  deleteSpecGroup,
  deleteSpecItem,
  listSpecs,
  reorderSpecGroups,
  reorderSpecItems,
  updateSpecGroup,
  updateSpecItem,
  type SpecGroupRow,
  type SpecItemRow,
} from "@/actions/specs";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { emptyLocalized, type Localized } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";
import { SortableList } from "../sortable-list";
import { Button } from "../ui/button";
import { Card, CardBody } from "../ui/card";
import { ConfirmDialog } from "../ui/confirm";
import { EmptyState } from "../ui/empty";
import { TableSkeleton } from "../ui/skeleton";

const CELL = "w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-ad-fg transition-colors hover:border-ad-border focus:border-ad-accent focus:bg-ad-bg focus:outline-none";

/**
 * "Standart göstəricilər" — an inline-editable table. Every cell is an input
 * that saves on blur / Enter when its value changed; groups and rows can be
 * dragged into order. No dialogs: the table *is* the form.
 */
export function SpecsManager({ initial }: { initial?: SpecGroupRow[] }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["specs"], queryFn: async () => unwrap(await listSpecs()), initialData: initial });
  const [groups, setGroups] = useState<SpecGroupRow[]>([]);
  const [source, setSource] = useState<SpecGroupRow[] | undefined>(undefined);
  // fresh server data replaces the local (optimistically reordered) list
  if (query.data && source !== query.data) {
    setSource(query.data);
    setGroups(query.data);
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ["specs"] });
  const onError = (e: Error) => {
    toast.error(e.message);
    invalidate();
  };

  const addGroup = useMutation({ mutationFn: async () => unwrap(await createSpecGroup({ name: { az: "Yeni qrup", en: "", ru: "" } })), onSuccess: invalidate, onError });
  const removeGroup = useMutation({ mutationFn: async (id: string) => unwrap(await deleteSpecGroup(id)), onSuccess: () => { toast.success("Qrup silindi"); invalidate(); }, onError });
  const reorderGroups = useMutation({ mutationFn: async (ids: string[]) => unwrap(await reorderSpecGroups({ ids })), onSuccess: () => toast.success("Sıra yadda saxlanıldı"), onError });
  const addItem = useMutation({
    mutationFn: async (groupId: string) => unwrap(await createSpecItem({ groupId, name: { az: "Yeni sətir", en: "", ru: "" }, value: "—", unit: "" })),
    onSuccess: invalidate,
    onError,
  });
  const removeItem = useMutation({ mutationFn: async (id: string) => unwrap(await deleteSpecItem(id)), onSuccess: () => { toast.success("Sətir silindi"); invalidate(); }, onError });
  const reorderItems = useMutation({ mutationFn: async (ids: string[]) => unwrap(await reorderSpecItems({ ids })), onSuccess: () => toast.success("Sıra yadda saxlanıldı"), onError });

  if (query.isLoading) return <TableSkeleton rows={4} />;
  if (query.isError) {
    return (
      <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
        {(query.error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ad-muted-fg">Xanaya klik edib yazın; fokusdan çıxanda yadda saxlanılır. Qrupları və sətirləri sürüşdürərək sıralayın.</p>
        <Button onClick={() => addGroup.mutate()} loading={addGroup.isPending}>
          <Plus />
          Qrup əlavə et
        </Button>
      </div>

      {!groups.length && <EmptyState title="Qrup yoxdur" description="İlk qrupu əlavə edin — hər qrup cədvəldə bir sahədir." />}

      <SortableList
        items={groups}
        onReorder={(next) => {
          setGroups(next);
          reorderGroups.mutate(next.map((g) => g.id));
        }}
        className="space-y-4"
        render={(group) => <GroupCard group={group} onChanged={invalidate} onAddItem={() => addItem.mutate(group.id)} onRemove={() => removeGroup.mutateAsync(group.id)} onRemoveItem={(id) => removeItem.mutateAsync(id)} onReorderItems={(ids) => reorderItems.mutate(ids)} />}
      />
    </div>
  );
}

function GroupCard({
  group,
  onChanged,
  onAddItem,
  onRemove,
  onRemoveItem,
  onReorderItems,
}: {
  group: SpecGroupRow;
  onChanged: () => void;
  onAddItem: () => void;
  onRemove: () => Promise<unknown>;
  onRemoveItem: (id: string) => Promise<unknown>;
  onReorderItems: (ids: string[]) => void;
}) {
  const [items, setItems] = useState(group.items);
  const [source, setSource] = useState(group.items);
  if (source !== group.items) {
    setSource(group.items);
    setItems(group.items);
  }

  return (
    <Card data-group={group.name.az}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ad-border px-5 py-3">
        <InlineLocalized value={group.name} label="Sahə" className="w-full max-w-md font-semibold" onSave={async (name) => { unwrap(await updateSpecGroup(group.id, { name })); onChanged(); }} />
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            <Plus />
            Sətir
          </Button>
          <ConfirmDialog
            title="Qrup silinsin?"
            description="Qrupdakı bütün sətirlər də silinəcək."
            onConfirm={onRemove}
            trigger={
              <Button type="button" variant="ghost" size="icon" aria-label="Qrupu sil" className="text-ad-danger hover:bg-ad-danger/10">
                <Trash2 />
              </Button>
            }
          />
        </div>
      </div>
      <CardBody>
        <div className="mb-1 grid grid-cols-[32px_1fr_1fr_120px_36px] gap-2 px-1 text-xs font-medium uppercase tracking-wide text-ad-muted-fg">
          <span />
          <span>Yanaşma</span>
          <span>Alət və platforma</span>
          <span>Vəziyyət</span>
          <span />
        </div>
        {items.length ? (
          <SortableList
            items={items}
            onReorder={(next) => {
              setItems(next);
              onReorderItems(next.map((i) => i.id));
            }}
            render={(item) => <ItemRow item={item} onChanged={onChanged} onRemove={() => onRemoveItem(item.id)} />}
          />
        ) : (
          <p className="px-1 py-2 text-sm text-ad-muted-fg">Sətir yoxdur.</p>
        )}
      </CardBody>
    </Card>
  );
}

function ItemRow({ item, onChanged, onRemove }: { item: SpecItemRow; onChanged: () => void; onRemove: () => Promise<unknown> }) {
  const save = async (patch: Partial<Pick<SpecItemRow, "name" | "value" | "unit">>) => {
    unwrap(await updateSpecItem(item.id, { groupId: item.groupId, name: item.name, value: item.value, unit: item.unit, ...patch }));
    onChanged();
  };
  return (
    <div className="grid grid-cols-[1fr_1fr_120px_36px] items-center gap-2">
      <InlineLocalized value={item.name} label="Yanaşma" onSave={(name) => save({ name })} />
      <InlineText value={item.value} label="Alət" onSave={(value) => save({ value })} />
      <InlineText value={item.unit} label="Vəziyyət" onSave={(unit) => save({ unit })} />
      <ConfirmDialog
        title="Sətir silinsin?"
        description="Bu əməliyyat geri qaytarılmır."
        onConfirm={onRemove}
        trigger={
          <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10">
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

/** Input that commits on blur / Enter, only when the text changed. */
function InlineText({ value, onSave, label, className, allowEmpty = false }: { value: string; onSave: (v: string) => Promise<unknown>; label: string; className?: string; allowEmpty?: boolean }) {
  const [text, setText] = useState(value);
  const [source, setSource] = useState(value);
  const [busy, setBusy] = useState(false);
  if (source !== value) {
    setSource(value);
    setText(value);
  }

  async function commit() {
    const next = text.trim();
    if (next === value) return;
    if (!next && !allowEmpty) {
      setText(value);
      return;
    }
    setBusy(true);
    try {
      await onSave(next);
      toast.success("Yadda saxlanıldı");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xəta");
      setText(value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <input
      aria-label={label}
      value={text}
      disabled={busy}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setText(value);
      }}
      className={cn(CELL, busy && "opacity-60", className)}
    />
  );
}

/** Same, for a { az, en, ru } value: tiny language toggle + one input. */
function InlineLocalized({ value, onSave, label, className }: { value: Localized; onSave: (v: Localized) => Promise<unknown>; label: string; className?: string }) {
  const [locale, setLocale] = useState<Locale>("az");
  const current = { ...emptyLocalized(), ...value };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <InlineText key={locale} value={current[locale] ?? ""} label={`${label} (${locale})`} allowEmpty={locale !== "az"} onSave={(text) => onSave({ ...current, [locale]: text })} />
      <span className="inline-flex shrink-0 rounded border border-ad-border">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={cn("relative px-1.5 py-0.5 text-[10px] font-medium uppercase text-ad-muted-fg", locale === l && "bg-ad-muted text-ad-fg")}
            aria-pressed={locale === l}
          >
            {l}
            {!current[l]?.trim() && <span className="absolute right-0 top-0 size-1 rounded-full bg-amber-400" />}
          </button>
        ))}
      </span>
    </div>
  );
}
