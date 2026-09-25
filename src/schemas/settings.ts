import { z } from "zod";
import { localizedString, str, url } from "./common";

export const FOOTER_GROUPS = ["services", "company", "legal"] as const;
export type FooterGroup = (typeof FOOTER_GROUPS)[number];

export const footerLinkSchema = z.object({
  id: z.string().optional(),
  group: z.enum(FOOTER_GROUPS).default("company"),
  label: localizedString(80),
  url: url.refine((v) => v !== "", "Link yazın"),
});
export type FooterLinkInput = z.infer<typeof footerLinkSchema>;

export const settingsSchema = z.object({
  // field-array friendly: react-hook-form wants objects, the DB stores String[]
  phones: z.array(z.object({ value: str(40).min(1, "Nömrə yazın") })).max(5),
  email: z.union([z.literal(""), z.string().trim().email("Düzgün e-poçt deyil")]).default(""),
  address: localizedString(200, false),
  hours: localizedString(120, false),
  linkedin: url.default(""),
  instagram: url.default(""),
  facebook: url.default(""),
  youtube: url.default(""),
  x: url.default(""),
  footerLinks: z.array(footerLinkSchema).max(40).default([]),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
