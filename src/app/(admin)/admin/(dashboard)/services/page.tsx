import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { ServicesManager } from "@/components/admin/modules/services-manager";
import { listServiceCategories, listServices } from "@/actions/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "Xidmətlər" };

export default async function ServicesPage() {
  const user = await requireUser("/admin/services");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const [services, categories] = await Promise.all([listServices(), listServiceCategories()]);
  return (
    <PageShell user={user} title="Xidmət indeksi" description="Xidmətlər və kateqoriyalar. Əsas xidmətlər ana səhifədə öndə göstərilir.">
      <ServicesManager initial={{ services: services.ok ? services.data : undefined, categories: categories.ok ? categories.data : undefined }} />
    </PageShell>
  );
}
