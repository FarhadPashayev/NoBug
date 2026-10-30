import { z } from "zod";
import { FORBIDDEN_RE, isValidEmail, isValidName } from "@/lib/validation";

// The home page's contact form — one schema for the browser (inline errors)
// and for POST /api/leads. Only name and email are required; the rest helps
// the first reply but never blocks a visitor.

export const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const clean = (max: number) => z.string().trim().max(max).refine((v) => !FORBIDDEN_RE.test(v), "Invalid characters");

export const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(120).refine(isValidName, "invalid"),
  email: z.string().trim().min(1, "required").max(160).refine(isValidEmail, "invalid"),
  company: clean(120).default(""),
  phone: z.string().trim().max(40).refine((v) => v === "" || PHONE_RE.test(v), "invalid").default(""),
  service: clean(120).default(""),
  budget: clean(60).default(""),
  // free text: quotes and slashes are normal in a project description; it is escaped in the e-mail
  message: z.string().trim().max(2000).default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;
