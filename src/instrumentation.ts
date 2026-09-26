/**
 * Runs once when the server boots (Next.js instrumentation hook). Malformed
 * environment values are reported here; in production a bad value aborts the
 * boot so the problem shows up in the deploy log, not as user-facing 500s.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { validateEnv } = await import("./lib/env");
  const result = validateEnv();
  if (result.ok) return;
  const message = `Invalid environment:\n  ${result.issues.join("\n  ")}`;
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(`[env] ${message}`);
}
