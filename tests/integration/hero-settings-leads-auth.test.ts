import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ deleteImages: vi.fn(async () => {}), hasStorage: false, MEDIA_FOLDERS: ["hero", "partners", "projects", "services"] }));
import bcrypt from "bcryptjs";
import { deleteImages } from "@/lib/supabase";
import { createPartnerLogo, deletePartnerLogo, getHero, reorderPartnerLogos, saveHero, updatePartnerLogo } from "@/actions/hero";
import { getSettings, saveSettings } from "@/actions/settings";
import { exportLeadsCsv, listLeads, updateLead, deleteLead } from "@/actions/leads";
import { changePassword, updateProfile } from "@/actions/auth";
import { needsBootstrap } from "@/actions/bootstrap";
import { L, prisma, signInAsAdmin } from "./helpers";

let original: Awaited<ReturnType<typeof getHero>>;
beforeAll(async () => {
  await signInAsAdmin();
  original = await getHero();
});
afterAll(async () => {
  if (original.ok && original.data.hero) await saveHero(original.data.hero);
  await prisma.partnerLogo.deleteMany({ where: { name: { startsWith: "itest" } } });
});

describe("hero", () => {
  it("HERO-01 / HERO-09: save updates the single row in all languages", async () => {
    const r = await saveHero({ title: L("Başlıq test", "Title test", "Заголовок тест"), subtitle: L("alt"), primaryCtaLabel: L("Get"), primaryCtaUrl: "/anket", secondaryCtaLabel: L(""), secondaryCtaUrl: "", heroImage: { url: null, path: null } });
    expect(r.ok).toBe(true);
    expect(await prisma.hero.count()).toBe(1);
    const row = await prisma.hero.findUniqueOrThrow({ where: { id: "singleton" } });
    expect(row.title).toEqual({ az: "Başlıq test", en: "Title test", ru: "Заголовок тест" });
  });
  it("HERO-05: replacing the image deletes the old object", async () => {
    const base = { title: L("Başlıq"), subtitle: L(""), primaryCtaLabel: L(""), primaryCtaUrl: "", secondaryCtaLabel: L(""), secondaryCtaUrl: "" };
    await saveHero({ ...base, heroImage: { url: "https://x/a.png", path: "hero/a.png" } });
    await saveHero({ ...base, heroImage: { url: "https://x/b.png", path: "hero/b.png" } });
    expect(vi.mocked(deleteImages)).toHaveBeenCalledWith(["hero/a.png"]);
  });
  it("HERO-06..08: logos create, reorder, toggle, delete (file removed)", async () => {
    for (const n of ["itest A", "itest B"]) expect((await createPartnerLogo({ name: n, logo: { url: `https://x/${n}.png`, path: `partners/${n}.png` }, url: "", isActive: true })).ok).toBe(true);
    const [a, b] = await prisma.partnerLogo.findMany({ where: { name: { startsWith: "itest" } }, orderBy: { order: "asc" } });
    expect((await reorderPartnerLogos({ ids: [b.id, a.id] })).ok).toBe(true);
    expect((await prisma.partnerLogo.findUniqueOrThrow({ where: { id: b.id } })).order).toBeLessThan((await prisma.partnerLogo.findUniqueOrThrow({ where: { id: a.id } })).order);
    expect((await updatePartnerLogo(a.id, { name: "itest A", logo: { url: a.logoUrl, path: a.logoPath }, url: "", isActive: false })).ok).toBe(true);
    expect((await prisma.partnerLogo.findUniqueOrThrow({ where: { id: a.id } })).isActive).toBe(false);
    expect((await deletePartnerLogo(b.id)).ok).toBe(true);
    expect(vi.mocked(deleteImages)).toHaveBeenCalledWith(["partners/itest B.png"]);
    const missing = await createPartnerLogo({ name: "itest C", logo: { url: null, path: null }, url: "", isActive: true });
    expect(missing.ok).toBe(false);
  });
});

