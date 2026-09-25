import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Yol" className="flex min-w-0 items-center gap-1 text-sm">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-ad-muted-fg" aria-hidden="true" />}
            {last ? (
              <span className="truncate font-medium text-ad-fg" aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="truncate text-ad-muted-fg transition-colors hover:text-ad-fg">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
