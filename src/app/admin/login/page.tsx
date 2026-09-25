import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasDatabase } from "@/lib/db";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next && next.startsWith("/admin") ? next : "/admin");
  const ready = hasDatabase && !!process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-ad-accent text-ad-accent-fg">n</span>
          nobug admin
        </div>
        {ready ? (
          <LoginForm next={next} />
        ) : (
          <div className="rounded-xl border border-ad-border bg-ad-card p-5 text-sm">
            <p className="font-medium text-ad-fg">Panel konfiqurasiya olunmayıb</p>
            <p className="mt-2 text-ad-muted-fg">
              Server-də <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">DATABASE_URL</code> və{" "}
              <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">AUTH_SECRET</code> təyin edin.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
