import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Three projects: unit (pure), integration (server actions against the test
// DB), api (fetch against a running `next start` on TEST_PORT).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["tests/vitest.setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    projects: [
      { extends: true, test: { name: "unit", include: ["tests/unit/**/*.test.ts"] } },
      { extends: true, test: { name: "integration", include: ["tests/integration/**/*.test.ts"], fileParallelism: false } },
      { extends: true, test: { name: "api", include: ["tests/api/**/*.test.ts"], fileParallelism: false } },
    ],
  },
});
