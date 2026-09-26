import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage, server side only. The service-role key must never reach
 * the browser: uploads go through /api/admin/upload and deletions happen in
 * server actions. Files live in the public "media" bucket under one of the
 * fixed folders; the DB keeps both the public URL and the object path.
 */

export const MEDIA_BUCKET = process.env.MEDIA_BUCKET || "media";
export const MEDIA_FOLDERS = ["hero", "partners", "projects", "services"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const hasStorage = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let client: SupabaseClient | null = null;
function storage() {
  if (!hasStorage) throw new Error("Supabase Storage konfiqurasiya olunmayıb (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  return client.storage;
}

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function validateImage(file: File): string | null {
  if (!TYPES[file.type]) return "Yalnız PNG, JPG, WEBP, AVIF və ya SVG";
  if (file.size > MAX_BYTES) return "Maksimum 5 MB";
  return null;
}

/** Type from the bytes, not the extension: a PDF renamed to .jpg is rejected. */
export function sniffImageType(bytes: Uint8Array): string | null {
  const hex = (n: number) => Array.from(bytes.slice(0, n), (b) => b.toString(16).padStart(2, "0")).join("");
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (hex(3) === "ffd8ff") return "image/jpeg";
  if (hex(8) === "89504e470d0a1a0a") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && /avi[fs]/.test(ascii(8, 12))) return "image/avif";
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 512)).trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)?(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(head)) return "image/svg+xml";
  return null;
}

/** Creates the public bucket on first use so a fresh project needs no manual step. */
async function ensureBucket() {
  const { data } = await storage().getBucket(MEDIA_BUCKET);
  if (data) return;
  const { error } = await storage().createBucket(MEDIA_BUCKET, { public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: Object.keys(TYPES) });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function uploadImage(folder: MediaFolder, file: File): Promise<{ url: string; path: string }> {
  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const real = sniffImageType(bytes);
  if (!real || !TYPES[real]) throw new Error("Faylın məzmunu şəkil deyil");
  await ensureBucket();
  // the name is generated — user file names (spaces, Azerbaijani letters) never reach storage
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${TYPES[real]}`;
  const { error } = await storage()
    .from(MEDIA_BUCKET)
    .upload(path, Buffer.from(bytes), { contentType: real, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Yükləmə alınmadı: ${error.message}`);
  const { data } = storage().from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Best-effort: a missing object must never fail the row delete. */
export async function deleteImages(paths: Array<string | null | undefined>) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (!list.length || !hasStorage) return;
  const { error } = await storage().from(MEDIA_BUCKET).remove(list);
  if (error) console.error("[storage] remove failed:", error.message);
}
