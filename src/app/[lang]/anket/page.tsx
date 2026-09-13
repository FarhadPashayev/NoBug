import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSurvey } from "@/lib/anket/survey";
import { LangSwitcher } from "@/components/site/header";
import { SurveyForm } from "@/components/anket/survey-form";
import { Logo } from "@/components/ui/logo";

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
  const sv = getSurvey(lang);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy-line bg-navy">
        <div className="mx-auto flex min-h-[72px] max-w-[1080px] flex-wrap items-center gap-4 px-[clamp(20px,5vw,64px)] py-3">
          <Logo href={`/${lang}`} variant="mark" height={26} />
          <Link href={`/${lang}`} className="link-rule mr-auto text-[15px] text-muted-navy hover:text-paper">
            {sv.home}
          </Link>
          <LangSwitcher current={lang} path="/anket" />
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,64px)] pb-20 pt-[clamp(28px,4vw,48px)]">
        {/* useSearchParams() needs a Suspense boundary for static prerendering */}
        <Suspense fallback={null}>
          <SurveyForm lang={lang} />
        </Suspense>
      </main>
    </>
  );
}
