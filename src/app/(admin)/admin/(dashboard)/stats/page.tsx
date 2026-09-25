import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { StatsManager } from "@/components/admin/modules/stats-manager";
import { listStats } from "@/actions/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Göstəricilər" };

export default async function StatsPage() {
  const user = await requireUser("/admin/stats");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await listStats();
  return (
    <PageShell user={user} title="Göstəricilər" description='"Bir komanda, on iki istiqamət" bölməsindəki rəqəmlər.'>
      <StatsManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
