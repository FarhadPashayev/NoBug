"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";

type Status = "idle" | "sending" | "sent" | "error";
type Errors = Partial<Record<"name" | "email" | "subject", string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The 3-field enquiry form. Progressive enhancement: without JavaScript it
 * POSTs form-encoded data to /api/leads, which answers with a redirect; with
 * JavaScript it validates inline, sends JSON and swaps in the confirmation.
 */
export function ContactForm({ lang, t, tone = "navy" }: { lang: Locale; t: Dictionary; tone?: "navy" | "template" }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    if (!String(data.get("name") ?? "").trim()) e.name = t.fieldRequired;
    const email = String(data.get("email") ?? "").trim();
    if (!email) e.email = t.fieldRequired;
    else if (!EMAIL_RE.test(email)) e.email = t.fieldEmailInvalid;
    if (!String(data.get("subject") ?? "").trim()) e.subject = t.fieldRequired;
    return e;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(errs.name ? "k2-name" : errs.email ? "k2-mail" : "k2-msg")?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          website: data.get("website"),
          lang,
          openedAt: openedAt.current,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="type-body mt-5 border-t border-navy-line pt-5" role="status">
        {t.formSent}
      </p>
    );
  }

  const cls = `field-underline ${tone === "template" ? "field-underline-tpl" : "field-underline-navy"}`;

  return (
    <form method="post" action="/api/leads" onSubmit={onSubmit} className="mt-5 grid gap-7" noValidate>
      {/* no-JS path: the route reads these from the form-encoded body */}
      <input type="hidden" name="source" value="contact" />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="openedAt" value="0" />

      <Field id="k2-name" label={t.fieldName} error={errors.name}>
        <input id="k2-name" name="name" type="text" required maxLength={120} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "k2-name-err" : undefined} className={cls} />
      </Field>
      <Field id="k2-mail" label={t.fieldEmail} error={errors.email}>
        <input id="k2-mail" name="email" type="email" required maxLength={160} autoComplete="email" inputMode="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "k2-mail-err" : undefined} className={cls} />
      </Field>
      <Field id="k2-msg" label={t.fieldMessage} error={errors.subject}>
        <input id="k2-msg" name="subject" type="text" required maxLength={300} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "k2-msg-err" : undefined} className={cls} />
      </Field>

      {/* honeypot — invisible to people, ignored by assistive tech */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="k2-website">Website</label>
        <input id="k2-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={status === "sending"} className={tone === "template" ? "pill pill-yellow w-full justify-center sm:w-auto" : "btn-primary btn-primary-paper w-full sm:w-auto"}>
          {status === "sending" ? t.formSending : t.formSubmit}
        </button>
        {status === "error" && (
          <span className="type-small text-body-navy" role="alert">
            {t.formError}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label mb-2 block text-muted-navy">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="type-small mt-2 text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
