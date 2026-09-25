import { z } from "zod";

// One source of truth for validation: the forms (react-hook-form + zodResolver)
// and the route handlers both parse with these.

const str = (max = 200) => z.string().trim().max(max);
const required = (max = 200, message = "Doldurulmalıdır") => str(max).min(1, message);
const url = z.string().trim().max(500).refine((v) => v === "" || /^(https?:\/\/|\/|mailto:|tel:)/.test(v), "Düzgün ünvan deyil");
const locale = z.enum(["az", "en", "ru"]).default("az");

export const loginSchema = z.object({
  email: z.string().trim().email("Düzgün e-poçt deyil"),
  password: z.string().min(8, "Ən azı 8 simvol"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: required(120),
  email: z.string().trim().email("Düzgün e-poçt deyil"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Cari şifrəni yazın"),
    newPassword: z.string().min(10, "Ən azı 10 simvol"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Şifrələr uyğun gəlmir" });
export type PasswordInput = z.infer<typeof passwordSchema>;

export const heroSchema = z.object({
  locale,
  eyebrow: str(160).default(""),
  title: required(240),
  subtitle: str(600).default(""),
  primaryLabel: str(80).default(""),
  primaryHref: url.default(""),
  secondaryLabel: str(80).default(""),
  secondaryHref: url.default(""),
  imageUrl: z.string().trim().max(500).nullable().default(null),
});
export type HeroInput = z.infer<typeof heroSchema>;

export const partnerLogoSchema = z.object({
  id: z.string().optional(),
  name: required(120),
  imageUrl: z.string().trim().min(1, "Şəkil yükləyin").max(500),
  href: url.default(""),
  position: z.number().int().min(0).default(0),
});
export type PartnerLogoInput = z.infer<typeof partnerLogoSchema>;

export const projectSchema = z.object({
  locale,
  slug: str(80).default(""),
  title: required(200),
  summary: str(600).default(""),
  duration: str(60).default(""),
  year: str(20).default(""),
  coverUrl: z.string().trim().max(500).nullable().default(null),
  tags: z.array(str(40)).max(12).default([]),
  content: z.string().trim().max(20000).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const statSchema = z.object({
  locale,
  value: required(40),
  label: required(160),
  source: str(160).default(""),
  position: z.number().int().min(0).default(0),
});
export type StatInput = z.infer<typeof statSchema>;

export const serviceCategorySchema = z.object({
  locale,
  slug: str(80).default(""),
  name: required(120),
  position: z.number().int().min(0).default(0),
});
export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;

export const serviceSchema = z.object({
  locale,
  slug: str(80).default(""),
  name: required(160),
  summary: str(600).default(""),
  details: z.string().trim().max(20000).default(""),
  icon: str(60).default(""),
  imageUrl: z.string().trim().max(500).nullable().default(null),
  categoryId: z.string().nullable().default(null),
  primary: z.boolean().default(false),
  published: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const specSchema = z.object({
  locale,
  group: str(120).default(""),
  parameter: required(200),
  value: required(200),
  unit: str(40).default(""),
  position: z.number().int().min(0).default(0),
});
export type SpecInput = z.infer<typeof specSchema>;

export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "CONTACTED", "ARCHIVED"] as const;
export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().trim().max(4000).optional(),
});
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export const footerLinkSchema = z.object({
  id: z.string().optional(),
  column: z.enum(["services", "company", "legal", "contact"]).default("company"),
  label: required(80),
  href: url,
  position: z.number().int().min(0).default(0),
});
export type FooterLinkInput = z.infer<typeof footerLinkSchema>;

export const settingsSchema = z.object({
  email: z.union([z.literal(""), z.string().email("Düzgün e-poçt deyil")]).default(""),
  phone: str(60).default(""),
  whatsapp: str(60).default(""),
  address: str(200).default(""),
  hours: str(120).default(""),
  linkedin: url.default(""),
  instagram: url.default(""),
  facebook: url.default(""),
  footerNote: str(300).default(""),
  footerLinks: z.array(footerLinkSchema).max(40).default([]),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const reorderSchema = z.object({ ids: z.array(z.string()).max(200) });
