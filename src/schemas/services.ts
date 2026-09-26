import { z } from "zod";
import { image, localizedString, slug } from "./common";

export const serviceCategorySchema = z.object({
  slug,
  name: localizedString(120),
});
export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;

export const serviceSchema = z.object({
  slug,
  name: localizedString(160),
  shortDescription: localizedString(600, false),
  details: localizedString(20000, false),
  /** lucide icon name ("Server") — ignored when an image is uploaded */
  /** PascalCase lucide name ("Shield"); existence is checked on the server */
  icon: z.string().trim().max(60).regex(/^([A-Z][A-Za-z0-9]*)?$/, "Lucide ikon adı (məs. Shield)").default(""),
  image,
  categoryId: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
