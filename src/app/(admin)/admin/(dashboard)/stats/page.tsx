import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { StatsManager } from "@/components/admin/modules/stats-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Göstəricilər" };

export default async function StatsPage() {
  const user = await requireUser("/admin/stats");
  return (
    <PageShell user={user} title="Göstəricilər" description='"Bir komanda, on iki istiqamət" bölməsindəki rəqəmlər.'>
      <StatsManager />
    </PageShell>
  );
}
