import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CHANNEL_IDS, getSurvey, resolveService } from "@/lib/anket/survey";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { clientIp, isRateLimited, looksLikeBot } from "@/lib/anti-spam";
import { escapeHtml, formatDate, isEmail, MAIL_TO, sendMail } from "@/lib/mail/send";
import { recordLead } from "@/lib/admin/leads";

export const runtime = "nodejs";

/**
 * POST /api/leads — the only way a lead is created. Two payload shapes, told
 * apart by `source`:
 *   "contact" — the 3-field form in the Əlaqə band (name · email · subject)
 *   "anket"   — the 3-step survey (service · answers · contact details)
 * Both: honeypot + fill-time check, per-IP rate limit, zod validation, a copy
 * in the panel's inbox, then the notification + confirmation emails.
 */

const bad = (message: string, status = 400, fieldErrors?: Record<string, string>) => NextResponse.json({ ok: false, error: message, ...(fieldErrors && { fieldErrors }) }, { status });
const fieldErrorsOf = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [i.path.join(".") || "_", i.message]));

/** Leads are never readable through the public API. */
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const Contact = z.object({
  source: z.literal("contact").default("contact"),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(160).refine(isEmail, "Invalid email"),
  subject: z.string().trim().min(1).max(300),
  lang: z.string().default("az"),
});

const Anket = z.object({
  source: z.literal("anket"),
  lang: z.enum(LOCALES).default("az"),
  service: z.union([z.string(), z.number()]).transform((v) => resolveService(String(v))),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()])).default({}),
  name: z.string().trim().min(1).max(120),
  channel: z.enum(CHANNEL_IDS),
  contact: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true),
});

const CONFIRM = {
  az: { subject: "nobug — sorğunuz qeydə alındı", body: (n: string) => `Salam, ${n}!\n\nSorğunuzu aldıq. Bir iş günü ərzində cavab veririk.\n\nnobug` },
  en: { subject: "nobug — your enquiry has been logged", body: (n: string) => `Hi ${n},\n\nWe received your enquiry and reply within one business day.\n\nnobug` },
  ru: { subject: "nobug — запрос зафиксирован", body: (n: string) => `Здравствуйте, ${n}!\n\nМы получили ваш запрос и отвечаем в течение одного рабочего дня.\n\nnobug` },
};

const wrap = (title: string, inner: string) => `
    <div style="font-family:'Inter Tight',Inter,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0B1F3A">
      <h2 style="margin:0 0 16px;font-weight:500">${escapeHtml(title)}</h2>${inner}
    </div>`;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) return bad("Too many requests", 429);

  // The contact form also works without JavaScript: a form-encoded POST is
  // answered with a redirect back to the Əlaqə band instead of JSON.
  const isForm = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded") ?? false;
  let raw: unknown;
  try {
    if (isForm) {
      const form = Object.fromEntries((await req.formData()).entries()) as Record<string, unknown>;
      raw = { ...form, openedAt: Number(form.openedAt ?? 0) };
    } else raw = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  const probe = raw as { website?: unknown; openedAt?: unknown; source?: unknown; lang?: unknown };
  const back = (ok: boolean) => NextResponse.redirect(new URL(`/${isLocale(String(probe?.lang)) ? probe.lang : "az"}?${ok ? "sent=1" : "error=1"}#elaqe`, req.url), 303);

  // Honeypot / timing — bots get a 200 so they learn nothing.
  if (looksLikeBot(probe?.website, probe?.openedAt)) return isForm ? back(true) : NextResponse.json({ ok: true });

  try {
    const res = probe?.source === "anket" ? await handleAnket(raw) : await handleContact(raw);
    return isForm ? back(res.status < 400) : res;
  } catch (err) {
    console.error("[api/leads] send failed:", err);
    return isForm ? back(false) : bad("Mail delivery failed", 502);
  }
}

