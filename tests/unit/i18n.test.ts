import { describe, expect, it } from "vitest";
import { asLocalized, emptyLocalized, loc, t } from "@/lib/i18n/localized";
import { localizeHref } from "@/lib/content";

describe("t() fallback (I18N-03, I18N-04, I18N-08)", () => {
  it("falls back to az when the locale is empty or missing", () => {
    expect(t({ az: "A" }, "ru")).toBe("A");
    expect(t({ az: "A", ru: "" }, "ru")).toBe("A");
    expect(t({ az: "A", ru: "   " }, "ru")).toBe("A");
  });
  it("returns the requested locale when present", () => expect(t({ az: "A", ru: "Р" }, "ru")).toBe("Р"));
  it("never returns undefined for junk input", () => {
    expect(t(null, "en")).toBe("");
    expect(t(undefined, "en")).toBe("");
    expect(t("plain", "en")).toBe("plain");
    expect(t(42, "en")).toBe("");
  });
});

describe("asLocalized / emptyLocalized / loc", () => {
  it("coerces unknown json into the full shape", () => {
    expect(asLocalized({ az: "x" })).toEqual({ az: "x", en: "", ru: "" });
    expect(asLocalized("nope")).toEqual(emptyLocalized());
    expect(loc("a", "b")).toEqual({ az: "a", en: "b", ru: "" });
  });
});

describe("localizeHref", () => {
  it("prefixes relative links and hashes with the locale", () => {
    expect(localizeHref("/anket", "en")).toBe("/en/anket");
    expect(localizeHref("#xidmetler", "ru")).toBe("/ru#xidmetler");
    expect(localizeHref("anket", "az")).toBe("/az/anket");
  });
  it("leaves absolute and already-prefixed links alone", () => {
    expect(localizeHref("https://x.az/y", "en")).toBe("https://x.az/y");
    expect(localizeHref("mailto:a@b.c", "en")).toBe("mailto:a@b.c");
    expect(localizeHref("/az/anket", "en")).toBe("/az/anket");
    expect(localizeHref("", "en")).toBe("");
  });
});
