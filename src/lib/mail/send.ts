import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site";

export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

// Recipient / sender come from env. Sender MUST be on a domain verified in
// Resend (nobug.az with SPF + DKIM) — mail sent from Gmail lands in spam.
//
// MAIL_MODE:
//   "off"  — nothing is sent; the form still reports success and the message
//            is printed to the server log. Use until the nobug.az domain exists.
//   "send" — deliver via Resend (needs RESEND_API_KEY).
// Unset → "send" when RESEND_API_KEY is present, otherwise "off".
export const MAIL_TO = process.env.MAIL_TO ?? CONTACT_EMAIL;
export const MAIL_FROM = process.env.MAIL_FROM ?? "nobug <anket@nobug.az>";

export function mailMode(): "off" | "send" {
  const m = process.env.MAIL_MODE;
  if (m === "off" || m === "send") return m;
  return process.env.RESEND_API_KEY ? "send" : "off";
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (mailMode() === "off" || !apiKey) {
    console.log("\n[mail:off] message NOT sent (MAIL_MODE=off or no RESEND_API_KEY)");
    console.log(`To:       ${Array.isArray(msg.to) ? msg.to.join(", ") : msg.to}`);
    console.log(`From:     ${MAIL_FROM}`);
    if (msg.replyTo) console.log(`Reply-To: ${msg.replyTo}`);
    console.log(`Subject:  ${msg.subject}\n\n${msg.text}\n`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: MAIL_FROM,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    replyTo: msg.replyTo,
  });
  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function formatDate(d = new Date()): string {
  return d.toLocaleString("az-AZ", { timeZone: "Asia/Baku", dateStyle: "medium", timeStyle: "short" });
}
