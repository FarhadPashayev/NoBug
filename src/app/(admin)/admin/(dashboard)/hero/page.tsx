import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { HeroManager } from "@/components/admin/modules/hero-manager";
import { getHero } from "@/actions/hero";

export const dynamic = "force-dynamic";
export const metadata = { title: "Banner" };

export default async function HeroPage() {
  const user = await requireUser("/admin/hero");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await getHero();
  return (
    <PageShell user={user} title="Banner" description="Ana səhifənin ilk ekranı: başlıq, alt mətn, düymələr, vizual və partnyor loqoları.">
      <HeroManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
