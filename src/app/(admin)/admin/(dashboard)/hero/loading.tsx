import { FormSkeleton, PageSkeleton } from "@/components/admin/ui/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <FormSkeleton />
    </PageSkeleton>
  );
}
