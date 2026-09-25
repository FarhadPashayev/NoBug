import { z } from "zod";
import { image, localizedString, slug, str } from "./common";

export const projectSchema = z.object({
  slug,
  title: localizedString(200),
  shortDescription: localizedString(600, false),
  /** Tiptap HTML per language */
  content: localizedString(50000, false),
  duration: str(60).default(""),
  year: str(20).default(""),
  cover: image,
  /** tag names (AZ); rows are created on demand and matched by slug */
  tags: z.array(str(40)).max(12).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
export type ProjectInput = z.infer<typeof projectSchema>;
