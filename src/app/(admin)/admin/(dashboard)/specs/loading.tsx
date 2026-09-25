import { PageSkeleton, TableSkeleton } from "@/components/admin/ui/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <TableSkeleton />
    </PageSkeleton>
  );
}
