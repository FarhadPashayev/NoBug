import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { getSurvey } from "@/lib/anket/survey";
import { SurveyForm } from "@/components/anket/survey-form";
import { getSiteContent } from "@/lib/content";
import { aboutData, chromeCopy, contactChannels } from "@/lib/showcase-data";
import { SiteChrome } from "@/components/chrome/site-chrome";

const DESCRIPTION: Record<Locale, string> = {
  az: "Xidməti seçin, üç suala cavab verin — bir iş günü ərzində qiymətləndirmə ilə qayıdırıq.",
  en: "Pick a service, answer three questions — we come back with an assessment within one business day.",
  ru: "Выберите услугу, ответьте на три вопроса — возвращаемся с оценкой в течение одного рабочего дня.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "az";
  return { title: getSurvey(locale).eyebrow, description: DESCRIPTION[locale], robots: { index: false } };
}

export default async function AnketPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const content = await getSiteContent(lang);
  const paths = Object.fromEntries(LOCALES.map((l) => [l, "/anket"])) as Record<Locale, string>;

  // "Layihəni müzakirə et": the enquiry flow in the showcase frame (dark, same header and About drawer)
  return (
    <div className="theme-ink min-h-dvh bg-ink-950 text-paper">
      <SiteChrome lang={lang} tone="ink" t={chromeCopy(lang)} about={aboutData(lang, content)} channels={contactChannels(lang, content)} paths={paths} fab={false} />
      <main className="mx-auto max-w-[1280px] px-gutter pb-24 pt-[calc(env(safe-area-inset-top)+110px)] md:pt-[150px]">
        {/* useSearchParams() needs a Suspense boundary for static prerendering */}
        <Suspense fallback={null}>
          <SurveyForm lang={lang} />
        </Suspense>
      </main>
    </div>
  );
}
