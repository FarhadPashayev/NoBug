import { expect, test } from "@playwright/test";
import { db } from "../db";
import { ADMIN, login } from "../helpers";

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("AUTH-01: /admin redirects to login and leaks nothing", async ({ page, request }) => {
    const res = await request.get("/admin", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/admin/login");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin/);
    expect(await page.content()).not.toContain("Sayt parametrləri");
  });

  test("AUTH-02: deep links bounce to login and come back after signing in", async ({ page }) => {
    for (const p of ["/admin/projects", "/admin/leads", "/admin/settings"]) {
      await page.goto(p);
      await expect(page).toHaveURL(new RegExp(`/admin/login\\?next=${encodeURIComponent(p)}`));
    }
    await login(page, "/admin/settings");
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await page.context().clearCookies();
  });

  test("AUTH-03: valid login sets an HttpOnly, SameSite=Lax session cookie backed by a DB row", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/admin$/);
    const cookie = (await page.context().cookies()).find((c) => c.name.endsWith("authjs.session-token"));
    expect(cookie).toBeTruthy();
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.sameSite).toBe("Lax");
    expect(await db.session.findUnique({ where: { sessionToken: cookie!.value } })).not.toBeNull();
    await page.context().clearCookies();
  });

  test("AUTH-04 / AUTH-05: wrong password and unknown email get the same generic message", async ({ page }) => {
    const attempt = async (email: string, password: string) => {
      await page.goto("/admin/login");
      await page.fill("#email", email);
      await page.fill("#password", password);
      await page.click('button[type="submit"]');
      return page.locator('form [role="alert"]').first().textContent();
    };
    const a = await attempt(ADMIN.email, "wrong-password-1");
    const b = await attempt("nobody@nobug.az", "wrong-password-1");
    expect(a).toBe(b);
    expect(a).toMatch(/E-poçt və ya şifrə yanlışdır/);
    expect((await page.context().cookies()).some((c) => c.name.includes("session-token"))).toBe(false);
  });

  test("AUTH-06: empty / malformed fields are rejected client-side without a request", async ({ page }) => {
    await page.goto("/admin/login");
    let requests = 0;
    page.on("request", (r) => r.url().includes("/api/admin/auth/login") && requests++);
    await page.click('button[type="submit"]');
    await expect(page.locator('form [role="alert"]').first()).toBeVisible();
    await page.fill("#email", "not-an-email");
    await page.fill("#password", "short");
    await page.click('button[type="submit"]');
    await expect(page.locator('form [role="alert"]')).toHaveCount(2);
    expect(requests).toBe(0);
  });

  test("AUTH-12: admin pages are noindex; sitemap has no /admin", async ({ page, request }) => {
    await page.goto("/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin");
    expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \/admin/);
  });

  test("AUTH-13: nine failed logins in a row trigger the limiter", async ({ request }) => {
    let last = 0;
    for (let i = 0; i < 10; i++) {
      const r = await request.post("/api/admin/auth/login", { data: { email: "brute@nobug.az", password: "wrong-password-1" }, headers: { "x-forwarded-for": "198.51.100.7" } });
      last = r.status();
      if (last === 429) break;
    }
    expect(last).toBe(429);
  });
});

test.describe("fresh session", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("AUTH-07: logout deletes the session row; back button and /admin no longer show the panel", async ({ page }) => {
  await login(page);
  const cookie = (await page.context().cookies()).find((c) => c.name.endsWith("authjs.session-token"))!;
  await page.goto("/admin/projects");
  await page.getByRole("button", { name: "Çıxış" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect(await db.session.findUnique({ where: { sessionToken: cookie.value } })).toBeNull();
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test("NF-07 / NF-08: theme persists across reload; sidebar rail state and active item", async ({ page }) => {
  await page.goto("/admin/stats");
  await page.getByRole("button", { name: "Tema" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator('a[href="/admin/stats"][aria-current="page"]')).toBeVisible();
  await page.getByRole("button", { name: "Menyunu yığ" }).click();
  await page.goto("/admin/projects");
  await expect(page.getByRole("button", { name: "Menyunu genişləndir" })).toBeVisible();
  await page.getByRole("button", { name: "Menyunu genişləndir" }).click();
  await page.getByRole("button", { name: "Tema" }).click();
});
