"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/admin/client";
import { settingsSchema, type SettingsInput } from "@/lib/admin/schemas";
import { Button } from "../ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/card";
import { Field, Input, Select } from "../ui/field";

const EMPTY: SettingsInput = {
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  hours: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  footerNote: "",
  footerLinks: [],
};

const COLUMNS = [
  { value: "services", label: "Xidmətlər" },
  { value: "company", label: "Şirkət" },
  { value: "legal", label: "Hüquqi" },
  { value: "contact", label: "Əlaqə" },
] as const;

/** Contact details + footer link columns. Singleton row, replaced on save. */
export function SettingsManager() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: () => api<{ settings: SettingsInput | null }>("/api/admin/settings") });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema) as Resolver<SettingsInput>, defaultValues: EMPTY });
  const links = useFieldArray({ control, name: "footerLinks" });

  useEffect(() => {
    if (query.data?.settings) reset({ ...EMPTY, ...query.data.settings, footerLinks: query.data.settings.footerLinks ?? [] });
  }, [query.data, reset]);

  const save = useMutation({
    mutationFn: (values: SettingsInput) => api("/api/admin/settings", { method: "PUT", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Parametrlər yadda saxlanıldı");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
        <CardHeader title="Əlaqə" description="Saytın Əlaqə bölməsi və footer." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="E-poçt" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="salam@nobug.az" {...register("email")} />
          </Field>
          <Field label="Telefon" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" placeholder="+994 XX XXX XX XX" {...register("phone")} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
            <Input id="whatsapp" placeholder="+994 XX XXX XX XX" {...register("whatsapp")} />
          </Field>
          <Field label="İş saatları" htmlFor="hours" error={errors.hours?.message}>
            <Input id="hours" placeholder="B.e — Cümə, 09:00 — 18:00" {...register("hours")} />
          </Field>
          <Field label="Ünvan" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" placeholder="Bakı, Azərbaycan" {...register("address")} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Sosial şəbəkələr" />
        <CardBody className="grid gap-4 sm:grid-cols-3">
          <Field label="LinkedIn" htmlFor="linkedin" error={errors.linkedin?.message}>
            <Input id="linkedin" placeholder="https://linkedin.com/company/…" {...register("linkedin")} />
          </Field>
          <Field label="Instagram" htmlFor="instagram" error={errors.instagram?.message}>
            <Input id="instagram" placeholder="https://instagram.com/…" {...register("instagram")} />
          </Field>
          <Field label="Facebook" htmlFor="facebook" error={errors.facebook?.message}>
            <Input id="facebook" placeholder="https://facebook.com/…" {...register("facebook")} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Footer linkləri"
          description="Sütun üzrə qruplaşdırılır; sıra yuxarıdan aşağı."
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => links.append({ column: "company", label: "", href: "", position: links.fields.length })}>
              <Plus />
              Link əlavə et
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {links.fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 rounded-lg border border-ad-border p-3 sm:grid-cols-[160px_1fr_1fr_auto]">
              <Field label="Sütun">
                <Select {...register(`footerLinks.${i}.column`)}>
                  {COLUMNS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mətn" error={errors.footerLinks?.[i]?.label?.message}>
                <Input {...register(`footerLinks.${i}.label`)} />
              </Field>
              <Field label="Link" error={errors.footerLinks?.[i]?.href?.message}>
                <Input placeholder="/az#elaqe" {...register(`footerLinks.${i}.href`)} />
              </Field>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" aria-label="Sil" className="text-ad-danger hover:bg-ad-danger/10" onClick={() => links.remove(i)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          {!links.fields.length && <p className="text-sm text-ad-muted-fg">Link əlavə olunmayıb.</p>}

          <Field label="Footer qeydi" htmlFor="footerNote" error={errors.footerNote?.message} className="pt-2">
            <Input id="footerNote" placeholder='© 2026 "nobug" MMC' {...register("footerNote")} />
          </Field>
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
