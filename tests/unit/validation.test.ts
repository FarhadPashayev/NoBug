import { describe, expect, it } from "vitest";
import { isValidEmail, isValidName, FORBIDDEN_RE } from "@/lib/validation";

describe("name rule (feedback C)", () => {
  it("accepts letters of any script with spaces, hyphens and apostrophes", () => {
    for (const n of ["Əli Vəliyev", "Jean-Luc", "O'Brien", "Иван Петров", "Ayşə İ", "Zeynəb"]) expect(isValidName(n), n).toBe(true);
  });
  it("rejects markup, quotes, slashes, digits and single characters", () => {
    for (const n of ["<script>", 'Əli "V"', "a/b", "Əli\\V", "Əli 2", "A", "", "  ", "🚀 Rocket", "Əli--", "-Əli"]) expect(isValidName(n), n).toBe(false);
  });
});

describe("e-mail rule (feedback C)", () => {
  it("accepts ordinary addresses", () => {
    for (const e of ["a@b.az", "first.last+tag@example.co.uk", "qa-test@sub.example.com"]) expect(isValidEmail(e), e).toBe(true);
  });
  it("rejects malformed addresses and forbidden characters", () => {
    for (const e of ["test@", "test.az", "te st@x.az", "a@b", "a@b.a", "<script>@x.az", "a'b@x.az", "a@b.az/", 'a"b@x.az']) expect(isValidEmail(e), e).toBe(false);
  });
  it("FORBIDDEN_RE covers < > / \\ \" '", () => {
    for (const ch of ["<", ">", "/", "\\", '"', "'"]) expect(FORBIDDEN_RE.test(`x${ch}y`)).toBe(true);
    expect(FORBIDDEN_RE.test("Əli Vəliyev-Zadə")).toBe(false);
  });
});
