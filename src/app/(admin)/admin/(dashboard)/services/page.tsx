import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { ServicesManager } from "@/components/admin/modules/services-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Xidmətlər" };

export default async function ServicesPage() {
  const user = await requireUser("/admin/services");
  return (
    <PageShell user={user} title="Xidmət indeksi" description="Xidmətlər və kateqoriyalar. Əsas xidmətlər ana səhifədə öndə göstərilir.">
      <ServicesManager />
    </PageShell>
  );
}
