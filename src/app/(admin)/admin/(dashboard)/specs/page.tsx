import { requireUser } from "@/lib/auth/guard";
import { PageShell } from "@/components/admin/page-shell";
import { SpecsManager } from "@/components/admin/modules/specs-manager";
import { listSpecs } from "@/actions/specs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Standartlar" };

export default async function SpecsPage() {
  const user = await requireUser("/admin/specs");
  // fetched here so the first paint has data; the client keeps it fresh after edits
  const initial = await listSpecs();
  return (
    <PageShell user={user} title="Standart göstəricilər" description="Texnologiya və təhlükəsizlik cədvəli: parametr, dəyər, vahid və qrup.">
      <SpecsManager initial={initial.ok ? initial.data : undefined} />
    </PageShell>
  );
}
