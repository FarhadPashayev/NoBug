import { requireUser } from "@/lib/auth/guard";
import { Sidebar } from "@/components/admin/sidebar";

// Every page in this group is behind the session guard (the proxy also blocks
// unauthenticated requests before they reach the server components).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
