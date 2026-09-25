import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { ProjectsManager } from "@/components/admin/modules/projects-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Layihələr" };

export default async function ProjectsPage() {
  const user = await requireUser("/admin/projects");
  return (
    <PageShell user={user} title="Layihələr" description='Ana səhifədəki "Nə qurduq və nəyi dəyişdi" bölməsi. Sıralama "Sıra" sütunu ilə, seçilmişlər isə açarla idarə olunur.'>
      <ProjectsManager />
    </PageShell>
  );
}
