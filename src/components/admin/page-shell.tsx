import { Topbar } from "./topbar";
import type { SessionUser } from "@/lib/auth/session";

/** Topbar (breadcrumbs) + heading + padded content column, shared by every module page. */
export function PageShell({
  user,
  title,
  description,
  action,
  children,
}: {
  user: SessionUser;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-sm text-ad-muted-fg">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </main>
    </>
  );
}
