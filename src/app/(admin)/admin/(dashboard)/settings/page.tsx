import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { SettingsManager } from "@/components/admin/modules/settings-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sayt parametrləri" };

export default async function SettingsPage() {
  const user = await requireUser("/admin/settings");
  return (
    <PageShell user={user} title="Sayt parametrləri" description="Əlaqə məlumatları, sosial şəbəkələr və footer linkləri.">
      <SettingsManager />
    </PageShell>
  );
}
