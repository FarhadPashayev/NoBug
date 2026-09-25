"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/admin/client";
import { heroSchema, partnerLogoSchema } from "@/lib/admin/schemas";
import { Button } from "../ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/card";
import { Field, Input, Textarea } from "../ui/field";
import { ImageDrop } from "../image-drop";

const formSchema = heroSchema.extend({ partnerLogos: z.array(partnerLogoSchema).max(20).default([]) });
type Values = z.infer<typeof formSchema>;

const EMPTY: Values = {
  locale: "az",
  eyebrow: "",
  title: "",
  subtitle: "",
  primaryLabel: "",
  primaryHref: "",
  secondaryLabel: "",
  secondaryHref: "",
  imageUrl: null,
  partnerLogos: [],
};

/** Hero is a singleton: one GET, one PUT that replaces the logo list. */
export function HeroManager() {
  const qc = useQueryClient();
  const hero = useQuery({ queryKey: ["hero"], queryFn: () => api<{ hero: Values | null }>("/api/admin/hero") });

  const form = useForm<Values>({ resolver: zodResolver(formSchema) as Resolver<Values>, defaultValues: EMPTY });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;
  const logos = useFieldArray({ control, name: "partnerLogos" });

  useEffect(() => {
    if (hero.data?.hero) reset({ ...EMPTY, ...hero.data.hero, partnerLogos: hero.data.hero.partnerLogos ?? [] });
  }, [hero.data, reset]);

  const save = useMutation({
    mutationFn: (values: Values) => api("/api/admin/hero", { method: "PUT", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Banner yadda saxlanıldı");
      qc.invalidateQueries({ queryKey: ["hero"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (hero.isError) {
    return (
      <p className="rounded-lg bg-ad-danger/10 px-4 py-3 text-sm text-ad-danger" role="alert">
        {(hero.error as Error).message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => save.mutateAsync(v))} className="space-y-6" noValidate>
      <Card>
        <CardHeader title="Mətn" description="Ana səhifənin ilk ekranı." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Üst başlıq" htmlFor="eyebrow" error={errors.eyebrow?.message} className="sm:col-span-2">
            <Input id="eyebrow" placeholder="nobug · Bakı · 2026-cı ildən" {...register("eyebrow")} />
          </Field>
          <Field label="Başlıq" htmlFor="title" error={errors.title?.message} className="sm:col-span-2">
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
          </Field>
          <Field label="Alt mətn" htmlFor="subtitle" error={errors.subtitle?.message} className="sm:col-span-2">
            <Textarea id="subtitle" rows={3} {...register("subtitle")} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Düymələr" description="Boş buraxılan düymə səhifədə göstərilmir." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Əsas düymə" htmlFor="primaryLabel" error={errors.primaryLabel?.message}>
            <Input id="primaryLabel" placeholder="Layihəni müzakirə et" {...register("primaryLabel")} />
          </Field>
          <Field label="Əsas düymənin linki" htmlFor="primaryHref" error={errors.primaryHref?.message}>
            <Input id="primaryHref" placeholder="/az/anket" {...register("primaryHref")} />
          </Field>
          <Field label="İkinci düymə" htmlFor="secondaryLabel" error={errors.secondaryLabel?.message}>
            <Input id="secondaryLabel" placeholder="Xidmətlərə bax" {...register("secondaryLabel")} />
          </Field>
          <Field label="İkinci düymənin linki" htmlFor="secondaryHref" error={errors.secondaryHref?.message}>
            <Input id="secondaryHref" placeholder="/az#xidmetler" {...register("secondaryHref")} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Vizual" />
        <CardBody>
          <Controller control={control} name="imageUrl" render={({ field }) => <ImageDrop label="Banner şəkli" value={field.value ?? null} onChange={field.onChange} />} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Partnyor loqoları"
          description="Bannerin altındakı sıra."
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => logos.append({ name: "", imageUrl: "", href: "", position: logos.fields.length })}>
              <Plus />
              Əlavə et
            </Button>
          }
        />
        <CardBody className="space-y-4">
          {logos.fields.map((f, i) => (
            <div key={f.id} className="grid gap-4 rounded-lg border border-ad-border p-4 sm:grid-cols-[200px_1fr_1fr_auto]">
              <Controller
                control={control}
                name={`partnerLogos.${i}.imageUrl`}
                render={({ field }) => <ImageDrop label="" value={field.value || null} onChange={(v) => field.onChange(v ?? "")} aspect="aspect-[3/2]" />}
              />
              <Field label="Ad" error={errors.partnerLogos?.[i]?.name?.message}>
                <Input {...register(`partnerLogos.${i}.name`)} />
              </Field>
              <Field label="Link" error={errors.partnerLogos?.[i]?.href?.message}>
                <Input placeholder="https://" {...register(`partnerLogos.${i}.href`)} />
              </Field>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10" onClick={() => logos.remove(i)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          {!logos.fields.length && <p className="text-sm text-ad-muted-fg">Loqo əlavə olunmayıb.</p>}
        </CardBody>
        <CardFooter>
          <Button type="submit" loading={save.isPending} disabled={!isDirty && !save.isPending}>
            Yadda saxla
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
