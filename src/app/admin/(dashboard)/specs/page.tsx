import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { SpecsManager } from "@/components/admin/modules/specs-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Standartlar" };

export default async function SpecsPage() {
  const user = await requireUser("/admin/specs");
  return (
    <PageShell user={user} title="Standart göstəricilər" description="Texnologiya və təhlükəsizlik cədvəli: parametr, dəyər, vahid və qrup.">
      <SpecsManager />
    </PageShell>
  );
}
