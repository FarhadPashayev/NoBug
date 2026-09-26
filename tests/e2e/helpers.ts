import { expect, type Locator, type Page } from "@playwright/test";

export const ADMIN = { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! };

export async function login(page: Page, next = "/admin") {
  await page.goto(`/admin/login?next=${encodeURIComponent(next)}`);
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"));
}

/** Last toast text (sonner). */
export async function toast(page: Page, matcher: RegExp | string) {
  const t = page.locator("[data-sonner-toast]").filter({ hasText: matcher }).last();
  await expect(t).toBeVisible({ timeout: 10_000 });
  return t;
}

/** The LocalizedField that owns `#lf-<name>-<locale>`; switch its tab and return the active input. */
export function localized(page: Page, name: string) {
  const field = page.locator(`[data-localized="${name}"]`).first();
  return {
    field,
    // the empty-language dot adds its title to the accessible name ("AZ Boşdur — …")
    tab: (l: "AZ" | "EN" | "RU") => field.getByRole("tab", { name: new RegExp(`^${l}\\b`) }),
    async use(l: "AZ" | "EN" | "RU") {
      await field.getByRole("tab", { name: new RegExp(`^${l}\\b`) }).click();
      return field.locator(`#lf-${name.replace(/\./g, "-")}-${l.toLowerCase()}`);
    },
    async fill(values: Partial<Record<"AZ" | "EN" | "RU", string>>) {
      for (const [l, v] of Object.entries(values) as ["AZ" | "EN" | "RU", string][]) await (await this.use(l)).fill(v);
    },
  };
}

export const dialog = (page: Page) => page.getByRole("dialog");

export async function openCreate(page: Page) {
  await page.getByRole("button", { name: "Əlavə et" }).first().click();
  await expect(dialog(page)).toBeVisible();
}

export async function saveDialog(page: Page) {
  await dialog(page).getByRole("button", { name: "Yadda saxla" }).click();
}

/** Row in a DataTable whose text matches. */
export const row = (page: Page, text: string | RegExp) => page.locator("tbody tr").filter({ hasText: text });

export async function confirmDelete(page: Page, trigger: Locator) {
  await trigger.click();
  const d = dialog(page);
  await expect(d).toContainText("silinsin");
  await d.getByRole("button", { name: /^Sil$/ }).click();
}

/** dnd-kit pointer drag: from one handle onto another (vertical lists). */
export async function dragHandle(page: Page, from: Locator, to: Locator) {
  // both handles must be on screen: measure only after scrolling, or the
  // coordinates describe a layout the page no longer shows
  await to.scrollIntoViewIfNeeded();
  await from.scrollIntoViewIfNeeded();
  await from.hover();
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) throw new Error("handles not visible");
  // dnd-kit's PointerSensor wants a real pointer trail: press, then a slow
  // series of moves past the target's centre before releasing
  await page.mouse.down();
  const x = a.x + a.width / 2;
  const y0 = a.y + a.height / 2;
  const dy = b.y + b.height / 2 - y0 + (b.y > a.y ? 20 : -20);
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(x, y0 + (dy * i) / 20);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  // a real pointer travels on after the drop; without this the next synthetic click lands before dnd-kit has settled
  await page.mouse.move(x + 160, y0);
  await page.waitForTimeout(150);
}

let ipSeed = Date.now() % 200;
/** Give this browser context its own client IP so the 5/hour/IP limiter never bleeds between tests. */
export const freshIp = async (page: Page) => page.context().setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${(ipSeed++ % 250) + 1}` });

export const noConsoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
};
