"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ lang, t, tone = "navy" }: { lang: Locale; t: Dictionary; tone?: "navy" | "template" }) {
  const [status, setStatus] = useState<Status>("idle");
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-7" noValidate>
      <Field id="k2-name" label={t.fieldName}>
        <input id="k2-name" name="name" type="text" required autoComplete="name" className={`field-underline ${tone === "template" ? "field-underline-tpl" : "field-underline-navy"}`} />
      </Field>
      <Field id="k2-mail" label={t.fieldEmail}>
        <input id="k2-mail" name="email" type="email" required autoComplete="email" inputMode="email" className={`field-underline ${tone === "template" ? "field-underline-tpl" : "field-underline-navy"}`} />
      </Field>
      <Field id="k2-msg" label={t.fieldMessage}>
        <input id="k2-msg" name="subject" type="text" required className={`field-underline ${tone === "template" ? "field-underline-tpl" : "field-underline-navy"}`} />
      </Field>

      {/* honeypot — invisible to people */}
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

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label mb-2 block text-muted-navy">
        {label}
      </label>
      {children}
    </div>
  );
}
