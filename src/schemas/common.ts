import { z } from "zod";

// Shared building blocks for the admin schemas. Forms (react-hook-form +
// zodResolver) and server actions parse with the same objects.

export const str = (max = 200) => z.string().trim().max(max);
export const required = (max = 200, message = "Doldurulmalıdır") => str(max).min(1, message);
export const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(https?:\/\/|\/|#|mailto:|tel:)/.test(v), "Düzgün ünvan deyil");
export const order = z.coerce.number().int().min(0).default(0);
export const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9-]*$/, "Yalnız kiçik latın hərfləri, rəqəm və defis")
  .default("");

/** `{ url, path }` pair for an uploaded image; both null when none. */
export const image = z.object({ url: z.string().trim().max(600).nullable(), path: z.string().trim().max(400).nullable() }).default({ url: null, path: null });
export type ImageRef = z.infer<typeof image>;

export const reorderSchema = z.object({ ids: z.array(z.string().min(1)).max(500) });
export const idSchema = z.string().min(1);

export { localizedString } from "@/lib/i18n/localized";
