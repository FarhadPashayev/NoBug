import { expect, test } from "@playwright/test";
import { DICT } from "../../../src/lib/i18n/dict";
import { db } from "../db";
import { freshIp } from "../helpers";

// The home page's enquiry form (sections/contact-form.tsx): name + e-mail
// required; company, phone, service, budget and message optional.
const submit = (page: import("@playwright/test").Page) => page.locator("form:has(#cf-name) button[type='submit']");

test("ELQ-01 / ELQ-02: empty form and malformed emails show inline errors, nothing is sent", async ({ page }) => {
  await page.goto("/az#elaqe");
  let posts = 0;
  page.on("request", (r) => r.url().includes("/api/leads") && posts++);
  const form = page.locator("form:has(#cf-name)");
  await submit(page).click();
  await expect(form.locator('[role="alert"]')).toHaveCount(2);
  await expect(form.locator('[role="alert"]').first()).toHaveText(DICT.az.fieldRequired);
  await expect(page.locator("#cf-name")).toBeFocused();
  await page.fill("#cf-name", "QA");
  for (const bad of ["test@", "test.az", "te st@x.az"]) {
    await page.fill("#cf-email", bad);
    await submit(page).click();
    await expect(form.locator('[role="alert"]')).toHaveText([DICT.az.fieldEmailInvalid]);
  }
  expect(posts).toBe(0);
});

test("ELQ-07 / C: name, e-mail and phone reject markup and forbidden characters inline", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.fill("#cf-email", "qa@example.com");
  for (const bad of ["<script>", "Əli 2", "a/b"]) {
    await page.fill("#cf-name", bad);
    await submit(page).click();
    await expect(page.locator("#cf-name-err")).toHaveText(DICT.az.fieldNameInvalid);
  }
  await page.fill("#cf-name", "Əli Vəliyev");
  for (const bad of ["<b>@x.az", "a'b@x.az", "a@b"]) {
    await page.fill("#cf-email", bad);
    await submit(page).click();
    await expect(page.locator("#cf-email-err")).toHaveText(DICT.az.fieldEmailInvalid);
  }
  await page.fill("#cf-email", "qa@example.com");
  await page.fill("#cf-phone", "zəng edin");
  await submit(page).click();
  await expect(page.locator("#cf-phone-err")).toBeVisible();
});

test("ELQ-03: a valid submission shows the confirmation and lands in the inbox with every field", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az#elaqe");
  await page.waitForTimeout(3200);
  const name = "QA-TEST Elaqe";
  await db.lead.deleteMany({ where: { name } });
  await page.fill("#cf-name", name);
  await page.fill("#cf-company", "QA MMC");
  await page.fill("#cf-phone", "+994 50 123 45 67");
  await page.fill("#cf-email", "qa@example.com");
  await page.selectOption("#cf-service", { index: 1 });
  await page.selectOption("#cf-budget", { index: 2 });
  await page.fill("#cf-message", "QA-TEST mövzu");
  await submit(page).click();
  await expect(page.locator('#elaqe [role="status"]')).toHaveText(DICT.az.formSent);
  await expect(page.locator("#cf-name")).toHaveCount(0); // form replaced by the confirmation
  const lead = await db.lead.findFirstOrThrow({ where: { name } });
  expect(lead).toMatchObject({ source: "contact", email: "qa@example.com", phone: "+994 50 123 45 67", message: "QA-TEST mövzu", status: "NEW" });
  expect(lead.service).not.toBe("");
  expect(lead.answers).toMatchObject({ "Şirkət / Company": "QA MMC" });
  await db.lead.delete({ where: { id: lead.id } });
});

test("ELQ-04: a filled honeypot is silently dropped", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az#elaqe");
  await page.waitForTimeout(3200);
  const name = "QA-TEST Bot";
  await page.fill("#cf-name", name);
  await page.fill("#cf-email", "bot@example.com");
  await page.locator("#cf-website").evaluate((el) => ((el as HTMLInputElement).value = "http://spam"));
  await submit(page).click();
  await expect(page.locator('#elaqe [role="status"]')).toBeVisible(); // looks successful to the bot
  expect(await db.lead.count({ where: { name } })).toBe(0);
});

test("ELQ-05 (OBS-02): without JavaScript the form POSTs and redirects, nothing leaks into the URL", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await freshIp(page);
  await page.goto("/az#elaqe");
  await expect(page.locator("form:has(#cf-name)")).toHaveAttribute("method", "post");
  const name = "QA-TEST Nojs";
  await db.lead.deleteMany({ where: { name } });
  // reveal animations never run without JS, so the fields stay at opacity 0 — force the interactions
  await page.fill("#cf-name", name, { force: true });
  await page.fill("#cf-email", "nojs@example.com", { force: true });
  await page.fill("#cf-message", "no javascript", { force: true });
  await submit(page).click({ force: true });
  await page.waitForURL(/\/az\?sent=1#elaqe$/);
  expect(page.url()).not.toContain("nojs@example.com");
  expect(await db.lead.count({ where: { name } })).toBe(1);
  await db.lead.deleteMany({ where: { name } });
  await ctx.close();
});

test("ELQ-06 / OBS-05: keyboard order follows the fields, skips the honeypot and focus is visible", async ({ page }) => {
  await page.goto("/az#elaqe");
  await page.locator("#cf-name").focus();
  for (const id of ["#cf-company", "#cf-phone", "#cf-email", "#cf-service", "#cf-budget", "#cf-message"]) {
    await page.keyboard.press("Tab");
    await expect(page.locator(id)).toBeFocused();
  }
  await page.keyboard.press("Tab");
  await expect(page.locator("#cf-website")).not.toBeFocused();
  await expect(submit(page)).toBeFocused();
  await expect(page.locator("#cf-website")).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("#cf-website")).toHaveAttribute("autocomplete", "off");
  await expect(page.locator("div:has(> #cf-website)")).toHaveAttribute("aria-hidden", "true");
  const outline = await submit(page).evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).boxShadow);
  expect(outline).not.toBe("none none");
});
