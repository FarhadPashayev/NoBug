import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { coverFor, PATTERN_COUNT } from "@/lib/covers";
import { carouselLayout } from "@/components/webgl/layout";
import { getShowcaseCopy } from "@/lib/i18n/showcase";
import { LOCALES } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { heroCopy, realTestimonials } from "@/lib/showcase-data";
import type { SiteContent } from "@/lib/content";

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
    // reference proportions: ~55 % of the width, 1.68 : 1, at most 56 % of the height
    expect(Math.round(d.w)).toBe(788);
    expect(d.h).toBeLessThanOrEqual(900 * 0.56);
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

describe("panel content on the home page", () => {
  const base = { fromDb: true, testimonials: [], hero: { title: "", subtitle: "", primaryCta: null, secondaryCta: null, image: null } } as unknown as SiteContent;
  const review = (name: string) => ({ id: name, name, role: "", quote: "q", rating: 5, avatarUrl: null, photoUrl: null, isFeatured: false });

  it("never shows the placeholder reviews", () => {
    const c = { ...base, testimonials: [review("Nümunə Müştəri"), review("Nümunə Müştəri 4"), review("Aysel Məmmədova")] } as SiteContent;
    expect(realTestimonials(c).map((r) => r.name)).toEqual(["Aysel Məmmədova"]);
  });
  it("shows the redesign headline while Hero still holds the seed copy", () => {
    const c = { ...base, hero: { ...base.hero, title: getDict("az").h1, subtitle: getDict("az").heroText } } as SiteContent;
    expect(heroCopy("az", c).headline).toBe(getShowcaseCopy("az").headline);
    expect(heroCopy("az", c).cta.href).toBe("/az/anket");
  });
  it("lets an edit in the panel take over", () => {
    const c = { ...base, hero: { ...base.hero, title: "Yeni başlıq", subtitle: "Yeni mətn", primaryCta: { label: "Yaz", href: "/az/anket" } } } as SiteContent;
    expect(heroCopy("az", c)).toEqual({ headline: "Yeni başlıq", subline: "Yeni mətn", cta: { label: "Yaz", href: "/az/anket" } });
  });
});