describe("settings", () => {
  it("SET-01 / SET-04 / SET-05: phones, socials and ordered footer links round-trip; still one row", async () => {
    const before = await getSettings();
    const input = {
      phones: [{ value: "+994 12 000 00 00" }, { value: "+994 50 111 11 11" }],
      email: "salam@nobug.az",
      address: L("Bakı", "Baku", "Баку"),
      hours: L("9-18"),
      linkedin: "https://linkedin.com/company/nobug",
      instagram: "",
      facebook: "",
      youtube: "",
      x: "",
      footerLinks: [
        { group: "company" as const, label: L("İkinci"), url: "#b" },
        { group: "company" as const, label: L("Birinci"), url: "#a" },
      ],
    };
    expect((await saveSettings(input)).ok).toBe(true);
    const after = await getSettings();
    expect(after.ok && after.data?.phones.map((p) => p.value)).toEqual(["+994 12 000 00 00", "+994 50 111 11 11"]);
    expect(after.ok && after.data?.footerLinks.map((l) => l.label.az)).toEqual(["İkinci", "Birinci"]);
    expect(await prisma.siteSettings.count()).toBe(1);
    if (before.ok && before.data) await saveSettings(before.data);
  });
});

describe("leads", () => {
  it("LEAD-09 / LEAD-10 / LEAD-11: only status and notes change", async () => {
    const lead = await prisma.lead.findFirstOrThrow();
    const r = await updateLead(lead.id, { status: "IN_PROGRESS", notes: "itest qeyd", name: "hacked", email: "h@x.y" });
    expect(r.ok).toBe(true);
    const after = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(after).toMatchObject({ status: "IN_PROGRESS", notes: "itest qeyd", name: lead.name, email: lead.email });
    await updateLead(lead.id, { status: lead.status, notes: lead.notes });
  });
  it("LEAD-12..15: status/search/date filters and CSV respect the filter", async () => {
    const all = await listLeads({});
    expect(all.ok && all.data.total).toBe(12);
    const archived = await listLeads({ status: "ARCHIVED" });
    expect(archived.ok && archived.data.items.every((l) => l.status === "ARCHIVED")).toBe(true);
    expect(archived.ok && archived.data.total).toBe(3);
    const q = await listLeads({ q: "müştəri 01" });
    expect(q.ok && q.data.items.map((l) => l.name)).toEqual(["Müştəri 01"]);
    const range = await listLeads({ from: "2026-09-01", to: "2026-09-04" }); // inclusive: days 0 and 3
    expect(range.ok && range.data.items.every((l) => l.createdAt <= new Date("2026-09-04T23:59:59+04:00"))).toBe(true);
    expect(range.ok && range.data.total).toBeGreaterThan(0);
    const csv = await exportLeadsCsv({ status: "ARCHIVED" });
    expect(csv.ok && csv.data.charCodeAt(0)).toBe(0xfeff);
    expect(csv.ok && csv.data.split("\r\n").length).toBe(4); // header + 3 rows
    expect(csv.ok && csv.data).toContain('"Arxiv"');
  });
  it("delete removes a lead", async () => {
    const lead = await prisma.lead.create({ data: { name: "itest silinən" } });
    expect((await deleteLead(lead.id)).ok).toBe(true);
    expect(await prisma.lead.findUnique({ where: { id: lead.id } })).toBeNull();
  });
});

describe("auth actions", () => {
  it("AUTH-09..11: wrong current password rejected; correct one rotates a bcrypt hash", async () => {
    const user = await signInAsAdmin();
    const bad = await changePassword({ currentPassword: "definitely-wrong", newPassword: "new-password-2026", confirmPassword: "new-password-2026" });
    expect(bad.ok).toBe(false);
    expect(await bcrypt.compare(process.env.ADMIN_PASSWORD!, (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).passwordHash)).toBe(true);
    const good = await changePassword({ currentPassword: process.env.ADMIN_PASSWORD!, newPassword: "new-password-2026", confirmPassword: "new-password-2026" });
    expect(good.ok).toBe(true);
    const hash = (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).passwordHash;
    expect(hash.startsWith("$2")).toBe(true);
    expect(hash).not.toContain("new-password-2026");
    expect(await bcrypt.compare("new-password-2026", hash)).toBe(true);
    expect(await bcrypt.compare(process.env.ADMIN_PASSWORD!, hash)).toBe(false);
    // restore for the other suites
    expect((await changePassword({ currentPassword: "new-password-2026", newPassword: process.env.ADMIN_PASSWORD!, confirmPassword: process.env.ADMIN_PASSWORD! })).ok).toBe(true);
  });
  it("profile update rejects a taken email", async () => {
    const other = await prisma.user.create({ data: { email: "itest-other@nobug.az", name: "o", passwordHash: "x" } });
    const r = await updateProfile({ name: "QA admin", email: "itest-other@nobug.az" });
    expect(r.ok).toBe(false);
    await prisma.user.delete({ where: { id: other.id } });
  });
  it("bootstrap is unavailable once a user exists", async () => expect(await needsBootstrap()).toBe(false));
});
