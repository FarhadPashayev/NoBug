import Image from "next/image";
import Link from "next/link";

// Client logos — used unmodified. `mark` (amber N + white wordmark) and `white`
// are for navy surfaces only; a light-background variant with the N does not
// exist yet.
const VARIANTS = {
  mark: { src: "/assets/nobug-mark.png", w: 940, h: 268 },
  white: { src: "/assets/nobug-white.png", w: 908, h: 258 },
  dark: { src: "/assets/nobug-dark.png", w: 932, h: 266 },
} as const;

export function Logo({ href, variant = "mark", height = 26, className = "" }: { href: string; variant?: keyof typeof VARIANTS; height?: number; className?: string }) {
  const v = VARIANTS[variant];
  const width = Math.round((v.w / v.h) * height);
  return (
    <Link href={href} className={`inline-flex flex-none items-center ${className}`} aria-label="nobug">
      <Image src={v.src} alt="no bug" width={width} height={height} priority style={{ height, width: "auto" }} />
    </Link>
  );
}
