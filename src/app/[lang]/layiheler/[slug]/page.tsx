import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getProject } from "@/lib/content";
import { sanitizeRichText } from "@/lib/sanitize";
import { absoluteUrl } from "@/lib/site";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { Logo } from "@/components/ui/logo";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Rendered on demand from the database; project actions revalidate it.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getProject(lang, slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.shortDescription,
    alternates: { canonical: absoluteUrl(`/${lang}/layiheler/${slug}`), languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}/layiheler/${slug}`)])) },
  };
}

/** Project write-up: the Tiptap content from the panel, sanitized again on the way out. */
export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const p = await getProject(lang, slug);
  if (!p) notFound();
  const t = getDict(lang);
  const paths = Object.fromEntries(LOCALES.map((l) => [l, `/layiheler/${slug}`])) as Record<Locale, string>;
  const meta = [p.year && `${t.caseStudy.labels[3]}: ${p.year}`, p.duration && `${t.caseStudy.labels[1]}: ${p.duration}`].filter(Boolean).join(" · ");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy-line bg-navy">
        <div className="mx-auto flex min-h-[72px] max-w-[1080px] flex-wrap items-center gap-4 px-[clamp(20px,5vw,64px)] py-3">
          <Logo href={`/${lang}`} variant="mark" height={26} />
          <Link href={`/${lang}#layiheler`} className="link-rule mr-auto text-[15px] text-muted-navy hover:text-paper">
            {t.home}
          </Link>
          <LangSwitcher current={lang} paths={paths} />
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[clamp(20px,5vw,64px)] pb-24 pt-[clamp(40px,6vw,80px)]">
        <article className="max-w-[68ch]">
          {meta && <div className="mono-label text-muted">{meta}</div>}
          <h1 className="type-h2 mt-4">{p.title}</h1>
          {p.shortDescription && <p className="type-body mt-6 text-muted">{p.shortDescription}</p>}
          {p.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <li key={tag} className="mono-label rounded-full border border-hairline px-3 py-1">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {p.coverUrl && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[20px] bg-light">
              <Image src={p.coverUrl} alt="" fill sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" unoptimized />
            </div>
          )}
          <div className="mt-8 h-px bg-navy" />
          {p.content ? (
            <div className="rich-text mt-8" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.content) }} />
          ) : (
            <p className="type-body mt-8 text-muted">{t.tpl.readMore}…</p>
          )}
        </article>
      </main>
    </>
  );
}
