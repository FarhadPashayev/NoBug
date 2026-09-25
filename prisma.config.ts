import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: the connection lives here, not in schema.prisma. Migrations and
// `db push` go straight to Postgres (DIRECT_URL, port 5432); the app itself
// uses DATABASE_URL, which on Supabase is the pooled connection.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" },
});
