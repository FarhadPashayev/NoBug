"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { unwrap } from "@/actions/result";
import { getSettings, saveSettings } from "@/actions/settings";
import { emptyLocalized } from "@/lib/i18n/localized";
import { FOOTER_GROUPS, settingsSchema, type SettingsInput } from "@/schemas/settings";
import { LocalizedField, localizedError } from "../localized-field";
import { Button } from "../ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/card";
import { Field, Input, Select } from "../ui/field";
import { FormSkeleton } from "../ui/skeleton";

const EMPTY: SettingsInput = {
  phones: [],
  email: "",
  address: emptyLocalized(),
  hours: emptyLocalized(),
  linkedin: "",
  instagram: "",
  facebook: "",
  youtube: "",
  x: "",
  footerLinks: [],
};

const GROUP_LABELS: Record<(typeof FOOTER_GROUPS)[number], string> = { services: "Xidmətlər", company: "Şirkət", legal: "Hüquqi" };

/** Contact details, social links and footer navigation. Singleton row, replaced on save. */
export function SettingsManager() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: async () => unwrap(await getSettings()) });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema as never) as Resolver<SettingsInput>, defaultValues: EMPTY });
  const phones = useFieldArray({ control, name: "phones" });
  const links = useFieldArray({ control, name: "footerLinks" });

  useEffect(() => {
    if (query.data) reset({ ...EMPTY, ...query.data });
  }, [query.data, reset]);

  const save = useMutation({
    mutationFn: async (values: SettingsInput) => unwrap(await saveSettings(values)),
    onSuccess: () => {
      toast.success("Parametrlər yadda saxlanıldı");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error & { fieldErrors?: Record<string, string> }) => {
      for (const [path, message] of Object.entries(e.fieldErrors ?? {})) setError(path as Path<SettingsInput>, { message });
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
    <form onSubmit={handleSubmit((v) => save.mutateAsync(v))} className="space-y-6" noValidate>
      <Card>
        <CardHeader
          title="Əlaqə"
          description="Saytın Əlaqə bölməsi və footer."
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => phones.append({ value: "" })} disabled={phones.fields.length >= 5}>
              <Plus />
              Telefon
            </Button>
          }
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="E-poçt" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="salam@nobug.az" {...register("email")} />
          </Field>
          <div className="space-y-2">
            {phones.fields.map((f, i) => (
              <Field key={f.id} label={i === 0 ? "Telefon" : `Telefon ${i + 1}`} error={errors.phones?.[i]?.value?.message}>
                <div className="flex gap-2">
                  <Input placeholder="+994 XX XXX XX XX" {...register(`phones.${i}.value`)} />
                  <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="shrink-0 text-ad-danger hover:bg-ad-danger/10" onClick={() => phones.remove(i)}>
                    <Trash2 />
                  </Button>
                </div>
              </Field>
            ))}
            {!phones.fields.length && (
              <Field label="Telefon">
                <p className="text-sm text-ad-muted-fg">Nömrə əlavə olunmayıb — saytda göstərilmir.</p>
              </Field>
            )}
          </div>
          <LocalizedField control={control} name="address" label="Ünvan" placeholder="Bakı, Azərbaycan" error={localizedError(errors.address)} />
          <LocalizedField control={control} name="hours" label="İş saatları" placeholder="B.e — Cümə, 09:00 — 18:00" error={localizedError(errors.hours)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Sosial şəbəkələr" description="Boş olan göstərilmir." />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["linkedin", "instagram", "facebook", "youtube", "x"] as const).map((k) => (
            <Field key={k} label={{ linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", x: "X (Twitter)" }[k]} htmlFor={k} error={errors[k]?.message}>
              <Input id={k} placeholder="https://" {...register(k)} />
            </Field>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Footer linkləri"
          description="Sütun üzrə qruplaşdırılır; sıra yuxarıdan aşağı. Hüquqi səhifələr avtomatik göstərilir."
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => links.append({ group: "company", label: emptyLocalized(), url: "" })}>
              <Plus />
              Link əlavə et
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {links.fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 rounded-lg border border-ad-border p-3 sm:grid-cols-[150px_1fr_1fr_auto]">
              <Field label="Sütun">
                <Select {...register(`footerLinks.${i}.group`)}>
                  {FOOTER_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {GROUP_LABELS[g]}
                    </option>
                  ))}
                </Select>
              </Field>
              <LocalizedField control={control} name={`footerLinks.${i}.label`} label="Mətn" error={localizedError(errors.footerLinks?.[i]?.label)} />
              <Field label="Link" error={errors.footerLinks?.[i]?.url?.message}>
                <Input placeholder="#elaqe və ya /anket" {...register(`footerLinks.${i}.url`)} />
              </Field>
              <div className="flex items-end gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Yuxarı" disabled={i === 0} onClick={() => links.move(i, i - 1)}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Aşağı" disabled={i === links.fields.length - 1} onClick={() => links.move(i, i + 1)}>
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10" onClick={() => links.remove(i)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          {!links.fields.length && <p className="text-sm text-ad-muted-fg">Link əlavə olunmayıb.</p>}
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
