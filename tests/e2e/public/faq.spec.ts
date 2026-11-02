import { expect, test } from "@playwright/test";
import { ACTIVE_SERVICES } from "../../../src/lib/services";

// Checklist items: FAQ section (16), llms.txt (19), service share image (18),
// project x-default (14), service-card accessible name (9).

test("FAQ-01: the FAQ renders from the panel, one answer open at a time, with FAQPage JSON-LD", async ({ page }) => {
  await page.goto("/az");
  const faq = page.locator("#sss");
  await faq.scrollIntoViewIfNeeded();
  await expect(faq).toContainText("Tez-tez verilən suallar");
  const items = faq.locator("details");
  const n = await items.count();
  expect(n).toBeGreaterThanOrEqual(3);
  // first open by default
  await expect(items.first()).toHaveAttribute("open", "");
  // opening the third closes the first (exclusive accordion)
  await items.nth(2).locator("summary").click();
  await expect(items.nth(2)).toHaveAttribute("open", "");
  await expect(items.first()).not.toHaveAttribute("open", "");
  // the answer is readable text, not a placeholder
  const answer = await items.nth(2).locator("p").textContent();
  expect((answer ?? "").trim().length).toBeGreaterThan(40);
  // structured data mirrors the thread
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).find((s) => s.includes('"FAQPage"'));
  expect(ld).toBeTruthy();
  expect(JSON.parse(ld!).mainEntity).toHaveLength(n);
  await expect(faq.getByRole("link", { name: /Layihəni müzakirə et/ })).toHaveAttribute("href", "/az/anket");
});

test("FAQ-02: the FAQ is in all three languages", async ({ page }) => {
  for (const [l, title] of [
    ["en", "Frequently asked questions"],
    ["ru", "Частые вопросы"],
  ] as const) {
    await page.goto(`/${l}`);
    await expect(page.locator("#sss")).toContainText(title);
  }
});

test("LLM-01: /llms.txt and /llms-full.txt describe the site from the same content as the pages", async ({ request }) => {
  const short = await request.get("/llms.txt");
  expect(short.status()).toBe(200);
  expect(short.headers()["content-type"]).toContain("text/plain");
  const body = await short.text();
  expect(body.startsWith("# nobug")).toBe(true);
  for (const slug of ACTIVE_SERVICES) expect(body).toContain(`/az/xidmetler/${slug}`);
  expect(body).toContain("/az/anket");
  expect(body).toContain("llms-full.txt");
  const full = await request.get("/llms-full.txt");
  expect(full.status()).toBe(200);
  const fullBody = await full.text();
  for (const l of ["az", "en", "ru"]) expect(fullBody).toContain(`# ${l.toUpperCase()} — `);
  expect(fullBody.length).toBeGreaterThan(body.length);
});

test("SEO-05: service pages carry a share image; project pages an x-default; service cards name themselves by their text", async ({ page, request }) => {
  await page.goto("/az/xidmetler/qa");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toMatch(/\/az\/xidmetler\/qa\/opengraph-image/);
  // absolute (NEXT_PUBLIC_SITE_URL); fetch it from the server under test
  const img = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const project = sitemap.match(/\/az\/layiheler\/[a-z0-9-]+/)?.[0];
  if (project) {
    await page.goto(project);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  }

  await page.goto("/az");
  const card = page.locator("#xidmetler a[href^='/az/xidmetler/']").first();
  await expect(card).not.toHaveAttribute("aria-label", /.+/);
  await expect(card).toContainText("Veb və e-ticarət");
});
