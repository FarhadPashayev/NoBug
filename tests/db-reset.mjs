// Drop + recreate the test database, push the schema, load the test seed.
import { execSync } from "node:child_process";
import pg from "pg";
import { loadTestEnv } from "./env.mjs";

loadTestEnv();
const url = new URL(process.env.DATABASE_URL_TEST);
const dbName = url.pathname.slice(1);
const admin = new pg.Client({ connectionString: new URL("/postgres", url).toString() });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
await admin.query(`CREATE DATABASE "${dbName}"`);
await admin.end();
execSync("npx prisma db push", { stdio: "inherit", env: process.env });
execSync("npx tsx tests/seed.ts", { stdio: "inherit", env: process.env });
