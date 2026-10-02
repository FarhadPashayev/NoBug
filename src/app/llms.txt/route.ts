import { getSiteContent } from "@/lib/content";
import { LEGAL, LEGAL_KEYS, legalHref } from "@/lib/legal";
import { getDict } from "@/lib/i18n/dict";
import { LOCALES } from "@/lib/i18n/config";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// https://llmstxt.org — a short, link-rich map of the site for language
// models. Built from the same content the pages render (database first,
// dictionary fallback), in Azerbaijani with the other languages linked.
export const revalidate = 3600;

export async function GET() {
  const c = await getSiteContent("az");
  const t = getDict("az");
  const lines = [
    "# nobug",
    "",
    `> ${t.meta.description}`,
    "",
    `${c.hero.title} ${c.hero.subtitle}`,
    "",
    "## Xidmətlər",
    "",
    ...c.services.map((s) => `- [${s.name}](${absoluteUrl(`/az/xidmetler/${s.slug}`)}): ${s.shortDescription}`),
    "",
    "## Layihələr",
    "",
    ...c.projects.map((p) => `- [${p.title}](${absoluteUrl(`/az/layiheler/${p.slug}`)}): ${p.shortDescription}`),
    "",
    "## Tez-tez verilən suallar",
    "",
    ...c.faq.map((f) => `- ${f.question} ${f.answer}`),
    "",
    "## Əlaqə",
    "",
    `- Sorğu forması: ${absoluteUrl("/az/anket")}`,
    `- E-poçt: ${c.settings.email}`,
    ...(c.settings.phones.length ? [`- Telefon: ${c.settings.phones.join(", ")}`] : []),
    ...(c.settings.address ? [`- Ünvan: ${c.settings.address}`] : []),
    "",
    "## Hüquqi",
    "",
    ...LEGAL_KEYS.map((k) => `- [${LEGAL.az[k].title}](${absoluteUrl(legalHref("az", k))})`),
    "",
    "## Dillər",
    "",
    ...LOCALES.map((l) => `- ${l.toUpperCase()}: ${absoluteUrl(`/${l}`)}`),
    "",
    "## Optional",
    "",
    `- [Tam versiya](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
