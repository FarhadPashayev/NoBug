import { z } from "zod";
import { image, localizedString, required, url } from "./common";

export const heroSchema = z.object({
  title: localizedString(240),
  subtitle: localizedString(600, false),
  primaryCtaLabel: localizedString(80, false),
  primaryCtaUrl: url.default(""),
  secondaryCtaLabel: localizedString(80, false),
  secondaryCtaUrl: url.default(""),
  heroImage: image,
});
export type HeroInput = z.infer<typeof heroSchema>;

export const partnerLogoSchema = z.object({
  name: required(120),
  logo: image.refine((v) => Boolean(v.url), "Loqo yükləyin"),
  url: url.default(""),
  isActive: z.boolean().default(true),
});
export type PartnerLogoInput = z.infer<typeof partnerLogoSchema>;
