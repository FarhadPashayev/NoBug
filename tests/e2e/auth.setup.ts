import { test as setup } from "@playwright/test";
import { login } from "./helpers";

setup("sign in once for the admin suites", async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: "tests/.auth/admin.json" });
});
