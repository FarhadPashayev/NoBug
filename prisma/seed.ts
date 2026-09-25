import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedAdmin, seedContent } from "../src/lib/seed";

// `npm run db:seed` — first admin account from env + the site's current copy.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL (or DIRECT_URL) is required to seed");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@nobug.az";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD (min 10 chars) is required to seed the first account");
  await seedAdmin(prisma, { email, password, name: process.env.ADMIN_NAME });
  const stats = await seedContent(prisma);
  console.log("Seed complete:", { email, ...stats });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
