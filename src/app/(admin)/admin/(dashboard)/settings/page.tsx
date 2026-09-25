import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { SettingsManager } from "@/components/admin/modules/settings-manager";
import { getSettings } from "@/actions/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sayt parametrləri" };

export default async function SettingsPage() {
  const user = await requireUser("/admin/settings");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await getSettings();
  return (
    <PageShell user={user} title="Sayt parametrləri" description="Əlaqə məlumatları, sosial şəbəkələr və footer linkləri.">
      <SettingsManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
