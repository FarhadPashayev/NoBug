import { describe, expect, it } from "vitest";
import { slugify, formatDate } from "@/lib/utils";
import { csvEscape, leadsToCsv, CSV_HEADER } from "@/lib/admin/csv";

describe("slugify (PRJ-01 transliteration)", () => {
  it("transliterates Azerbaijani letters", () => {
    expect(slugify("Ərazi şəbəkəsi çox güclü ıdı öz ünvanı İdarə")).toBe("erazi-sebekesi-cox-guclu-idi-oz-unvani-idare");
  });
  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  Korporativ sayt & məzmun paneli!! ")).toBe("korporativ-sayt-mezmun-paneli");
    expect(slugify("---")).toBe("");
  });
  it("caps the length at 60", () => expect(slugify("a".repeat(100)).length).toBe(60));
});

describe("leadsToCsv (LEAD-15)", () => {
  const row = {
    createdAt: new Date("2026-09-25T10:30:00+04:00"),
    name: 'Əli "Vəli"',
    email: "a@b.az",
    phone: "",
    service: "Veb",
    message: "sətir 1\nsətir 2; vergül, dırnaq \"",
    source: "contact",
    locale: "az",
    status: "NEW" as const,
    notes: "",
    answers: { "Sual 1": "Cavab" },
  };
  it("starts with a UTF-8 BOM and the header row", () => {
    const csv = leadsToCsv([row]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1).split("\r\n")[0]).toBe(CSV_HEADER.map(csvEscape).join(";"));
  });
  it("escapes quotes, keeps separators and newlines inside quoted fields", () => {
    const csv = leadsToCsv([row]);
    expect(csv).toContain('"Əli ""Vəli"""');
    expect(csv).toContain('"sətir 1\nsətir 2; vergül, dırnaq """');
    expect(csv.split("\r\n")).toHaveLength(2); // the newline inside the message is quoted, not a row break
    expect(csv).toContain('"Yeni"');
    expect(csv).toContain('"25.09.2026 10:30"');
    expect(csv).toContain('"{""Sual 1"":""Cavab""}"');
  });
  it("csvEscape handles null/undefined", () => expect(csvEscape(undefined)).toBe('""'));
});

describe("formatDate", () => {
  it("renders dd.MM.yyyy HH:mm in Baku time", () => expect(formatDate("2026-01-05T20:05:00Z")).toBe("06.01.2026 00:05"));
});
