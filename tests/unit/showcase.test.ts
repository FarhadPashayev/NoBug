import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { coverFor, PATTERN_COUNT } from "@/lib/covers";
import { carouselLayout } from "@/components/webgl/layout";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { LOCALES } from "@/lib/i18n/config";

describe("contact form schema", () => {
  const ok = { name: "Fərhad Paşayev", email: "a@b.az" };
  it("needs only name and email", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("rejects a bad email and a bad phone", () => {
    const r = contactSchema.safeParse({ ...ok, email: "x", phone: "abc" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["email", "phone"]);
  });
  it("accepts an Azerbaijani phone number", () => expect(contactSchema.safeParse({ ...ok, phone: "+994 50 123 45 67" }).success).toBe(true));
  it("blocks markup in short fields", () => expect(contactSchema.safeParse({ ...ok, company: "<script>" }).success).toBe(false));
});

describe("carousel covers and layout", () => {
  it("gives every slug a pattern in range", () => {
    for (const slug of ["web", "qa", "new-service-from-panel"]) expect(coverFor(slug).pattern).toBeLessThan(PATTERN_COUNT);
  });
  it("is stable for unknown slugs", () => expect(coverFor("abc")).toEqual(coverFor("abc")));
  it("uses portrait cards on phones and keeps them inside the screen", () => {
    const m = carouselLayout(390, 844);
    expect(m.portrait).toBe(true);
    expect(m.h).toBeGreaterThan(m.w);
    expect(m.w).toBeLessThan(390);
    const d = carouselLayout(1440, 900);
    expect(d.portrait).toBe(false);
    expect(d.h).toBeLessThanOrEqual(450);
  });
});

describe("showcase copy", () => {
  it("has five process steps and five budgets in every language", () => {
    for (const l of LOCALES) {
      expect(getShowcaseCopy(l).process).toHaveLength(5);
      expect(getShowcaseCopy(l).form.budgets).toHaveLength(5);
    }
  });
});
