import { z } from "zod";
import { required, str } from "./common";

export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "CONTACTED", "ARCHIVED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = { NEW: "Yeni", IN_PROGRESS: "İşlənir", CONTACTED: "Əlaqə qurulub", ARCHIVED: "Arxiv" };

/** Public POST /api/leads — the only way a lead is created. */
export const leadCreateSchema = z.object({
  name: required(120, "Ad yazın"),
  email: z.union([z.literal(""), z.string().trim().email()]).default(""),
  phone: str(40).default(""),
  message: str(4000).default(""),
  service: str(80).default(""),
  locale: z.enum(["az", "en", "ru"]).default("az"),
  source: z.enum(["contact", "anket"]).default("contact"),
  answers: z.record(z.string(), z.unknown()).optional(),
  /** honeypot — must stay empty */
  website: z.string().max(200).default(""),
  /** ms timestamp when the form was rendered; sub-3s submits are bots */
  startedAt: z.number().optional(),
});
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

/** Admin edits: status and internal notes only. */
export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  notes: z.string().trim().max(4000).optional(),
});
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default("");
export const leadFilterSchema = z.object({
  q: str(120).default(""),
  status: z.enum(LEAD_STATUSES).or(z.literal("")).default(""),
  from: day,
  to: day,
});
export type LeadFilter = z.infer<typeof leadFilterSchema>;
