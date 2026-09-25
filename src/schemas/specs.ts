import { z } from "zod";
import { localizedString, required, str } from "./common";

export const specGroupSchema = z.object({
  name: localizedString(120),
});
export type SpecGroupInput = z.infer<typeof specGroupSchema>;

export const specItemSchema = z.object({
  groupId: z.string().min(1, "Qrup seçin"),
  name: localizedString(200),
  value: required(200),
  unit: str(40).default(""),
});
export type SpecItemInput = z.infer<typeof specItemSchema>;
