"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { ShowcaseCopy } from "@/lib/i18n/showcase";
import { contactSchema, type ContactField } from "@/lib/contact-schema";
import { fetchWithTimeout } from "@/lib/fetch";

export type ContactFormCopy = ShowcaseCopy["form"] & { submit: string; sending: string; sent: string; error: string; required: string; emailInvalid: string; nameInvalid: string };

type Status = "idle" | "sending" | "sent" | "error";
const ORDER: ContactField[] = ["name", "company", "phone", "email", "service", "budget", "message"];

/**
 * Enquiry form of the home page. Validated with the same zod schema the API
 * uses; works without JavaScript too (form-encoded POST → redirect back).
 */
export function ContactForm({ lang, t, services, preset }: { lang: Locale; t: ContactFormCopy; services: string[]; preset?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const message = (field: ContactField, code: string) => {
    if (code === "required") return t.required;
    if (field === "email") return t.emailInvalid;
    if (field === "phone") return t.phoneInvalid;
    return t.nameInvalid;
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(ORDER.map((k) => [k, String(form.get(k) ?? "")]));
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<ContactField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as ContactField;
        errs[field] ??= message(field, issue.message);
      }
      setErrors(errs);
      const first = ORDER.find((k) => errs[k]);
      if (first) document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetchWithTimeout("/api/leads", {
        method: "POST",
        timeoutMs: 15_000,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "contact", ...parsed.data, website: form.get("website"), lang, openedAt: openedAt.current }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex items-start gap-4 rounded-[10px] bg-ink-900 p-8">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-yellow text-ink-950">
          <Check size={20} aria-hidden="true" />
        </span>
        <p className="text-[17px] leading-[1.5]">{t.sent}</p>
      </div>
    );
  }

  const input = "field-ink";
  const field = (k: ContactField) => ({ id: `cf-${k}`, name: k, "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `cf-${k}-err` : undefined, className: input });

  return (
    <form method="post" action="/api/leads" onSubmit={onSubmit} noValidate className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <input type="hidden" name="source" value="contact" />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="openedAt" value="0" />

      <Field id="name" label={t.name} error={errors.name}>
        <input {...field("name")} type="text" required maxLength={120} autoComplete="name" />
      </Field>
      <Field id="company" label={t.company} optional={t.optional} error={errors.company}>
        <input {...field("company")} type="text" maxLength={120} autoComplete="organization" />
      </Field>
      <Field id="phone" label={t.phone} optional={t.optional} error={errors.phone}>
        <input {...field("phone")} type="tel" maxLength={40} autoComplete="tel" inputMode="tel" placeholder="+994" />
      </Field>
      <Field id="email" label={t.email} error={errors.email}>
        <input {...field("email")} type="email" required maxLength={160} autoComplete="email" inputMode="email" />
      </Field>
      <Field id="service" label={t.service} optional={t.optional} error={errors.service}>
        <select {...field("service")} defaultValue={preset ?? ""}>
          <option value="">{t.servicePlaceholder}</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={t.serviceOther}>{t.serviceOther}</option>
        </select>
      </Field>
      <Field id="budget" label={t.budget} optional={t.optional} error={errors.budget}>
        <select {...field("budget")} defaultValue="">
          <option value="">{t.budgetPlaceholder}</option>
          {t.budgets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>
      <Field id="message" label={t.message} optional={t.optional} error={errors.message} wide>
        <textarea {...field("message")} rows={4} maxLength={2000} />
      </Field>

      {/* honeypot — invisible to people, ignored by assistive tech */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-[1.5] text-paper/60">{t.consent}</p>
        <button type="submit" disabled={status === "sending"} className="inline-flex min-h-12 flex-none items-center justify-center gap-2 rounded-full bg-yellow px-7 text-[15px] font-medium text-ink-950 transition-colors hover:bg-yellow-600 disabled:opacity-60">
          {status === "sending" ? t.sending : t.submit}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-[15px] text-[#ff8a80] sm:col-span-2">
          {t.error}
        </p>
      )}
    </form>
  );
}

function Field({ id, label, optional, error, wide, children }: { id: string; label: string; optional?: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={`cf-${id}`} className="mb-2 flex items-baseline gap-2 text-[13px] text-paper/60">
        {label}
        {optional && <span className="text-paper/60">· {optional}</span>}
      </label>
      {children}
      {error && (
        <p id={`cf-${id}-err`} role="alert" className="mt-2 text-[13px] text-[#ff8a80]">
          {error}
        </p>
      )}
    </div>
  );
}
