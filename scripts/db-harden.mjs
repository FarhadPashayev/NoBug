// Locks the app's tables away from Supabase's Data API (PostgREST).
//
// The site talks to Postgres only through Prisma as the `postgres` role,
// which bypasses RLS. Supabase, however, also exposes every table in the
// `public` schema over its REST API to the `anon` / `authenticated` roles —
// without RLS the public anon key could read User (password hashes), Session
// and Lead. This script, run after every `prisma db push`:
//   1. enables row level security on every table of the schema (no policies,
//      so the API roles see no rows even where a grant survives)
//   2. revokes the API roles' privileges on the schema's tables and sequences
//   3. makes that revocation the default for tables created later
//
// Usage:  DIRECT_URL=… [DB_SCHEMA=dev] node scripts/db-harden.mjs
import "dotenv/config";
import pg from "pg";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL (or DATABASE_URL) is required");
const schema = process.env.DB_SCHEMA || "public";
if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error(`bad DB_SCHEMA: ${schema}`);
const API_ROLES = ["anon", "authenticated"];

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const roles = (await client.query("select rolname from pg_roles where rolname = any($1)", [API_ROLES])).rows.map((r) => r.rolname);
  const { rows: tables } = await client.query("select tablename, rowsecurity from pg_tables where schemaname = $1 order by 1", [schema]);
  if (!tables.length) throw new Error(`no tables in schema "${schema}" — run prisma db push first`);

  await client.query("begin");
  let enabled = 0;
  for (const t of tables) {
    if (t.rowsecurity) continue;
    await client.query(`alter table "${schema}"."${t.tablename}" enable row level security`);
    enabled++;
  }
  if (roles.length) {
    const list = roles.map((r) => `"${r}"`).join(", ");
    await client.query(`revoke all on all tables in schema "${schema}" from ${list}`);
    await client.query(`revoke all on all sequences in schema "${schema}" from ${list}`);
    await client.query(`revoke all on all functions in schema "${schema}" from ${list}`);
    // tables Prisma creates later start locked too (defaults are per creating role)
    await client.query(`alter default privileges for role postgres in schema "${schema}" revoke all on tables from ${list}`);
    await client.query(`alter default privileges for role postgres in schema "${schema}" revoke all on sequences from ${list}`);
    await client.query(`alter default privileges for role postgres in schema "${schema}" revoke all on functions from ${list}`);
  }
  await client.query("commit");

  const left = (
    await client.query(
      "select count(*)::int as n from information_schema.role_table_grants where table_schema = $1 and grantee = any($2)",
      [schema, API_ROLES],
    )
  ).rows[0].n;
  console.log(
    `schema "${schema}": ${tables.length} tables, RLS newly enabled on ${enabled}, ` +
      `API-role grants remaining: ${left}${roles.length ? "" : " (no API roles here — not a Supabase database)"}`,
  );
} catch (e) {
  await client.query("rollback").catch(() => {});
  throw e;
} finally {
  await client.end();
}
