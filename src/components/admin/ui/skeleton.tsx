import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-ad-muted", className)} aria-hidden="true" {...props} />;
}

/** Placeholder for a list page: toolbar + table rows. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="overflow-hidden rounded-xl border border-ad-border bg-ad-card">
        <Skeleton className="h-11 rounded-none border-b border-ad-border bg-ad-muted/60" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ad-border px-4 py-3 last:border-0">
            <Skeleton className="size-9 shrink-0" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder for a form page: two cards of fields. */
export function FormSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: cards }).map((_, c) => (
        <div key={c} className="rounded-xl border border-ad-border bg-ad-card">
          <div className="border-b border-ad-border px-5 py-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Topbar + heading placeholder wrapped around a body skeleton. */
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ad-border bg-ad-bg/90 px-5 py-3 lg:px-8">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="mb-6 h-4 w-80" />
        {children}
      </main>
    </>
  );
}
