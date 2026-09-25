import { PageSkeleton, Skeleton } from "@/components/admin/ui/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-72 rounded-xl" />
    </PageSkeleton>
  );
}
