import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// NF-03: the Prisma schema documents the localized Json shape and carries the
// indexes the panel's queries rely on.
const schema = readFileSync("prisma/schema.prisma", "utf8");
const model = (name: string) => schema.match(new RegExp(`model ${name} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";

describe("prisma schema (NF-03)", () => {
  it("documents the localized Json shape", () => expect(schema.replace(/\n\/\/ /g, " ")).toMatch(/Json column shaped \{ az: string; en\?: string; ru\?: string \}/));
  it("stores every translatable field as Json", () => {
    for (const [m, fields] of [
      ["Hero", ["title", "subtitle", "primaryCtaLabel", "secondaryCtaLabel"]],
      ["Project", ["title", "shortDescription", "content"]],
      ["Stat", ["label"]],
      ["Service", ["name", "shortDescription", "details"]],
      ["ServiceCategory", ["name"]],
      ["SpecGroup", ["name"]],
      ["SpecItem", ["name"]],
      ["FooterLink", ["label"]],
      ["Tag", ["name"]],
    ] as const) {
      for (const f of fields) expect(model(m), `${m}.${f}`).toMatch(new RegExp(`\\n\\s+${f}\\s+Json`));
    }
  });
  it("has unique slugs and the order / status / createdAt indexes", () => {
    for (const m of ["Project", "Service", "ServiceCategory", "Tag"]) expect(model(m)).toMatch(/slug\s+String\s+@unique/);
    for (const m of ["Project", "Stat", "Service", "ServiceCategory", "SpecGroup", "SpecItem", "PartnerLogo", "FooterLink"]) expect(model(m), m).toMatch(/@@index\(\[.*order\]\)/);
    expect(model("Lead")).toMatch(/@@index\(\[status, createdAt\]\)/);
    expect(model("Lead")).toMatch(/@@index\(\[createdAt\]\)/);
    expect(model("Session")).toMatch(/sessionToken\s+String\s+@unique/);
  });
});
