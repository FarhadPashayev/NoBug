import { defineConfig } from "prisma/config";

// Prisma 7 keeps the connection URL out of the schema: migrate/db-push read it
// from here, the client gets it through the pg adapter (src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
