import { z } from "zod";
import { localizedString, required } from "./common";

export const statSchema = z.object({
  value: required(40),
  label: localizedString(160),
  source: localizedString(160, false),
});
export type StatInput = z.infer<typeof statSchema>;
