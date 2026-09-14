import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dict";
import { figureCaption } from "@/lib/figures";
import { Reveal } from "@/components/ui/reveal";

/** IMG-02 full-bleed 21:9 band — the one cinematic moment. Reveals with a clip-path wipe. */
export function CineBand({ t }: { t: Dictionary }) {
  return (
    <Reveal kind="clip" as="section" className="relative">
      <div className="relative min-h-[280px] w-full bg-[#0D0F12]" style={{ aspectRatio: "21 / 9" }}>
        <Image src="/assets/IMG-02_server-hall_21x9.png" alt={t.alt02} fill sizes="100vw" className="object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-[clamp(20px,5.5vw,80px)] pb-5">
          <div className="h-px bg-[rgba(247,246,243,0.35)]" />
          <div className="mono-label pt-2.5 text-paper">{figureCaption(t, "band")}</div>
        </div>
      </div>
    </Reveal>
  );
}
