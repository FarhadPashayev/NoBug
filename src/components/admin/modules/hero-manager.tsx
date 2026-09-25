"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { createPartnerLogo, deletePartnerLogo, getHero, reorderPartnerLogos, saveHero, updatePartnerLogo } from "@/actions/hero";
import { unwrap } from "@/actions/result";
import { emptyLocalized } from "@/lib/i18n/localized";
import { heroSchema, partnerLogoSchema, type HeroInput, type PartnerLogoInput } from "@/schemas/hero";
import { ImageDrop } from "../image-drop";
import { LocalizedField, localizedError } from "../localized-field";
import { SortableList } from "../sortable-list";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/card";
import { ConfirmDialog } from "../ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "../ui/dialog";
import { Field, Input } from "../ui/field";
import { FormSkeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";

const EMPTY: HeroInput = {
  title: emptyLocalized(),
  subtitle: emptyLocalized(),
  primaryCtaLabel: emptyLocalized(),
  primaryCtaUrl: "",
  secondaryCtaLabel: emptyLocalized(),
  secondaryCtaUrl: "",
  heroImage: { url: null, path: null },
};

type Logo = { id: string; name: string; logoUrl: string; logoPath: string | null; url: string; isActive: boolean; order: number };

/** Hero is a singleton form; partner logos are a separate sortable list. */
type HeroData = { hero: HeroInput | null; logos: Logo[] };

export function HeroManager({ initial }: { initial?: HeroData }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["hero"], queryFn: async (): Promise<HeroData> => unwrap(await getHero()), initialData: initial });

  const form = useForm<HeroInput>({ resolver: zodResolver(heroSchema as never) as Resolver<HeroInput>, defaultValues: EMPTY });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (query.data?.hero) reset(query.data.hero);
  }, [query.data, reset]);

  const save = useMutation({
    mutationFn: async (values: HeroInput) => unwrap(await saveHero(values)),
    onSuccess: () => {
      toast.success("Banner yadda saxlanıldı");
      qc.invalidateQueries({ queryKey: ["hero"] });
    },
    onError: (e: Error & { fieldErrors?: Record<string, string> }) => {
      for (const [path, message] of Object.entries(e.fieldErrors ?? {})) setError(path as Path<HeroInput>, { message });
      toast.error(e.message);
    },
  });

  if (query.isLoading) return <FormSkeleton cards={3} />;
  if (query.isError) {
    return (
      <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
        {(query.error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit((v) => save.mutateAsync(v))} className="space-y-6" noValidate>
        <Card>
          <CardHeader title="Mətn" description="Ana səhifənin ilk ekranı. Hər sahə üçün AZ / EN / RU tab-ları var." />
          <CardBody className="space-y-4">
            <LocalizedField control={control} name="title" label="Başlıq" error={localizedError(errors.title)} />
            <LocalizedField control={control} name="subtitle" label="Alt mətn" kind="textarea" rows={3} error={localizedError(errors.subtitle)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Düymələr" description="Boş buraxılan düymə səhifədə göstərilmir. Link `/anket` kimi yazılır — dil prefiksi avtomatik əlavə olunur." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <LocalizedField control={control} name="primaryCtaLabel" label="Əsas düymə" error={localizedError(errors.primaryCtaLabel)} />
            <Field label="Əsas düymənin linki" htmlFor="primaryCtaUrl" error={errors.primaryCtaUrl?.message}>
              <Input id="primaryCtaUrl" placeholder="/anket" {...register("primaryCtaUrl")} />
            </Field>
            <LocalizedField control={control} name="secondaryCtaLabel" label="İkinci düymə" error={localizedError(errors.secondaryCtaLabel)} />
            <Field label="İkinci düymənin linki" htmlFor="secondaryCtaUrl" error={errors.secondaryCtaUrl?.message}>
              <Input id="secondaryCtaUrl" placeholder="#xidmetler" {...register("secondaryCtaUrl")} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Vizual" description="Boş olduqda animasiyalı loqo göstərilir." />
          <CardBody>
            <Controller control={control} name="heroImage" render={({ field }) => <ImageDrop label="Banner şəkli" folder="hero" value={field.value} onChange={(v) => field.onChange(v ?? { url: null, path: null })} />} />
          </CardBody>
          <CardFooter>
            <Button type="submit" loading={save.isPending} disabled={!isDirty && !save.isPending}>
              Yadda saxla
            </Button>
          </CardFooter>
        </Card>
      </form>

      <PartnerLogos logos={query.data?.logos ?? []} />
    </div>
  );
}

const EMPTY_LOGO: PartnerLogoInput = { name: "", logo: { url: null, path: null }, url: "", isActive: true };

function PartnerLogos({ logos }: { logos: Logo[] }) {
  const qc = useQueryClient();
  const [items, setItems] = useState(logos);
  const [source, setSource] = useState(logos);
  const [editing, setEditing] = useState<Logo | null>(null);
  const [open, setOpen] = useState(false);
  // fresh server data replaces the local (optimistically reordered) list
  if (source !== logos) {
    setSource(logos);
    setItems(logos);
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hero"] });
  const form = useForm<PartnerLogoInput>({ resolver: zodResolver(partnerLogoSchema as never) as Resolver<PartnerLogoInput>, defaultValues: EMPTY_LOGO });

  useEffect(() => {
    if (open) form.reset(editing ? { name: editing.name, logo: { url: editing.logoUrl, path: editing.logoPath }, url: editing.url, isActive: editing.isActive } : EMPTY_LOGO);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async (v: PartnerLogoInput) => unwrap(editing ? await updatePartnerLogo(editing.id, v) : await createPartnerLogo(v)),
    onSuccess: () => {
      toast.success(editing ? "Loqo yeniləndi" : "Loqo əlavə olundu");
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await deletePartnerLogo(id)),
    onSuccess: () => {
      toast.success("Loqo silindi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reorder = useMutation({
    mutationFn: async (ids: string[]) => unwrap(await reorderPartnerLogos({ ids })),
    onSuccess: () => toast.success("Sıra yadda saxlanıldı"),
    onError: (e: Error) => {
      toast.error(e.message);
      setItems(logos);
    },
  });

  return (
    <Card>
      <CardHeader
        title="Partnyor loqoları"
        description="Bannerin altındakı sıra. Sürüşdürərək sıralayın; qeyri-aktiv loqo saytda görünmür."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
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
      <CardBody>
        {items.length ? (
          <SortableList
            items={items}
            disabled={reorder.isPending}
            onReorder={(next) => {
              setItems(next);
              reorder.mutate(next.map((l) => l.id));
            }}
            render={(l) => (
              <div className="flex items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-white">
                  <Image src={l.logoUrl} alt="" fill sizes="40px" className="object-contain p-1" unoptimized />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{l.name}</span>
                  <span className="block truncate text-xs text-ad-muted-fg">{l.url || "—"}</span>
                </span>
                {!l.isActive && <Badge tone="neutral">Gizli</Badge>}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Redaktə et"
                  onClick={() => {
                    setEditing(l);
                    setOpen(true);
                  }}
                >
                  <Pencil />
                </Button>
                <ConfirmDialog
                  title="Loqo silinsin?"
                  description="Fayl da anbardan silinəcək."
                  onConfirm={() => remove.mutateAsync(l.id)}
                  trigger={
                    <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10">
                      <Trash2 />
                    </Button>
                  }
                />
              </div>
            )}
          />
        ) : (
          <p className="text-sm text-ad-muted-fg">Loqo əlavə olunmayıb — bölmə saytda göstərilmir.</p>
        )}
      </CardBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={editing ? "Loqo: redaktə" : "Yeni loqo"} className="w-[min(92vw,520px)]">
          <form onSubmit={form.handleSubmit((v) => save.mutateAsync(v))} noValidate className="contents">
            <DialogBody className="space-y-4">
              <Controller
                control={form.control}
                name="logo"
                render={({ field, fieldState }) => (
                  <div>
                    <ImageDrop label="Loqo" folder="partners" value={field.value} onChange={(v) => field.onChange(v ?? { url: null, path: null })} aspect="aspect-[3/1]" />
                    {fieldState.error && <p className="mt-1 text-xs text-ad-danger">{fieldState.error.message}</p>}
                  </div>
                )}
              />
              <Field label="Ad" htmlFor="logo-name" error={form.formState.errors.name?.message}>
                <Input id="logo-name" {...form.register("name")} />
              </Field>
              <Field label="Link" htmlFor="logo-url" error={form.formState.errors.url?.message}>
                <Input id="logo-url" placeholder="https://" {...form.register("url")} />
              </Field>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <label className="flex items-center gap-3 text-sm">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    Saytda göstər
                  </label>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İmtina
              </Button>
              <Button type="submit" loading={save.isPending}>
                Yadda saxla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
