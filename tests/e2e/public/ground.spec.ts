import { expect, test, type Page } from "@playwright/test";

// The page ground (light / navy) follows the section at the centre of the
// screen on desktop; copy that sits on the ground must follow it. These checks
// walk the section boundaries and measure every visible text element against
// its effective background with BOTH grounds applied — the state the reader
// sees while two sections share the screen.

/** Visible text elements under 3:1 against their effective background. */
function lowContrast(page: Page) {
  return page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = "#000";
      cx.fillStyle = c;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (f: number[], bg: number[]) => [0, 1, 2].map((i) => f[i] * f[3] + bg[i] * (1 - f[3]));
    const lum = (c: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const bgOf = (el: Element) => {
      const stack: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = rgba(getComputedStyle(n).backgroundColor);
        if (c[3] > 0) {
          stack.push(c);
          if (c[3] >= 0.99) break;
        }
      }
      let base = rgba(getComputedStyle(document.body).backgroundColor).slice(0, 3);
      for (const c of stack.reverse()) base = over(c, base);
      return base;
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll("main :is(h1,h2,h3,p,li,a,span,dt,dd,td,th,button,div,blockquote)")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 1)) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight - 4 || r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      let opacity = 1;
      for (let n: Element | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      if (opacity < 0.6) continue; // still revealing
      if (el.closest(".tile, a.bg-ink")) continue; // copy over photographs sits on gradient overlays
      const bg = bgOf(el);
      const rt = ratio(over(rgba(cs.color), bg), bg);
      if (rt < 3) out.push(`${(el.textContent ?? "").trim().slice(0, 30)} @${rt.toFixed(1)}`);
    }
    return out;
  });
}

const setGround = (page: Page, key: "light" | "dark") =>
  page.evaluate((k) => {
    const r = document.documentElement;
    r.dataset.pageBg = k;
    r.style.setProperty("--page-bg", k === "dark" ? "#0B1F3A" : "#F8F9FA");
    r.style.setProperty("--page-fg", k === "dark" ? "#ffffff" : "#0B1F3A");
  }, key);

test("GND-01: copy on the page ground stays readable on either ground at every section boundary (desktop crossfade)", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones paint a ground per section — covered by GND-02");
  await page.addInitScript(() => sessionStorage.setItem("nobug.hero-intro", "1"));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/az");
  await page.waitForTimeout(600);
  // crossfade mode is on: sections are transparent
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#layiheler")!).backgroundColor)).toBe("rgba(0, 0, 0, 0)");

  const tops = await page.evaluate(() => [...document.querySelectorAll("main section[data-bg]")].map((s) => Math.round(s.getBoundingClientRect().top + scrollY)));
  for (const top of tops.slice(1)) {
    // the boundary at 35% and at 65% of the screen: one section above it, the next below
    for (const at of [0.35, 0.65]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, top - Math.round(800 * at)));
      for (const ground of ["light", "dark"] as const) {
        await setGround(page, ground);
        await page.waitForTimeout(900); // ground fade + ink flip
        expect(await lowContrast(page), `boundary y=${top} at ${at * 100}% on the ${ground} ground`).toEqual([]);
      }
    }
  }
});

test("GND-02: the hero stays readable when the next section takes the ground; the footer keeps its own", async ({ page, isMobile }) => {
  await page.addInitScript(() => sessionStorage.setItem("nobug.hero-intro", "1"));
  await page.goto("/az");
  await page.waitForTimeout(600);
  const vh = page.viewportSize()!.height;
  const next = await page.evaluate(() => Math.round(document.querySelector("#layiheler")!.getBoundingClientRect().top + scrollY));
  // the dark section reaches 40% of the screen; the bottom of the hero is still in view above it
  for (let y = 0; y <= next - Math.round(vh * 0.4); y += 80) await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(1000);
  expect(await lowContrast(page)).toEqual([]);
  if (!isMobile) expect(await page.evaluate(() => document.documentElement.dataset.pageBg)).toBe("dark");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("footer")!).backgroundColor)).toBe("rgb(248, 249, 250)");
});
