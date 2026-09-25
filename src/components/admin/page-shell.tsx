import { Topbar } from "./topbar";
import type { SessionUser } from "@/lib/auth/session";

/** Topbar + padded content column, shared by every module page. */
export function PageShell({ user, title, description, children }: { user: SessionUser; title: string; description?: string; children: React.ReactNode }) {
  return (
    <>
      <Topbar user={user} title={title} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
        {description && <p className="mb-6 max-w-2xl text-sm text-ad-muted-fg">{description}</p>}
        {children}
      </main>
    </>
  );
}
