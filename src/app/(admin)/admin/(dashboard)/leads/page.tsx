import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { LeadsInbox } from "@/components/admin/modules/leads-inbox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Müraciətlər" };

export default async function LeadsPage() {
  const user = await requireUser("/admin/leads");
  return (
    <PageShell user={user} title="Müraciətlər" description="Sayt formalarından gələn sorğular. Məzmun dəyişdirilmir — yalnız status və daxili qeyd.">
      <LeadsInbox />
    </PageShell>
  );
}
