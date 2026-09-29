import { config as loadEnv } from "dotenv";

// Same precedence as Next.js: .env.local (gitignored, your machine) wins over .env.
// Variables already in the environment (CI, the test runner) are never overridden.
loadEnv({ path: [".env.local", ".env"], quiet: true });
import { defineConfig } from "prisma/config";

// Prisma 7: the connection lives here, not in schema.prisma. Migrations and
// `db push` go straight to Postgres (DIRECT_URL, port 5432); the app itself
// uses DATABASE_URL, which on Supabase is the pooled connection.
// DB_SCHEMA (e.g. "dev") targets a Postgres schema other than "public" — the
// dev deployment keeps its tables in the same project, in its own schema.
function withSchema(url: string) {
  const schema = process.env.DB_SCHEMA;
  if (!url || !schema) return url;
  return `${url}${url.includes("?") ? "&" : "?"}schema=${encodeURIComponent(schema)}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  datasource: { url: withSchema(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "") },
});
