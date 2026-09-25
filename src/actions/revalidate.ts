import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/i18n/config";

/** Public pages are locale-prefixed; content edits touch every language. */
export function revalidateSite(...paths: string[]) {
  for (const l of LOCALES) {
    revalidatePath(`/${l}`);
    for (const p of paths) revalidatePath(`/${l}${p}`);
  }
}
