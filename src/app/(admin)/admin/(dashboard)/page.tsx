import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { hasDatabase, prisma } from "@/lib/db";
import { PageShell } from "@/components/admin/page-shell";
import { Card, CardBody } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "İdarə paneli" };

async function counts() {
  if (!hasDatabase) return null;
  try {
    const [projects, services, stats, specs, newLeads, leads] = await Promise.all([
      prisma.project.count(),
      prisma.service.count(),
      prisma.stat.count(),
      prisma.specItem.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    return { projects, services, stats, specs, newLeads, leads };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await counts();

  return (
    <PageShell user={user} title="İdarə paneli">
      {!data ? (
        <Card>
          <CardBody className="space-y-2">
            <h2 className="text-base font-semibold">Verilənlər bazası qoşulmayıb</h2>
            <p className="text-sm text-ad-muted-fg">
              <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">DATABASE_URL</code> təyin edin, sonra{" "}
              <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">npm run db:push</code> və{" "}
              <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">npm run db:seed</code> işlədin.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Layihələr", value: data.projects, href: "/admin/projects" },
              { label: "Xidmətlər", value: data.services, href: "/admin/services" },
              { label: "Göstəricilər", value: data.stats, href: "/admin/stats" },
              { label: "Yeni müraciət", value: data.newLeads, href: "/admin/leads" },
            ].map((c) => (
              <Link key={c.label} href={c.href}>
                <Card className="transition-colors hover:border-ad-accent/60">
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-ad-muted-fg">{c.label}</span>
                      <ArrowUpRight className="size-4 text-ad-muted-fg" />
                    </div>
                    <div className="mt-3 text-3xl font-semibold tabular-nums">{c.value}</div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-6">
            <div className="flex items-center justify-between border-b border-ad-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Inbox className="size-4" /> Son müraciətlər
              </h2>
              <Link href="/admin/leads" className="text-sm text-ad-accent hover:underline">
                Hamısı
              </Link>
            </div>
            <ul className="divide-y divide-ad-border">
              {data.leads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-ad-muted-fg">
                      {l.service || l.email || "—"} · {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <Badge tone={l.status === "NEW" ? "accent" : l.status === "ARCHIVED" ? "neutral" : "success"}>{l.status}</Badge>
                </li>
              ))}
              {!data.leads.length && <li className="px-5 py-8 text-center text-sm text-ad-muted-fg">Hələ müraciət yoxdur.</li>}
            </ul>
          </Card>
        </>
      )}
    </PageShell>
  );
}
