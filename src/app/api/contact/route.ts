import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { clientIp, isRateLimited, looksLikeBot } from "@/lib/anti-spam";
import { escapeHtml, formatDate, isEmail, MAIL_TO, sendMail } from "@/lib/mail/send";

export const runtime = "nodejs";

// The short 3-field form in the Əlaqə band: name · email · subject.
export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  lang: string;
  website?: string; // honeypot
  openedAt: number;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

const CONFIRM = {
  az: { subject: "nobug — sorğunuz qeydə alındı", body: (n: string) => `Salam, ${n}!\n\nSorğunuzu aldıq. Bir iş günü ərzində cavab veririk.\n\nnobug` },
  en: { subject: "nobug — your enquiry has been logged", body: (n: string) => `Hi ${n},\n\nWe received your enquiry and reply within one business day.\n\nnobug` },
  ru: { subject: "nobug — запрос зафиксирован", body: (n: string) => `Здравствуйте, ${n}!\n\nМы получили ваш запрос и отвечаем в течение одного рабочего дня.\n\nnobug` },
};

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) return bad("Too many requests", 429);

  let body: Partial<ContactPayload>;
  try {
    body = (await req.json()) as Partial<ContactPayload>;
  } catch {
    return bad("Invalid JSON");
  }

  if (looksLikeBot(body.website, body.openedAt)) return NextResponse.json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 160) : "";
  const subjectLine = typeof body.subject === "string" ? body.subject.trim().slice(0, 300) : "";
  const lang = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "az";

  if (!name) return bad("Name is required");
  if (!isEmail(email)) return bad("Invalid email");
  if (!subjectLine) return bad("Subject is required");

  const when = formatDate();
  const subject = `[nobug əlaqə] ${subjectLine} — ${name}`;
  const text = [`Ad: ${name}`, `E-poçt: ${email}`, `Mövzu: ${subjectLine}`, `Dil: ${lang}`, `Tarix: ${when}`].join("\n");
  const html = `
    <div style="font-family:'Inter Tight',Inter,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0B1F3A">
      <h2 style="margin:0 0 16px;font-weight:500">${escapeHtml(subjectLine)}</h2>
      <p style="margin:0 0 4px"><b>${escapeHtml(name)}</b> · ${escapeHtml(email)}</p>
      <p style="margin:0;color:#6B6862">${escapeHtml(when)} · ${lang.toUpperCase()}</p>
    </div>`;

  try {
    await sendMail({ to: MAIL_TO, subject, text, html, replyTo: email });
    const c = CONFIRM[lang];
    await sendMail({ to: email, subject: c.subject, text: c.body(name) });
  } catch (err) {
    console.error("[api/contact] send failed:", err);
    return bad("Mail delivery failed", 502);
  }

  return NextResponse.json({ ok: true });
}
