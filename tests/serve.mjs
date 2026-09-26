// `next start` with the test environment (used by Playwright's webServer and run-all).
import { spawn } from "node:child_process";
import { loadTestEnv } from "./env.mjs";
loadTestEnv();
const port = process.env.TEST_PORT ?? "3400";
const child = spawn("npx", ["next", "start", "-p", port], { stdio: "inherit", env: process.env });
child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
