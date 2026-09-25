import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { LeadsInbox } from "@/components/admin/modules/leads-inbox";
import { listLeads } from "@/actions/leads";

export const dynamic = "force-dynamic";
export const metadata = { title: "Müraciətlər" };

export default async function LeadsPage() {
  const user = await requireUser("/admin/leads");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await listLeads({});
  return (
    <PageShell user={user} title="Müraciətlər" description="Sayt formalarından gələn sorğular. Məzmun dəyişdirilmir — yalnız status və daxili qeyd.">
      <LeadsInbox initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
