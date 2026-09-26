import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isRateLimited, looksLikeBot } from "@/lib/anti-spam";
import { sniffImageType } from "@/lib/supabase";
import { sanitizeLocalized, sanitizeRichText } from "@/lib/sanitize";

describe("rate limiter (LEAD-04)", () => {
  it("allows five requests per IP per hour and blocks the sixth", () => {
    const ip = `10.0.0.${Math.floor(Math.random() * 250)}`;
    for (let i = 0; i < 5; i++) expect(isRateLimited(ip)).toBe(false);
    expect(isRateLimited(ip)).toBe(true);
    expect(isRateLimited("10.99.99.99")).toBe(false); // other IPs unaffected
  });
});

describe("looksLikeBot (LEAD-03)", () => {
  it("flags a filled honeypot, a missing timestamp and a sub-3s submit", () => {
    expect(looksLikeBot("http://spam", Date.now() - 10_000)).toBe(true);
    expect(looksLikeBot("", undefined)).toBe(true);
    expect(looksLikeBot("", Date.now() - 500)).toBe(true);
    expect(looksLikeBot("", Date.now() - 5_000)).toBe(false);
  });
});

describe("sniffImageType (UPL-04)", () => {
  const fx = (n: string) => new Uint8Array(readFileSync(`tests/fixtures/${n}`));
  it("recognises real images by magic bytes", () => {
    expect(sniffImageType(fx("valid.jpg"))).toBe("image/jpeg");
    expect(sniffImageType(fx("valid.png"))).toBe("image/png");
    expect(sniffImageType(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe("image/svg+xml");
  });
  it("rejects a PDF even when it is named .jpg", () => {
    expect(sniffImageType(fx("fake.jpg"))).toBeNull();
    expect(sniffImageType(fx("not-an-image.pdf"))).toBeNull();
  });
});

describe("sanitizeRichText (PRJ-06)", () => {
  it("strips scripts, handlers and javascript: links but keeps editor markup", () => {
    const html = '<h2>Başlıq</h2><p onclick="x()">Mətn <strong>qalın</strong> <a href="javascript:alert(1)">bad</a> <a href="https://nobug.az">ok</a></p><script>alert(1)</script><ul><li>bir</li></ul>';
    const out = sanitizeRichText(html);
    expect(out).not.toContain("<script");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("javascript:");
    expect(out).toContain("<h2>Başlıq</h2>");
    expect(out).toContain("<strong>qalın</strong>");
    expect(out).toContain('href="https://nobug.az"');
    expect(out).toContain("<li>bir</li>");
  });
  it("applies to every language", () => {
    expect(sanitizeLocalized({ az: "<p>a</p><script>1</script>", en: "<img src=x onerror=alert(1)>", ru: "" })).toEqual({ az: "<p>a</p>", en: "", ru: "" });
  });
});
