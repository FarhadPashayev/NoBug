import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { adminCookie, fixture, upload } from "./helpers";

const hasStorage = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let cookie = "";
beforeAll(async () => {
  cookie = await adminCookie();
});

describe("POST /api/admin/upload", () => {
  it("UPL-05: no session → 401", async () => expect((await upload(fixture("valid.png", "image/png"))).status).toBe(401));
  it("UPL-03: PDF → 400", async () => expect((await upload(fixture("not-an-image.pdf", "application/pdf"), "projects", cookie)).status).toBe(400));
  it("UPL-04: PDF bytes named .jpg → 400 (content sniffing)", async () => {
    const r = await upload(fixture("fake.jpg", "image/jpeg"), "projects", cookie);
    expect(r.status).toBe(400);
    expect(r.json.error).toMatch(/şəkil deyil/);
  });
  it("UPL-02: > 5 MB → 400", async () => expect((await upload(fixture("too-large.jpg", "image/jpeg"), "projects", cookie)).status).toBe(400));
  it("rejects an unknown folder", async () => expect((await upload(fixture("valid.png", "image/png"), "etc", cookie)).status).toBe(400));

  it.skipIf(!hasStorage)("UPL-01 / UPL-08 / HERO-04: valid image lands in the test bucket under the folder", async () => {
    const r = await upload(fixture("valid.jpg", "image/jpeg"), "hero", cookie);
    expect(r.status).toBe(200);
    expect(r.json.path).toMatch(/^hero\/\d+-[a-z0-9]{6}\.jpg$/);
    expect(r.json.url).toContain(`/${process.env.MEDIA_BUCKET}/${r.json.path}`);
    const got = await fetch(r.json.url);
    expect(got.status).toBe(200);
    // clean up the test bucket
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    await sb.storage.from(process.env.MEDIA_BUCKET!).remove([r.json.path]);
  });
});

describe("UPL-06: service role key never reaches the client bundle", () => {
  it("no service_role token in .next/static", () => {
    const dir = ".next/static";
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(js|css|json|txt)$/.test(f)) files.push(p);
      }
    };
    walk(dir);
    expect(files.length).toBeGreaterThan(0);
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      if (key) expect(text.includes(key), f).toBe(false);
      expect(text.includes('"role":"service_role"'), f).toBe(false);
      expect(/SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*"[^"]{20,}/.test(text), f).toBe(false);
    }
  });
});
