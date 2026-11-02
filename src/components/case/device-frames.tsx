import Image from "next/image";

/** A screen in a minimal browser window: traffic lights and the address. */
export function BrowserFrame({ src, alt, domain, priority = false }: { src: string; alt: string; domain: string; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[10px] bg-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
      <div className="flex h-7 items-center gap-1.5 border-b border-black/[0.07] bg-[#f3f2ef] px-3 sm:h-8" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-black/15 sm:size-2.5" />
        ))}
        <span className="ml-3 hidden h-[18px] max-w-[240px] flex-1 truncate rounded-full bg-white px-3 text-[10px] leading-[18px] text-black/45 sm:block">{domain}</span>
      </div>
      <Image src={src} alt={alt} width={1920} height={1200} sizes="(min-width: 768px) 540px, 92vw" className="block h-auto w-full" priority={priority} />
    </figure>
  );
}

/** A screen in a phone body with a rounded display and a pill-shaped camera. */
export function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="relative w-[clamp(96px,24vw,232px)] flex-none rounded-[clamp(18px,3.6vw,36px)] bg-[#111] p-[clamp(4px,0.8vw,8px)] shadow-[0_40px_70px_-28px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="relative overflow-hidden rounded-[clamp(14px,3vw,28px)]">
        <span aria-hidden="true" className="absolute left-1/2 top-[3%] z-10 h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#111]" />
        <Image src={src} alt={alt} width={780} height={1688} sizes="(min-width: 768px) 232px, 24vw" className="block h-auto w-full" />
      </div>
    </figure>
  );
}
