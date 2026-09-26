import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guard";
import { fail, handleError } from "@/lib/admin/api-helpers";
import { MEDIA_FOLDERS, uploadImage, validateImage, type MediaFolder } from "@/lib/supabase";

export const runtime = "nodejs";

/** multipart: `file` + `folder` (hero | partners | projects | services) → { url, path } */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "");
    if (!(file instanceof File)) return fail("Fayl tapılmadı");
    if (!MEDIA_FOLDERS.includes(folder as MediaFolder)) return fail("Qovluq düzgün deyil");
    const invalid = validateImage(file);
    if (invalid) return fail(invalid);
    return NextResponse.json(await uploadImage(folder as MediaFolder, file));
  } catch (e) {
    if (e instanceof Error && /konfiqurasiya/.test(e.message)) return fail(e.message, 503);
    if (e instanceof Error && /şəkil deyil/.test(e.message)) return fail(e.message, 400);
    return handleError(e);
  }
}
