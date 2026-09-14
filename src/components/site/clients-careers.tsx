import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import { figureCaption } from "@/lib/figures";
import { Figure } from "@/components/ui/figure";

/** Halftone divider strip (PATTERN asset) */
export function Divider() {
  return (
    <div
      aria-hidden="true"
      className="h-[clamp(40px,5vw,80px)] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/PATTERN_halftone-divider_2400x320.png')" }}
    />
  );
}

/** Karyera — IMG-05 left; statement and one text link right. No numeric slot. */
export function Careers({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="karyera" className="container-site section-pad scroll-mt-20">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-end gap-[clamp(32px,4vw,64px)]">
        <Figure src="/assets/photo/careers.webp" alt={t.alt05} caption={figureCaption(t, "careers")} ratio="3 / 2" className="min-w-0" />
        <div className="min-w-0">
          <h2 className="type-h2 m-0 max-w-[24ch]">{t.careersTitle}</h2>
          <p className="type-body mt-5 max-w-[52ch]">{t.careersText}</p>
          <div className="mb-5 mt-8 h-px bg-hairline" />
          <Link href={`/${lang}#elaqe`} className="text-link">
            {t.careersLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
