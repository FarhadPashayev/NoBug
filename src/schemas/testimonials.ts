import { z } from "zod";
import { image, localizedString, required } from "./common";

export const testimonialSchema = z.object({
  name: required(80),
  role: localizedString(120, false),
  quote: localizedString(600),
  rating: z.coerce.number().int().min(1, "1–5").max(5, "1–5").default(5),
  avatar: image,
  // shown only on the featured (big) card
  photo: image,
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
