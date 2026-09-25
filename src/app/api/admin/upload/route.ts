import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireApiUser } from "@/lib/auth/guard";
import { fail, handleError } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"];

/**
 * Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is present (the
 * production filesystem is read-only); otherwise they are written to
 * public/uploads for local development.
 */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Fayl tapılmadı");
    if (!TYPES.includes(file.type)) return fail("Yalnız PNG, JPG, WEBP, AVIF və ya SVG");
    if (file.size > MAX_BYTES) return fail("Maksimum 5 MB");

    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`nobug/${name}`, file, { access: "public", contentType: file.type });
      return NextResponse.json({ url: blob.url });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    return handleError(e);
  }
}
