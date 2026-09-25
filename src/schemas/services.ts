import { z } from "zod";
import { image, localizedString, slug, str } from "./common";

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
  icon: str(60).default(""),
  image,
  categoryId: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
