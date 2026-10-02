import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { TestimonialsManager } from "@/components/admin/modules/testimonials-manager";
import { listTestimonials } from "@/actions/testimonials";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rəylər" };

export default async function TestimonialsPage() {
  const user = await requireUser("/admin/testimonials");
  const initial = await listTestimonials();
  return (
    <PageShell
      user={user}
      title="Müştəri rəyləri"
      description='Ana səhifədəki "Müştərilər nə deyir" bölməsi. "Seçilmiş" rəy böyük foto-kart kimi, qalanları ulduzlu kartlar kimi çıxır (ən çox 4). Rəy yoxdursa bölmə görünmür.'
    >
      <TestimonialsManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
