import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CHANNEL_IDS, getSurvey, resolveService } from "@/lib/anket/survey";
import { LOCALES } from "@/lib/i18n/config";
import { clientIp, isRateLimited, looksLikeBot } from "@/lib/anti-spam";
import { escapeHtml, formatDate, isEmail, MAIL_TO, sendMail } from "@/lib/mail/send";
import { recordLead } from "@/lib/admin/leads";

export const runtime = "nodejs";

// ── schema ────────────────────────────────────────────────────────────
const Payload = z.object({
  lang: z.enum(LOCALES).default("az"),
  service: z.union([z.string(), z.number()]).transform((v) => resolveService(String(v))),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()])).default({}),
  name: z.string().trim().min(1).max(120),
  channel: z.enum(CHANNEL_IDS),
  contact: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true),
  website: z.string().optional(), // honeypot
  openedAt: z.number(),
});

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) return bad("Too many requests", 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  // Honeypot / timing — bots get a 200 so they learn nothing.
  const probe = raw as { website?: unknown; openedAt?: unknown };
  if (looksLikeBot(probe?.website, probe?.openedAt)) return NextResponse.json({ ok: true });

  const parsed = Payload.safeParse(raw);
  if (!parsed.success) return bad("Validation failed");
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

  // ── email to the enquiry mailbox ─────────────────────────────────────
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
  const html = `
    <div style="font-family:'Inter Tight',Inter,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0B1F3A">
      <h2 style="margin:0 0 20px;font-weight:500">${escapeHtml(subject)}</h2>
      <table style="border-collapse:collapse">${fields
        .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6B6862;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;vertical-align:top;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
        .join("")}</table>
    </div>`;

  // the panel's inbox keeps a copy; failures here never block the enquiry
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

  try {
    await sendMail({ to: MAIL_TO, subject, text, html, replyTo: body.channel === "email" ? body.contact : undefined });
    if (body.channel === "email") {
      await sendMail({ to: body.contact, subject: sv.confirmSubject, text: sv.confirmBody(body.name, serviceName) });
    }
  } catch (err) {
    console.error("[api/anket] send failed:", err);
    return bad("Mail delivery failed", 502);
  }

  return NextResponse.json({ ok: true });
}
