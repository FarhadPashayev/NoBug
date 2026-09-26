// Loads .env.test (+ .env.test.local) and maps DATABASE_URL_TEST → DATABASE_URL.
// Shared by the seed, the DB reset, the vitest setup and the test server.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function loadTestEnv(root = process.cwd()) {
  for (const file of [".env.test", ".env.test.local"]) {
    const p = path.join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith("#")) continue;
      const v = m[2].replace(/^"(.*)"$/, "$1");
      if (file.endsWith(".local") || !(m[1] in process.env)) process.env[m[1]] = v;
    }
  }
  if (!process.env.DATABASE_URL_TEST) throw new Error("DATABASE_URL_TEST missing in .env.test");
  if (/supabase\.co|supabase\.com/.test(process.env.DATABASE_URL_TEST)) throw new Error("Refusing to run tests against a Supabase database");
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  process.env.DIRECT_URL = process.env.DATABASE_URL_TEST;
  return process.env;
}
