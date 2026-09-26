import { describe, expect, it } from "vitest";
import { localizedString } from "@/lib/i18n/localized";
import { heroSchema } from "@/schemas/hero";
import { projectSchema } from "@/schemas/projects";
import { serviceSchema } from "@/schemas/services";
import { statSchema } from "@/schemas/stats";
import { leadCreateSchema, leadFilterSchema, leadUpdateSchema } from "@/schemas/leads";
import { settingsSchema } from "@/schemas/settings";
import { loginSchema } from "@/schemas/auth";

const L = (az: string, en = "", ru = "") => ({ az, en, ru });
const project = (over: Partial<Parameters<typeof projectSchema.parse>[0]> = {}) => ({ title: L("Layihə"), year: "2026", ...over });

describe("localizedString (I18N-01, I18N-02)", () => {
  it("accepts az only", () => expect(localizedString().safeParse({ az: "x" }).success).toBe(true));
  it("rejects a value without az", () => {
    const r = localizedString().safeParse({ en: "x" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["az"]);
  });
  it("fills missing en/ru with empty strings", () => expect(localizedString().parse({ az: "x" })).toEqual({ az: "x", en: "", ru: "" }));
  it("optional variant allows an empty az", () => expect(localizedString(100, false).safeParse({ az: "" }).success).toBe(true));
});

describe("projectSchema", () => {
  it("PRJ-04: empty AZ title and missing year are rejected", () => {
    const r = projectSchema.safeParse({ title: L(""), year: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join("."))).toEqual(expect.arrayContaining(["title.az", "year"]));
  });
  it("PRJ-05: year must be a 4-digit year in 2000–2100", () => {
    expect(projectSchema.safeParse(project({ year: "1999" })).success).toBe(false);
    expect(projectSchema.safeParse(project({ year: "abcd" })).success).toBe(false);
    expect(projectSchema.safeParse(project({ year: "2100" })).success).toBe(true);
    expect(projectSchema.safeParse(project({ year: "2026" })).success).toBe(true);
  });
  it("slug accepts only kebab-case", () => {
    expect(projectSchema.safeParse(project({ slug: "Böyük Slug" })).success).toBe(false);
    expect(projectSchema.safeParse(project({ slug: "boyuk-slug" })).success).toBe(true);
  });
  it("I18N-09: defaults for non-localized fields are stored once", () => {
    const v = projectSchema.parse(project());
    expect(v.cover).toEqual({ url: null, path: null });
    expect(v.tags).toEqual([]);
    expect(v.isPublished).toBe(true);
  });
});

describe("serviceSchema (SVC-03)", () => {
  const svc = (icon: string) => ({ name: L("Xidmət"), icon });
  it("accepts a PascalCase lucide name and an empty icon", () => {
    expect(serviceSchema.safeParse(svc("Shield")).success).toBe(true);
    expect(serviceSchema.safeParse(svc("")).success).toBe(true);
  });
  it("rejects names that cannot be lucide icons", () => {
    expect(serviceSchema.safeParse(svc("not an icon")).success).toBe(false);
    expect(serviceSchema.safeParse(svc("shield")).success).toBe(false);
  });
});

describe("heroSchema (HERO-02, HERO-03)", () => {
  const hero = (primaryCtaUrl: string) => ({ title: L("Başlıq"), primaryCtaUrl });
  it("rejects a CTA that is not a URL", () => expect(heroSchema.safeParse(hero("not a url")).success).toBe(false));
  it("accepts relative, hash and absolute URLs", () => {
    for (const u of ["/contact", "#xidmetler", "https://nobug.az/x", "mailto:a@b.az"]) expect(heroSchema.safeParse(hero(u)).success).toBe(true);
  });
});

describe("statSchema (STAT-01, STAT-03)", () => {
  it("keeps '<2 saat' verbatim", () => expect(statSchema.parse({ value: "<2 saat", label: L("cavab") }).value).toBe("<2 saat"));
  it("requires the AZ label", () => expect(statSchema.safeParse({ value: "1", label: L("") }).success).toBe(false));
});

describe("lead schemas", () => {
  it("LEAD-02: missing name and invalid email are field errors", () => {
    const r = leadCreateSchema.safeParse({ name: "", email: "nope" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["name", "email"]));
  });
  it("LEAD-07: phone formats are accepted as text", () => {
    for (const phone of ["+994 50 123 45 67", "0501234567"]) expect(leadCreateSchema.safeParse({ name: "A", phone }).success).toBe(true);
  });
  it("LEAD-05 / LEAD-09: status and notes cannot be injected; admin update carries only status/notes", () => {
    const created = leadCreateSchema.parse({ name: "A", status: "ARCHIVED", notes: "x" }) as Record<string, unknown>;
    expect(created.status).toBeUndefined();
    expect(created.notes).toBeUndefined();
    const updated = leadUpdateSchema.parse({ status: "CONTACTED", name: "hacker", email: "x@y.z" }) as Record<string, unknown>;
    expect(updated).toEqual({ status: "CONTACTED" });
  });
  it("filter: dates must be ISO days", () => {
    expect(leadFilterSchema.safeParse({ from: "2026-09-01" }).success).toBe(true);
    expect(leadFilterSchema.safeParse({ from: "01.09.2026" }).success).toBe(false);
  });
});

describe("settingsSchema (SET-02)", () => {
  it("rejects an invalid social URL and accepts an empty one", () => {
    expect(settingsSchema.safeParse({ phones: [], linkedin: "linkedin" }).success).toBe(false);
    expect(settingsSchema.safeParse({ phones: [], linkedin: "" }).success).toBe(true);
  });
  it("footer link needs a URL and an AZ label", () => {
    expect(settingsSchema.safeParse({ phones: [], footerLinks: [{ group: "company", label: L("Haqqında"), url: "" }] }).success).toBe(false);
    expect(settingsSchema.safeParse({ phones: [], footerLinks: [{ group: "company", label: L("Haqqında"), url: "#haqqinda" }] }).success).toBe(true);
  });
});

describe("loginSchema (AUTH-06)", () => {
  it("rejects empty fields and malformed email", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "password1" }).success).toBe(false);
  });
});
