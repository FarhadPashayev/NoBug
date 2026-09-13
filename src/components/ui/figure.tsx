import Image, { type StaticImageData } from "next/image";

/**
 * Image in an aspect-ratio box (no layout shift), 1px hairline + mono caption
 * beneath. Hover: the container clips, the image scales 1 → 1.03 over 650ms.
 * Assets are already graded — no extra filter.
 */
export function Figure({
  src,
  alt,
  caption,
  ratio,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
  bg = "bg-paper",
  onNavy = false,
}: {
  src: string | StaticImageData;
  alt: string;
  caption: string;
  ratio: string; // e.g. "16 / 9"
  priority?: boolean;
  sizes?: string;
  className?: string;
  bg?: string;
  onNavy?: boolean;
}) {
  return (
    <figure className={`m-0 ${className}`}>
      <div className={`img-block ${bg}`} style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} loading={priority ? undefined : "lazy"} />
      </div>
      <figcaption className={`mono-label mt-3 border-t pt-2.5 ${onNavy ? "border-navy-line text-muted-navy" : "border-hairline text-muted"}`}>{caption}</figcaption>
    </figure>
  );
}
