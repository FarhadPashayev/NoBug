import type { SiteContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { coverFor } from "@/lib/covers";
import { buildChannels } from "@/components/chrome/channels";
import type { AboutData } from "@/components/chrome/site-chrome";
import type { ShowcaseCardData } from "@/components/showcase/hero-showcase";

// Turns the admin-panel content (lib/content) into what the showcase UI
// renders: carousel cards, the About drawer and the contact channels. Server
// only — the client components receive plain, already-localized props.

export const serviceHref = (lang: Locale, slug: string) => `/${lang}/xidmetler/${slug}`;
export const projectHref = (lang: Locale, slug: string) => `/${lang}/layiheler/${slug}`;

export function showcaseCards(lang: Locale, content: SiteContent): ShowcaseCardData[] {
  return content.services.map((s) => {
    const cover = coverFor(s.slug);
    return {
      slug: s.slug,
      title: s.name,
      description: s.shortDescription,
      href: serviceHref(lang, s.slug),
      imageUrl: s.imageUrl,
      pattern: cover.pattern,
      photo: cover.photo,
      alt: s.name,
    };
  });
}

export function aboutData(lang: Locale, content: SiteContent): AboutData {
  const d = getDict(lang);
  const sc = getShowcaseCopy(lang);
  const founded = d.tpl.founded[0];
  return {
    title: sc.drawer.title,
    labels: sc.drawer,
    who: [d.aboutP1, d.aboutP2],
    founded,
    mission: d.quote,
    services: content.services.map((s) => ({ name: s.name, href: serviceHref(lang, s.slug) })),
    // the founding year has its own slot above
    stats: content.stats.filter((s) => s.value !== founded).map((s) => ({ value: s.value, label: s.label })),
    team: [], // TODO(content): no team data in the panel yet
    process: sc.process,
  };
}

export function contactChannels(lang: Locale, content: SiteContent) {
  return buildChannels(content.settings, getShowcaseCopy(lang).channels);
}

export function chromeCopy(lang: Locale) {
  const sc = getShowcaseCopy(lang);
  return { about: sc.about, contact: sc.contact, close: sc.close };
}

/**
 * Placeholder reviews typed into the panel while it was being set up
 * ("Nümunə Müştəri", "Nümunə Müştəri 2", …) are never shown as real
 * clients. The section comes back by itself once a real review is added.
 */
export function realTestimonials(content: SiteContent) {
  return content.testimonials.filter((r) => !r.name.trim().toLocaleLowerCase("az").startsWith("nümunə müştəri"));
}

/**
 * Headline, sub line and call to action of the home page, owned by the
 * panel's Hero module. While Hero still holds the original seed copy (the
 * previous site's headline) the redesign's statement is shown instead, so
 * the first edit in the panel takes over.
 */
export function heroCopy(lang: Locale, content: SiteContent) {
  const sc = getShowcaseCopy(lang);
  const seeded = !content.fromDb || !content.hero.title || content.hero.title === getDict(lang).h1;
  return {
    headline: seeded ? sc.headline : content.hero.title,
    subline: seeded || !content.hero.subtitle ? sc.subline : content.hero.subtitle,
    cta: content.hero.primaryCta ?? { label: sc.cta, href: `/${lang}/anket` },
  };
}
