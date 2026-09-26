// One command for everything: reset DB → build → start → unit+integration → api → e2e.
// Exit codes of each step are printed for TEST-REPORT.md.
import { spawn, spawnSync } from "node:child_process";
import { loadTestEnv } from "./env.mjs";

loadTestEnv();
const port = process.env.TEST_PORT ?? "3400";
const results = [];
const run = (label, cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
  results.push([label, r.status ?? 1]);
  return r.status ?? 1;
};

run("db reset + seed", "node", ["tests/db-reset.mjs"]);
run("tsc --noEmit", "npx", ["tsc", "--noEmit"]);
run("eslint", "npx", ["eslint", "src", "tests"]);
run("next build", "npx", ["next", "build"]);
run("vitest unit+integration", "npx", ["vitest", "run", "--project", "unit", "--project", "integration"]);

const server = spawn("npx", ["next", "start", "-p", port], { stdio: "ignore", env: process.env });
const up = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://localhost:${port}/az`);
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
};
if (await up()) {
  run("vitest api", "npx", ["vitest", "run", "--project", "api"]);
  run("playwright e2e", "npx", ["playwright", "test"]);
} else {
  results.push(["server start", 1]);
}
server.kill("SIGTERM");

console.log("\n=== test:all summary ===");
for (const [label, code] of results) console.log(`${code === 0 ? "OK  " : "FAIL"}  ${label}  (exit ${code})`);
process.exit(results.some(([, c]) => c !== 0) ? 1 : 0);
