import { NextResponse, type NextRequest } from "next/server";
import { CHANNEL_IDS, getSurvey, parseServiceIndex, type AnketPayload, type ChannelId } from "@/lib/anket/survey";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { clientIp, isRateLimited, looksLikeBot } from "@/lib/anti-spam";
import { escapeHtml, formatDate, isEmail, MAIL_TO, sendMail } from "@/lib/mail/send";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) return bad("Too many requests", 429);

  let body: Partial<AnketPayload>;
  try {
    body = (await req.json()) as Partial<AnketPayload>;
  } catch {
    return bad("Invalid JSON");
  }

  // Bots get a 200 so they don't learn anything.
  if (looksLikeBot(body.website, body.openedAt)) return NextResponse.json({ ok: true });

  // ── validation ──────────────────────────────────────────────────────
  const lang: Locale = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "az";
  const sv = getSurvey(lang);

  const serviceIdx = parseServiceIndex(String(body.service ?? ""));
  if (serviceIdx === null) return bad("Unknown service");
  const serviceName = sv.services[serviceIdx];
  const questions = sv.q[serviceIdx];

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  if (!name) return bad("Name is required");

  const channelIdx = CHANNEL_IDS.indexOf(body.channel as ChannelId);
  if (channelIdx < 0) return bad("Channel is required");
  const channelLabel = sv.channels[channelIdx][0];

  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 160) : "";
  if (!contact) return bad("Contact is required");
  if (body.channel === "email" && !isEmail(contact)) return bad("Invalid email");

  if (body.consent !== true) return bad("Consent is required");

  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  // Resolve each answer against the question definition: the email carries the
  // exact label text, and only valid option values get through.
  const lines = questions.map(([label, options, multi], i) => {
    const raw = answers[i];
    let value = "";
    if (multi === 1) {
      value = Array.isArray(raw) ? raw.filter((o) => options.includes(o)).join(", ") : "";
    } else if (typeof raw === "string" && options.includes(raw)) {
      value = raw;
    }
    return { label, value: value || "—" };
  });

  const when = formatDate();

  // ── email to nobug ──────────────────────────────────────────────────
  const subject = `${sv.mailTag} ${serviceName} — ${name}`;
  const text = [
    `${sv.mailService}: ${serviceName}`,
    `${sv.mailName}: ${name}`,
    `${sv.mailContact}: ${channelLabel} — ${contact}`,
    `${sv.mailDate}: ${when}`,
    "",
    ...lines.flatMap((l, i) => [`${i + 1}. ${l.label}`, `   → ${l.value}`, ""]),
  ].join("\n");

  const html = `
    <div style="font-family:'Inter Tight',Inter,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0B1F3A">
      <h2 style="margin:0 0 16px;font-weight:500">${escapeHtml(serviceName)} — ${escapeHtml(name)}</h2>
      <p style="margin:0 0 4px"><b>${escapeHtml(sv.mailContact)}:</b> ${escapeHtml(channelLabel)} — ${escapeHtml(contact)}</p>
      <p style="margin:0 0 20px;color:#6B6862">${escapeHtml(when)} · ${lang.toUpperCase()}</p>
      <ol style="padding-left:20px">
        ${lines.map((l) => `<li style="margin:0 0 14px"><div style="color:#6B6862">${escapeHtml(l.label)}</div><div><b>${escapeHtml(l.value)}</b></div></li>`).join("")}
      </ol>
    </div>`;

  try {
    await sendMail({ to: MAIL_TO, subject, text, html, replyTo: body.channel === "email" ? contact : undefined });
    if (body.channel === "email") {
      await sendMail({ to: contact, subject: sv.confirmSubject, text: sv.confirmBody(name, serviceName) });
    }
  } catch (err) {
    console.error("[api/anket] send failed:", err);
    return bad("Mail delivery failed", 502);
  }

  return NextResponse.json({ ok: true });
}
