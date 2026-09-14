"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { CHANNEL_IDS, getSurvey, resolveService, type AnketPayload } from "@/lib/anket/survey";
import { LEGACY_ORDER } from "@/lib/services";
import { legalHref } from "@/lib/legal";
import { CONTACT_EMAIL } from "@/lib/site";
import { track } from "@/lib/analytics";

type Step = 1 | 2 | 3;
type Answers = Record<number, string | string[] | null>;
type FieldErrors = Partial<Record<"name" | "contact" | "consent", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SurveyForm({ lang }: { lang: Locale }) {
  const sv = getSurvey(lang);
  const router = useRouter();
  const params = useSearchParams();
  const preselected = resolveService(params.get("xidmet"));

  const [step, setStepState] = useState<Step>(preselected !== null ? 2 : 1);
  const [service, setService] = useState<number | null>(preselected);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("");
  const [chan, setChan] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const serviceId = service === null ? null : LEGACY_ORDER[service];
  const questions = service === null ? [] : sv.q[service];
  const channel = chan === null ? null : sv.channels[chan];
  const channelId = chan === null ? null : CHANNEL_IDS[chan];
  const pct = sent ? 100 : step * 33.34;
  const serviceName = service === null ? "" : sv.services[service];

  function setStep(next: Step) {
    setStepState(next);
    if (serviceId) track({ name: "enquiry_step", params: { step: next, service_id: serviceId } });
  }

  function pickService(i: number) {
    setService(i);
    setAnswers({});
    setStepState(2);
    track({ name: "enquiry_start", params: { service_id: LEGACY_ORDER[i], locale: lang } });
    router.replace(`/${lang}/anket?xidmet=${LEGACY_ORDER[i]}`, { scroll: false });
  }

  function pickAnswer(qi: number, opt: string, multi: boolean) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (multi) {
        const cur = Array.isArray(prev[qi]) ? (prev[qi] as string[]) : [];
        next[qi] = cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt];
      } else {
        next[qi] = prev[qi] === opt ? null : opt;
      }
      return next;
    });
  }

  function reset() {
    setSent(false);
    setStepState(1);
    setService(null);
    setAnswers({});
    setName("");
    setChan(null);
    setVal("");
    setPhone("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setFailed(false);
    router.replace(`/${lang}/anket`, { scroll: false });
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = sv.errors.name;
    if (!channel || !val.trim()) e.contact = sv.errors.contact;
    else if (channelId === "email" && !EMAIL_RE.test(val.trim())) e.contact = sv.errors.email;
    if (!consent) e.consent = sv.errors.consent;
    return e;
  }

  async function submit() {
    if (sending || service === null || serviceId === null) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || channelId === null) {
      document.getElementById(e.name ? "sq-name" : e.contact ? "sq-contact" : "sq-consent")?.focus();
      return;
    }
    setSending(true);
    setFailed(false);
    const payload: AnketPayload = {
      lang,
      service: serviceId,
      answers,
      name: name.trim(),
      channel: channelId,
      contact: val.trim(),
      phone: channelId === "email" && phone.trim() ? phone.trim() : undefined,
      message: message.trim() || undefined,
      consent,
      website,
      openedAt: openedAt.current,
    };
    try {
      const res = await fetch("/api/anket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      track({ name: "enquiry_submit", params: { service_id: serviceId, locale: lang } });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-[clamp(24px,4vw,64px)]">
      {/* left: eyebrow, H1, note, step + progress rule */}
      <div className="min-w-0 max-w-[340px] flex-[1_1_240px]">
        <div className="mono-label text-muted">{sv.eyebrow}</div>
        <h1 className="mt-3 text-[clamp(26px,2.8vw,36px)] font-medium leading-[1.1] tracking-[-0.025em]">{sv.title}</h1>
        <p className="type-small mt-4 text-muted">{sv.note}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="mono-label flex-none text-muted" aria-live="polite">
            {sent ? "—" : `${sv.step} ${step} / 3`}
          </div>
          <div className="h-0.5 min-w-[80px] flex-1 bg-hairline" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-accent transition-[width] duration-[320ms] ease-[var(--ease-brand)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* right: the active step */}
      <div className="min-w-0 flex-[2_1_420px]">
        {sent ? (
          <div className="border-t border-navy pt-8" role="status">
            <h2 className="text-[clamp(22px,2.2vw,34px)] font-medium leading-[1.2] tracking-[-0.02em]">{sv.sentTitle}</h2>
            <p className="type-body mt-4 max-w-[56ch]">{sv.sentText}</p>
            <p className="type-body mt-3 max-w-[56ch] text-muted">{sv.sentNext}</p>
            <div className="mt-8 flex flex-wrap gap-3 *:flex-1 sm:*:flex-none">
              <Link href={`/${lang}`} className="btn-primary">
                {sv.home}
              </Link>
              <button type="button" onClick={reset} className="btn-secondary">
                {sv.again}
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          <div>
            <h2 className="border-b border-navy pb-3 text-[17px] font-medium leading-[1.4]">{sv.pick}</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-[clamp(16px,3vw,40px)]">
              {sv.services.map((title, i) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => pickService(i)}
                  data-selected={service === i}
                  className="group relative flex min-h-11 w-full items-baseline gap-4 border-0 border-b border-hairline bg-transparent px-3 py-[11px] text-left transition-colors duration-200 ease-[var(--ease-brand)] hover:bg-surface data-[selected=true]:bg-surface"
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 ease-[var(--ease-brand)] group-hover:scale-x-100 group-data-[selected=true]:scale-x-100" />
                  <span className="w-6 flex-none font-mono text-xs tracking-[0.08em] text-muted transition-colors group-hover:text-navy group-data-[selected=true]:text-navy">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 text-base font-medium leading-[1.3]">{title}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-[1.5] text-muted">{sv.pickNote}</p>
          </div>
        ) : step === 2 && service !== null ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-navy pb-4">
              <h2 className="mono-label text-muted">
                {sv.summary} — {serviceName}
              </h2>
              <button type="button" onClick={() => setStep(1)} className="text-link">
                {sv.change}
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-9">
              {questions.map(([label, options, multiFlag], qi) => {
                const multi = multiFlag === 1;
                const v = answers[qi];
                const selected = multi ? (Array.isArray(v) ? v : []) : v;
                return (
                  <fieldset key={label} className="m-0 border-0 p-0">
                    <legend className="flex flex-wrap items-baseline gap-4 p-0">
                      <span className="font-mono text-xs tracking-[0.08em] text-muted">0{qi + 1}</span>
                      <span className="text-[17px] font-medium leading-[1.4]">{label}</span>
                      {multi && <span className="mono-label text-muted">{sv.multi}</span>}
                    </legend>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {options.map((o) => {
                        const isSel = multi ? (selected as string[]).includes(o) : selected === o;
                        return (
                          <button key={o} type="button" onClick={() => pickAnswer(qi, o, multi)} data-selected={isSel} aria-pressed={isSel} className="chip">
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-3 *:flex-1 sm:*:flex-none">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                {sv.back}
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary">
                {sv.next}
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-navy pb-4">
              <h2 className="text-[17px] font-medium leading-[1.4]">{sv.contactTitle}</h2>
              <div className="mono-label text-muted">{serviceName}</div>
            </div>

            <div className="mt-8 flex flex-col gap-8">
              {/* name */}
              <div>
                <label htmlFor="sq-name" className="mono-label mb-2 block text-muted">
                  {sv.name}
                </label>
                <input
                  id="sq-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={sv.namePh}
                  autoComplete="name"
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "sq-name-err" : undefined}
                  className="field-underline"
                />
                {errors.name && <FieldError id="sq-name-err">{errors.name}</FieldError>}
              </div>

              {/* channel + exactly one matching field */}
              <fieldset className="m-0 border-0 p-0">
                <legend className="mono-label mb-3 p-0 text-muted">{sv.channel}</legend>
                <div className="flex flex-wrap gap-2">
                  {sv.channels.map(([label], i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setChan(i);
                        setVal("");
                        setErrors((e) => ({ ...e, contact: undefined }));
                      }}
                      data-selected={chan === i}
                      aria-pressed={chan === i}
                      className="chip"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {channel && (
                  <>
                    <label htmlFor="sq-contact" className="sr-only">
                      {channel[0]}
                    </label>
                    <input
                      key={chan}
                      id="sq-contact"
                      name={channelId === "email" ? "email" : "tel"}
                      type={channelId === "email" ? "email" : "tel"}
                      inputMode={channelId === "email" ? "email" : "tel"}
                      autoComplete={channelId === "email" ? "email" : "tel"}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={channel[1]}
                      required
                      aria-invalid={!!errors.contact}
                      aria-describedby={errors.contact ? "sq-contact-err" : undefined}
                      className="field-underline mt-4"
                      autoFocus
                    />
                  </>
                )}
                {errors.contact && <FieldError id="sq-contact-err">{errors.contact}</FieldError>}
              </fieldset>

              {/* optional phone — only when the chosen channel is email (otherwise the number is already captured) */}
              {channelId === "email" && (
                <div>
                  <label htmlFor="sq-phone" className="mono-label mb-2 block text-muted">
                    {sv.phone} <span className="normal-case tracking-normal">({sv.optional})</span>
                  </label>
                  <input id="sq-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994 XX XXX XX XX" className="field-underline" />
                </div>
              )}

              {/* optional message */}
              <div>
                <label htmlFor="sq-message" className="mono-label mb-2 block text-muted">
                  {sv.message} <span className="normal-case tracking-normal">({sv.optional})</span>
                </label>
                <textarea id="sq-message" name="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} className="field-underline resize-y leading-[1.5]" />
              </div>

              {/* consent — required, links to the privacy policy */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="sq-consent"
                    name="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setErrors((er) => ({ ...er, consent: undefined }));
                    }}
                    required
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "sq-consent-err" : undefined}
                    className="mt-0.5 h-5 w-5 flex-none cursor-pointer accent-navy"
                  />
                  <span className="type-small max-w-[62ch]">
                    {sv.consent}{" "}
                    <Link href={legalHref(lang, "privacy")} className="text-link" target="_blank" rel="noopener">
                      {sv.consentLink}
                    </Link>
                  </span>
                </label>
                {errors.consent && <FieldError id="sq-consent-err">{errors.consent}</FieldError>}
              </div>

              {/* honeypot — invisible to people */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="sq-website">Website</label>
                <input id="sq-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>

            {failed && (
              <p className="type-small mt-6 text-accent" role="alert">
                {sv.errorDirect}{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-link text-accent">
                  {CONTACT_EMAIL}
                </a>
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3 *:flex-1 sm:*:flex-none">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" disabled={sending}>
                {sv.back}
              </button>
              <button type="submit" disabled={sending} aria-busy={sending} className="btn-primary">
                {sending ? sv.sending : sv.send}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="type-small mt-2 text-accent" role="alert">
      {children}
    </p>
  );
}
