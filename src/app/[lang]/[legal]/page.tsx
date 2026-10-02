import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { LEGAL, LEGAL_KEYS, LEGAL_SLUGS, legalHref, legalKeyFromSlug } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";
import { getLegalEntity } from "@/lib/content";
import { notFoundMetadata } from "@/lib/not-found";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { Logo } from "@/components/ui/logo";

type Props = { params: Promise<{ lang: string; legal: string }> };

// the entity block comes from Sayt parametrləri: re-rendered when the panel saves, hourly otherwise
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => LEGAL_KEYS.map((key) => ({ lang, legal: LEGAL_SLUGS[lang][key] })));
}

const ENTITY_LABELS: Record<Locale, { title: string; taxId: string; address: string }> = {
  az: { title: "Rekvizitlər", taxId: "VÖEN", address: "Qeydiyyat ünvanı" },
  en: { title: "Company details", taxId: "Tax ID (VÖEN)", address: "Registered address" },
  ru: { title: "Реквизиты", taxId: "ИНН (VÖEN)", address: "Юридический адрес" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, legal } = await params;
  if (!isLocale(lang)) return {};
  const key = legalKeyFromSlug(lang, legal);
  if (!key) return notFoundMetadata(lang);
  const doc = LEGAL[lang][key];
  return {
    title: doc.title,
    description: doc.intro,
    alternates: {
      canonical: absoluteUrl(legalHref(lang, key)),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(legalHref(l, key))])), "x-default": absoluteUrl(legalHref("az", key)) },
    },
  };
}

/** Typography-only legal page: ≤68ch measure, mono eyebrow with the update date, no images. */
export default async function LegalPage({ params }: Props) {
  const { lang, legal } = await params;
  if (!isLocale(lang)) notFound();
  const key = legalKeyFromSlug(lang, legal);
  if (!key) notFound();
  const doc = LEGAL[lang][key];
  const t = getDict(lang);
  const entity = await getLegalEntity(lang);
  const hasEntity = Boolean(entity.name || entity.taxId || entity.address);
  const labels = ENTITY_LABELS[lang];
  const paths = Object.fromEntries(LOCALES.map((l) => [l, `/${LEGAL_SLUGS[l][key]}`])) as Record<Locale, string>;

  return (
    <>
      {/* first node of the segment: Next scrolls it into view on client navigation — never the sticky header */}
      <span aria-hidden="true" className="block h-0" />
      <header className="sticky top-0 z-40 border-b border-navy-line bg-navy">
        <div className="mx-auto flex min-h-[72px] max-w-[1080px] flex-wrap items-center gap-4 px-[clamp(20px,5vw,64px)] py-3">
          <Logo href={`/${lang}`} variant="mark" height={26} />
          <Link href={`/${lang}`} className="link-rule mr-auto text-[15px] text-muted-navy hover:text-paper">
            {t.home}
          </Link>
          <LangSwitcher current={lang} paths={paths} />
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[clamp(20px,5vw,64px)] pb-24 pt-[clamp(40px,6vw,80px)]">
        <article className="max-w-[68ch]">
          <div className="mono-label text-muted">{doc.updated}</div>
          <h1 className="type-h2 mt-4">{doc.title}</h1>
          <p className="type-body mt-6 text-muted">{doc.intro}</p>
          <div className="mt-8 h-px bg-navy" />

          {doc.sections.map((s) => (
            <section key={s.h} className="mt-10">
              <h2 className="text-[22px] font-medium leading-[1.24] tracking-[-0.015em]">{s.h}</h2>
              {s.p?.map((para) => (
                <p key={para} className="type-body mt-4">
                  {para}
                </p>
              ))}
              {s.list && (
                <ul className="type-body mt-4 list-disc space-y-1.5 pl-6 marker:text-muted">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {hasEntity && (
            <section className="mt-10" aria-labelledby="entity">
              <h2 id="entity" className="text-[22px] font-medium leading-[1.24] tracking-[-0.015em]">
                {labels.title}
              </h2>
              <dl className="type-body mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5">
                {entity.name && (
                  <>
                    <dt className="text-muted">{t.footerCols[1][0]}</dt>
                    <dd className="m-0">{entity.name}</dd>
                  </>
                )}
                {entity.taxId && (
                  <>
                    <dt className="text-muted">{labels.taxId}</dt>
                    <dd className="m-0 font-mono">{entity.taxId}</dd>
                  </>
                )}
                {entity.address && (
                  <>
                    <dt className="text-muted">{labels.address}</dt>
                    <dd className="m-0">{entity.address}</dd>
                  </>
                )}
              </dl>
            </section>
          )}

          <div className="mt-14 border-t border-hairline pt-6">
            <p className="type-small text-muted">{doc.note}</p>
          </div>

          <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            {LEGAL_KEYS.filter((k) => k !== key).map((k) => (
              <Link key={k} href={legalHref(lang, k)} className="text-link">
                {LEGAL[lang][k].title}
              </Link>
            ))}
          </nav>
        </article>
      </main>
    </>
  );
}
