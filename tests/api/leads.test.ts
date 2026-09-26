import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { base, contact, freshIp, postLead } from "./helpers";

describe("POST /api/leads", () => {
  it("LEAD-01: valid payload → 201 and a NEW row", async () => {
    const name = `API ${Date.now()}`;
    const { status, json } = await postLead(contact({ name }));
    expect(status).toBe(201);
    expect(json.ok).toBe(true);
    const row = await prisma.lead.findFirstOrThrow({ where: { name } });
    expect(row.status).toBe("NEW");
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it("LEAD-02: missing name / bad email / empty subject → 400 with field errors, no row", async () => {
    const before = await prisma.lead.count();
    const { status, json } = await postLead(contact({ name: "", email: "nope", subject: "" }));
    expect(status).toBe(400);
    expect(Object.keys(json.fieldErrors as object)).toEqual(expect.arrayContaining(["name", "email", "subject"]));
    expect(await prisma.lead.count()).toBe(before);
  });

  it("LEAD-03: honeypot filled → 200 and no row", async () => {
    const before = await prisma.lead.count();
    const { status } = await postLead(contact({ name: "Bot", website: "http://spam" }));
    expect(status).toBe(200);
    expect(await prisma.lead.count()).toBe(before);
  });

  it("LEAD-04: sixth request from one IP → 429", async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) expect((await postLead(contact({ name: `Limit ${i}` }), ip)).status).toBe(201);
    expect((await postLead(contact({ name: "Limit 6" }), ip)).status).toBe(429);
  });

  it("LEAD-05: status/notes in the body are ignored", async () => {
    const name = `Inject ${Date.now()}`;
    await postLead(contact({ name, status: "ARCHIVED", notes: "hacked" }));
    const row = await prisma.lead.findFirstOrThrow({ where: { name } });
    expect(row.status).toBe("NEW");
    expect(row.notes).toBe("");
  });

  it("LEAD-06: HTML in the message is stored as text", async () => {
    const name = `Xss ${Date.now()}`;
    await postLead(contact({ name, subject: '<script>alert("x")</script>' }));
    const row = await prisma.lead.findFirstOrThrow({ where: { name } });
    expect(row.message).toBe('<script>alert("x")</script>');
  });

  it("anket payload is accepted and stores answers", async () => {
    const name = `Anket ${Date.now()}`;
    const { status } = await postLead({ source: "anket", lang: "az", service: "web", answers: {}, name, channel: "email", contact: "anket@example.com", consent: true, website: "", openedAt: Date.now() - 9000 });
    expect(status).toBe(201);
    const row = await prisma.lead.findFirstOrThrow({ where: { name } });
    expect(row.source).toBe("anket");
    expect(row.answers).toBeTruthy();
  });

  it("LEAD-17: leads are never readable publicly", async () => {
    expect((await fetch(`${base}/api/leads`)).status).toBe(404);
    for (const p of ["/api/admin/leads", "/api/admin/leads/x"]) expect([401, 404]).toContain((await fetch(`${base}${p}`)).status);
  });

  it("old endpoints alias /api/leads", async () => {
    const r = await fetch(`${base}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": freshIp() }, body: JSON.stringify(contact({ name: "Alias" })) });
    expect(r.status).toBe(201);
  });
});
