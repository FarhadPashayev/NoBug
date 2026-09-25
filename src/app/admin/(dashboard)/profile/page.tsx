import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { ProfileManager } from "@/components/admin/modules/profile-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser("/admin/profile");
  return (
    <PageShell user={user} title="Profil" description="Hesab məlumatları və şifrə.">
      <ProfileManager user={user} />
    </PageShell>
  );
}
