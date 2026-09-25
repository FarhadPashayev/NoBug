import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 takes the connection through a driver adapter. One client per
// process; in dev the module is re-evaluated on every HMR pass, so it is
// cached on globalThis to avoid exhausting the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Thrown by route handlers when DATABASE_URL is missing, so the UI can say so. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function assertDatabase() {
  if (!hasDatabase) throw new DatabaseNotConfiguredError();
}
