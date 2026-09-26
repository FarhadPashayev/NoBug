import { z } from "zod";

/**
 * Shape of the environment. Everything is optional — the site runs without a
 * database or mail — but a value that *is* set must be well-formed, so a typo
 * fails at boot (instrumentation.ts) instead of as a runtime 500.
 */
const url = z.string().url();
const pg = z.string().regex(/^postgres(ql)?:\/\//, "must be a postgresql:// URL");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: pg.optional(),
  DIRECT_URL: pg.optional(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  SUPABASE_URL: url.optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  MEDIA_BUCKET: z.string().regex(/^[a-z0-9-]+$/).optional(),
  MAIL_MODE: z.enum(["off", "send"]).optional(),
  RESEND_API_KEY: z.string().optional(),
  MAIL_TO: z.string().email().optional(),
  MAIL_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(10, "ADMIN_PASSWORD must be at least 10 characters").optional(),
  ADMIN_NAME: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: url.optional(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/, "GA id looks like G-XXXXXXXXXX").optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Empty strings count as unset (Vercel and .env files often leave them blank). */
function source() {
  return Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]));
}

export function validateEnv(): { ok: true; env: Env } | { ok: false; issues: string[] } {
  const r = envSchema.safeParse(source());
  if (r.success) return { ok: true, env: r.data };
  return { ok: false, issues: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
}
