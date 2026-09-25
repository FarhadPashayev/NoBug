import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { ProjectsManager } from "@/components/admin/modules/projects-manager";
import { listProjects } from "@/actions/projects";

export const dynamic = "force-dynamic";
export const metadata = { title: "Layihələr" };

export default async function ProjectsPage() {
  const user = await requireUser("/admin/projects");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await listProjects();
  return (
    <PageShell user={user} title="Layihələr" description='Ana səhifədəki "Nə qurduq və nəyi dəyişdi" bölməsi. Sıralama "Sıra" sütunu ilə, seçilmişlər isə açarla idarə olunur.'>
      <ProjectsManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
