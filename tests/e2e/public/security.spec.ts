import { expect, test } from "@playwright/test";

const REQUIRED = ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security"];

test("SEC-01 (feedback D): security headers on pages, redirects, 404s and the API", async ({ request }) => {
  for (const [path, expected] of [
    ["/az", 200],
    ["/", 307],
    ["/az/olmayan-x", 404],
    ["/admin", 307],
    ["/admin/login", 200],
    ["/api/leads", 404],
    ["/sitemap.xml", 200],
  ] as const) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(expected);
    const h = res.headers();
    for (const k of REQUIRED) expect(h[k], `${path} → ${k}`).toBeTruthy();
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["content-security-policy"]).toMatch(/default-src 'self'/);
    expect(h["content-security-policy"]).toMatch(/object-src 'none'/);
    expect(h["content-security-policy"]).toMatch(/frame-ancestors 'self'/);
  }
});

test("SEC-02: the CSP does not break the page (no violations in the console)", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => /Content Security Policy|Refused to/.test(m.text()) && violations.push(m.text().slice(0, 160)));
  for (const path of ["/az", "/az/anket?xidmet=qa", "/az/xidmetler/qa", "/admin/login"]) {
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(500);
  }
  expect(violations).toEqual([]);
});
