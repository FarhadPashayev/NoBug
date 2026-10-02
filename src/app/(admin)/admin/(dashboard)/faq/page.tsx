import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { FaqManager } from "@/components/admin/modules/faq-manager";
import { listFaqs } from "@/actions/faq";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suallar" };

export default async function FaqPage() {
  const user = await requireUser("/admin/faq");
  const initial = await listFaqs();
  return (
    <PageShell user={user} title="Tez-tez verilən suallar" description="Ana səhifədəki sual-cavab bölməsi. Sıra sürüklə-burax ilə dəyişir; gizli suallar saytda görünmür.">
      <FaqManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
