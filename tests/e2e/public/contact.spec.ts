import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { db } from "../db";
import { freshIp } from "../helpers";

test("ELQ-01 / ELQ-02: empty form and malformed emails show inline errors, nothing is sent", async ({ page }) => {
  await page.goto("/az#elaqe");
  let posts = 0;
  page.on("request", (r) => r.url().includes("/api/leads") && posts++);
  const form = page.locator("form:has(#k2-name)");
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[role="alert"]')).toHaveCount(3);
  await expect(form.locator('[role="alert"]').first()).toHaveText(DICT.az.fieldRequired);
  await page.fill("#k2-name", "QA");
  await page.fill("#k2-msg", "Mövzu");
  for (const bad of ["test@", "test.az", "te st@x.az"]) {
    await page.fill("#k2-mail", bad);
    await form.locator('button[type="submit"]').click();
    await expect(form.locator('[role="alert"]')).toHaveText([DICT.az.fieldEmailInvalid]);
  }
  expect(posts).toBe(0);
});

test("ELQ-03: a valid submission shows the confirmation and lands in the inbox", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az#elaqe");
  await page.waitForTimeout(3200);
  const name = `QA-TEST elaqe ${Date.now()}`;
  await page.fill("#k2-name", name);
  await page.fill("#k2-mail", "qa@example.com");
  await page.fill("#k2-msg", "QA-TEST mövzu");
  await page.locator("form:has(#k2-name) button[type='submit']").click();
  await expect(page.locator('[role="status"]')).toHaveText(DICT.az.formSent);
  await expect(page.locator("#k2-name")).toHaveCount(0); // form replaced by the confirmation
  const lead = await db.lead.findFirstOrThrow({ where: { name } });
  expect(lead).toMatchObject({ source: "contact", email: "qa@example.com", message: "QA-TEST mövzu", status: "NEW" });
  await db.lead.delete({ where: { id: lead.id } });
});

test("ELQ-04: a filled honeypot is silently dropped", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az#elaqe");
  await page.waitForTimeout(3200);
  const name = `QA-TEST bot ${Date.now()}`;
  await page.fill("#k2-name", name);
  await page.fill("#k2-mail", "bot@example.com");
  await page.fill("#k2-msg", "spam");
  await page.locator("#k2-website").evaluate((el) => ((el as HTMLInputElement).value = "http://spam"));
  await page.locator("form:has(#k2-name) button[type='submit']").click();
  await expect(page.locator('[role="status"]')).toBeVisible(); // looks successful to the bot
  expect(await db.lead.count({ where: { name } })).toBe(0);
});

test("ELQ-05 (OBS-02): without JavaScript the form POSTs and redirects, nothing leaks into the URL", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await freshIp(page);
  await page.goto("/az#elaqe");
  await expect(page.locator("form:has(#k2-name)")).toHaveAttribute("method", "post");
  const name = `QA-TEST nojs ${Date.now()}`;
  // reveal animations never run without JS, so the fields stay at opacity 0 — force the interactions
  await page.fill("#k2-name", name, { force: true });
  await page.fill("#k2-mail", "nojs@example.com", { force: true });
  await page.fill("#k2-msg", "no javascript", { force: true });
  await page.locator("form:has(#k2-name) button[type='submit']").click({ force: true });
  await page.waitForURL(/\/az\?sent=1#elaqe$/);
  expect(page.url()).not.toContain("nojs@example.com");
  expect(await db.lead.count({ where: { name } })).toBe(1);
  await db.lead.deleteMany({ where: { name } });
  await ctx.close();
});

test("ELQ-06 / OBS-05: keyboard order skips the honeypot and focus is visible", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.locator("#k2-name").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#k2-mail")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#k2-msg")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#k2-website")).not.toBeFocused();
  await expect(page.locator("form:has(#k2-name) button[type='submit']")).toBeFocused();
  await expect(page.locator("#k2-website")).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("#k2-website")).toHaveAttribute("autocomplete", "off");
  await expect(page.locator("div:has(> #k2-website)")).toHaveAttribute("aria-hidden", "true");
  const outline = await page.locator("form:has(#k2-name) button[type='submit']").evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).boxShadow);
  expect(outline).not.toBe("none none");
});