async function handleContact(raw: unknown) {
  const parsed = Contact.safeParse(raw);
  if (!parsed.success) return bad("Validation failed", 400, fieldErrorsOf(parsed.error));
  const { name, email, subject: subjectLine } = parsed.data;
  const lang = isLocale(parsed.data.lang) ? parsed.data.lang : "az";
  const when = formatDate();

  await recordLead({ name, email, service: subjectLine, message: subjectLine, locale: lang, source: "contact" });

  const subject = `[nobug əlaqə] ${subjectLine} — ${name}`;
  const text = [`Ad: ${name}`, `E-poçt: ${email}`, `Mövzu: ${subjectLine}`, `Dil: ${lang}`, `Tarix: ${when}`].join("\n");
  const html = wrap(subjectLine, `<p style="margin:0 0 4px"><b>${escapeHtml(name)}</b> · ${escapeHtml(email)}</p><p style="margin:0;color:#6B6862">${escapeHtml(when)} · ${lang.toUpperCase()}</p>`);
  await sendMail({ to: MAIL_TO, subject, text, html, replyTo: email });
  const c = CONFIRM[lang];
  await sendMail({ to: email, subject: c.subject, text: c.body(name) });
  return NextResponse.json({ ok: true }, { status: 201 });
}

async function handleAnket(raw: unknown) {
  const parsed = Anket.safeParse(raw);
  if (!parsed.success) return bad("Validation failed", 400, fieldErrorsOf(parsed.error));
  const body = parsed.data;
  if (body.service === null) return bad("Unknown service");
  if (body.channel === "email" && !isEmail(body.contact)) return bad("Invalid email");

  const sv = getSurvey(body.lang);
  const serviceName = sv.services[body.service];
  const questions = sv.q[body.service];
  const channelLabel = sv.channels[CHANNEL_IDS.indexOf(body.channel)][0];

  // Resolve each answer against the question definition: the email carries the
  // exact label text, and only valid option values get through.
  const lines = questions.map(([label, options, multi], i) => {
    const rawAnswer = body.answers[String(i)];
    let value = "";
    if (multi === 1) value = Array.isArray(rawAnswer) ? rawAnswer.filter((o) => options.includes(o)).join(", ") : "";
    else if (typeof rawAnswer === "string" && options.includes(rawAnswer)) value = rawAnswer;
    return { label, value: value || "—" };
  });
  const when = formatDate();

  await recordLead({
    name: body.name,
    email: body.channel === "email" ? body.contact : "",
    phone: body.channel === "email" ? (body.phone ?? "") : body.contact,
    service: serviceName,
    message: body.message ?? "",
    locale: body.lang,
    source: "anket",
    answers: Object.fromEntries(lines.map((l) => [l.label, l.value])),
  });

  const subject = `Yeni müraciət — ${serviceName} — ${body.name}`;
  const fields: [string, string][] = [
    ["Xidmət / Service", serviceName],
    ["Ad Soyad / Name", body.name],
    [`Əlaqə / Contact (${channelLabel})`, body.contact],
    ...(body.phone ? ([["Telefon / Phone", body.phone]] as [string, string][]) : []),
    ...lines.map((l, i) => [`Sual ${i + 1} / Q${i + 1}: ${l.label}`, l.value] as [string, string]),
    ...(body.message ? ([["Mesaj / Message", body.message]] as [string, string][]) : []),
    ["Razılıq / Consent", "bəli / yes"],
    ["Dil / Locale", body.lang.toUpperCase()],
    ["Tarix / Timestamp", `${when} (Asia/Baku) · ${new Date().toISOString()}`],
  ];
  const text = fields.map(([k, v]) => `${k}:\n  ${v}`).join("\n\n");
  const html = wrap(
    subject,
    `<table style="border-collapse:collapse">${fields
      .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6B6862;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;vertical-align:top;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
      .join("")}</table>`,
  );
  await sendMail({ to: MAIL_TO, subject, text, html, replyTo: body.channel === "email" ? body.contact : undefined });
  if (body.channel === "email") await sendMail({ to: body.contact, subject: sv.confirmSubject, text: sv.confirmBody(body.name, serviceName) });
  return NextResponse.json({ ok: true }, { status: 201 });
}
