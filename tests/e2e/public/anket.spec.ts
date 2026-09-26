import { expect, test } from "@playwright/test";
import { LEGACY_ORDER } from "../../../src/lib/services";
import { SURVEY } from "../../../src/lib/anket/survey";
import { db } from "../db";
import { freshIp } from "../helpers";

const sv = SURVEY.az;
const answerAll = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("fieldset").first()).toBeVisible();
  // single-choice chips toggle, so only click the ones that are not selected yet
  for (const fs of await page.locator("fieldset").all()) {
    if ((await fs.locator("button.chip[data-selected='true']").count()) === 0) await fs.locator("button.chip").first().click();
  }
};
const fillContact = async (page: import("@playwright/test").Page, name: string, email = "qa@example.com") => {
  await page.fill("#sq-name", name);
  await page.getByRole("button", { name: sv.channels[0][0], exact: true }).click();
  await page.fill("#sq-contact", email);
  await page.check("#sq-consent");
};

test("ANK-01 / ANK-06 / ANK-07: service selection drives the URL and the progress; bad codes fall back to step 1", async ({ page }) => {
  await page.goto("/az/anket");
  await expect(page.getByText(/1 \/ 3/)).toBeVisible();
  await page.getByRole("button", { name: sv.services[LEGACY_ORDER.indexOf("qa")] }).click();
  await expect(page).toHaveURL(/xidmet=qa$/);
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  await page.goto("/az/anket?xidmet=qa");
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  await expect(page.locator("fieldset").first()).toContainText(sv.q[LEGACY_ORDER.indexOf("qa")][0][0]);
  await page.goto("/az/anket?xidmet=abc");
  await expect(page.getByText(/1 \/ 3/)).toBeVisible();
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("ANK-02: each of the 12 services shows its own three questions", async ({ page }) => {
  for (const [i, code] of LEGACY_ORDER.entries()) {
    await page.goto(`/az/anket?xidmet=${code}`);
    const fieldsets = page.locator("fieldset");
    await expect(fieldsets).toHaveCount(sv.q[i].length);
    for (const [qi, [label]] of sv.q[i].entries()) await expect(fieldsets.nth(qi)).toContainText(label);
  }
});

test("ANK-03 (OBS-01): 'Davam et' without answers shows an error per question and stays on step 2", async ({ page }) => {
  await page.goto("/az/anket?xidmet=qa");
  await page.getByRole("button", { name: sv.next }).click();
  await expect(page.locator('main [role="alert"]')).toHaveCount(sv.q[LEGACY_ORDER.indexOf("qa")].length);
  await expect(page.locator('main [role="alert"]').first()).toHaveText(sv.errors.answer);
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  await page.locator("fieldset").first().locator("button.chip").first().click();
  await expect(page.locator('main [role="alert"]')).toHaveCount(sv.q[LEGACY_ORDER.indexOf("qa")].length - 1);
  await answerAll(page);
  await page.getByRole("button", { name: sv.next }).click();
  await expect(page.getByText(/3 \/ 3/)).toBeVisible();
});

test("ANK-04: 'Geri' and 'Dəyiş' return to the previous step and keep the answers", async ({ page }) => {
  await page.goto("/az/anket");
  await page.getByRole("button", { name: sv.services[LEGACY_ORDER.indexOf("qa")] }).click();
  await answerAll(page);
  const picked = await page.locator("button.chip[data-selected='true']").allTextContents();
  await page.getByRole("button", { name: sv.next }).click();
  await expect(page).toHaveURL(/step=3$/);
  await page.getByRole("button", { name: sv.back }).click();
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  expect(await page.locator("button.chip[data-selected='true']").allTextContents()).toEqual(picked);
  await page.getByRole("button", { name: sv.change }).click();
  await expect(page.getByText(/1 \/ 3/)).toBeVisible();
  await expect(page).toHaveURL(/\/az\/anket$/);
});

test("ANK-05: browser Back/Forward walk the steps without leaving the site", async ({ page }) => {
  await page.goto("/az/anket");
  await page.getByRole("button", { name: sv.services[LEGACY_ORDER.indexOf("qa")] }).click();
  await answerAll(page);
  await page.getByRole("button", { name: sv.next }).click();
  await expect(page).toHaveURL(/step=3$/);
  await page.goBack(); // step 3 → step 2
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  await expect(page).toHaveURL(/xidmet=qa$/);
  await page.goBack(); // step 2 → step 1
  await expect(page.getByText(/1 \/ 3/)).toBeVisible();
  await expect(page).toHaveURL(/\/az\/anket$/);
  await page.goForward();
  await expect(page.getByText(/2 \/ 3/)).toBeVisible();
  await page.goForward();
  await expect(page.getByText(/3 \/ 3/)).toBeVisible();
});

test("ANK-08 / ANK-09 / ANK-10: required fields, channel-specific validation, consent link", async ({ page }) => {
  await page.goto("/az/anket?xidmet=qa");
  await answerAll(page);
  await page.getByRole("button", { name: sv.next }).click();
  await page.getByRole("button", { name: sv.send }).click();
  const alerts = page.locator('form [role="alert"]');
  await expect(alerts).toHaveCount(3);
  await expect(alerts.nth(0)).toHaveText(sv.errors.name);
  await expect(alerts.nth(1)).toHaveText(sv.errors.contact);
  await expect(alerts.nth(2)).toHaveText(sv.errors.consent);
  await page.fill("#sq-name", "QA");
  await page.getByRole("button", { name: sv.channels[0][0], exact: true }).click(); // e-poçt
  await page.fill("#sq-contact", "not-an-email");
  await page.getByRole("button", { name: sv.send }).click();
  await expect(page.locator('form [role="alert"]', { hasText: sv.errors.email })).toBeVisible();
  await page.getByRole("button", { name: sv.channels[1][0], exact: true }).click(); // telefon → tel input, no email rule
  await expect(page.locator("#sq-contact")).toHaveAttribute("type", "tel");
  await page.fill("#sq-contact", "+994 50 123 45 67");
  await page.getByRole("button", { name: sv.send }).click();
  await expect(page.locator('form [role="alert"]')).toHaveCount(1); // only consent left
  await expect(page.locator("form").getByRole("link", { name: sv.consentLink })).toHaveAttribute("href", /mexfilik-siyaseti/);
  expect(await db.lead.count({ where: { name: "QA" } })).toBe(0);
});

test("ANK-11 / ANK-12: a valid submission reaches the inbox once, even when Send is clicked twice", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az/anket?xidmet=qa");
  await page.waitForTimeout(3200);
  await answerAll(page);
  await page.getByRole("button", { name: sv.next }).click();
  const name = `QA-TEST anket ${Date.now()}`;
  await fillContact(page, name);
  await page.fill("#sq-message", "QA-TEST mesaj");
  await page.getByRole("button", { name: sv.send }).dblclick();
  await expect(page.getByText(sv.sentTitle)).toBeVisible();
  await page.waitForTimeout(1000);
  const leads = await db.lead.findMany({ where: { name } });
  expect(leads).toHaveLength(1);
  expect(leads[0]).toMatchObject({ source: "anket", service: sv.services[LEGACY_ORDER.indexOf("qa")], email: "qa@example.com", message: "QA-TEST mesaj" });
  expect(Object.keys(leads[0].answers as object)).toHaveLength(3);
  await db.lead.deleteMany({ where: { name } });
});

test("ANK-13: length limits apply and HTML is stored as text", async ({ page }) => {
  await freshIp(page);
  await page.goto("/az/anket?xidmet=qa");
  await page.waitForTimeout(3200);
  await answerAll(page);
  await page.getByRole("button", { name: sv.next }).click();
  const name = `QA-TEST <script>alert(1)</script> Əüş 🚀 ${Date.now()}`;
  await fillContact(page, name);
  await page.fill("#sq-message", "x".repeat(5000));
  expect((await page.inputValue("#sq-message")).length).toBe(2000);
  await page.getByRole("button", { name: sv.send }).click();
  await expect(page.getByText(sv.sentTitle)).toBeVisible();
  const lead = await db.lead.findFirstOrThrow({ where: { name: { contains: "QA-TEST <script>" } } });
  expect(lead.name).toBe(name); // stored verbatim, escaped on render
  expect(lead.message.length).toBe(2000);
  await db.lead.delete({ where: { id: lead.id } });
});
