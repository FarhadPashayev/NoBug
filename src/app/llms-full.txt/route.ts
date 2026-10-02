import { getSiteContent } from "@/lib/content";
import { LEGAL, LEGAL_KEYS, legalHref } from "@/lib/legal";
import { getDict } from "@/lib/i18n/dict";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";

// The long form of /llms.txt: every language, service details, project
// write-ups (plain text), figures, standards and the FAQ answers.
export const revalidate = 3600;

const plain = (html: string) =>
  html
    .replace(/<\/(p|li|h[1-6]|blockquote|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const HEADINGS: Record<Locale, { services: string; projects: string; figures: string; standards: string; faq: string; contact: string; legal: string }> = {
  az: { services: "Xidmətlər", projects: "Layihələr", figures: "Göstəricilər", standards: "Standartlar", faq: "Tez-tez verilən suallar", contact: "Əlaqə", legal: "Hüquqi" },
  en: { services: "Services", projects: "Projects", figures: "Figures", standards: "Standards", faq: "FAQ", contact: "Contact", legal: "Legal" },
  ru: { services: "Услуги", projects: "Проекты", figures: "Показатели", standards: "Стандарты", faq: "Частые вопросы", contact: "Контакты", legal: "Юридическая информация" },
};

export async function GET() {
  const out: string[] = ["# nobug — full", ""];
  for (const l of LOCALES) {
    const c = await getSiteContent(l);
    const t = getDict(l);
    const h = HEADINGS[l];
    out.push(`# ${l.toUpperCase()} — ${absoluteUrl(`/${l}`)}`, "", `> ${t.meta.description}`, "", `${c.hero.title} ${c.hero.subtitle}`, "");
    out.push(`## ${h.services}`, "");
    for (const s of c.services) {
      out.push(`### ${s.name}`, `${absoluteUrl(`/${l}/xidmetler/${s.slug}`)}`, "", s.shortDescription);
      if (s.details) out.push("", plain(s.details));
      out.push("");
    }
    out.push(`## ${h.projects}`, "");
    for (const p of c.projects) {
      out.push(`### ${p.title}`, `${absoluteUrl(`/${l}/layiheler/${p.slug}`)}`, "", p.shortDescription);
      if (p.duration || p.year) out.push(`${[p.year, p.duration].filter(Boolean).join(" · ")}`);
      if (p.content) out.push("", plain(p.content));
      out.push("");
    }
    out.push(`## ${h.figures}`, "", ...c.stats.map((s) => `- ${s.value} — ${s.label}${s.source ? ` (${s.source})` : ""}`), "");
    out.push(`## ${h.standards}`, "", ...c.specs.map((s) => `- ${s.area}: ${s.approach}${s.tooling ? ` — ${s.tooling}` : ""}${s.status ? ` (${s.status})` : ""}`), "");
    if (c.faq.length) out.push(`## ${h.faq}`, "", ...c.faq.flatMap((f) => [`### ${f.question}`, f.answer, ""]));
    out.push(`## ${h.contact}`, "", `- ${absoluteUrl(`/${l}/anket`)}`, `- ${c.settings.email}`, ...c.settings.phones.map((p) => `- ${p}`), ...(c.settings.address ? [`- ${c.settings.address}`] : []), ...(c.settings.hours ? [`- ${c.settings.hours}`] : []), "");
    out.push(`## ${h.legal}`, "", ...LEGAL_KEYS.map((k) => `- [${LEGAL[l][k].title}](${absoluteUrl(legalHref(l, k))})`), "", "---", "");
  }
  return new Response(out.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
