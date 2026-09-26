import { expect, test } from "@playwright/test";

// Production-only checks (LOC-06, SEO-03, SEO-01 canonical host). Opt in with
//   PROD_URL=https://www.nobug.az npx playwright test tests/e2e/prod.spec.ts --project=public
const prod = process.env.PROD_URL;
test.skip(!prod, "set PROD_URL to run against production");

test("LOC-06: apex and http redirect to https://www.nobug.az/az", async ({ request }) => {
  for (const url of ["https://nobug.az/", "http://nobug.az/", "http://www.nobug.az/"]) {
    const res = await request.get(url, { maxRedirects: 5 });
    expect(res.url(), url).toBe(`${prod}/az`);
    expect(res.status()).toBe(200);
  }
});

test("SEO-03: the Vercel preview host redirects to the canonical domain", async ({ request }) => {
  const res = await request.get("https://no-bug-eta.vercel.app/az", { maxRedirects: 0 });
  expect([301, 307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toMatch(/^https:\/\/www\.nobug\.az\/az/);
});

test("SEO-01 (prod): canonical and hreflang point at www.nobug.az", async ({ page }) => {
  await page.goto(`${prod}/az`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${prod}/az`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `${prod}/az`);
});
