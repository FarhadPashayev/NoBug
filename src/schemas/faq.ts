import { z } from "zod";
import { localizedString } from "./common";

export const faqSchema = z.object({
  question: localizedString(200),
  answer: localizedString(1500),
  isActive: z.boolean().default(true),
});
export type FaqInput = z.infer<typeof faqSchema>;
