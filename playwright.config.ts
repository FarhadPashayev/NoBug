import { defineConfig, devices } from "@playwright/test";
import { loadTestEnv } from "./tests/env.mjs";

loadTestEnv();
const port = process.env.TEST_PORT ?? "3400";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "node tests/serve.mjs", url: `${baseURL}/az`, reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/, use: { channel: "chrome" } },
    {
      name: "admin",
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: { channel: "chrome", viewport: { width: 1440, height: 900 }, storageState: "tests/.auth/admin.json" },
    },
    { name: "public", testMatch: /(public\/.*|prod)\.spec\.ts/, use: { channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "public-mobile", testMatch: /public\/mobile\.spec\.ts/, use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 390, height: 844 } } },
  ],
});
