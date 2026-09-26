import { formatDate } from "@/lib/utils";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/schemas/leads";

export type LeadCsvRow = {
  createdAt: Date | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  source: string;
  locale: string;
  status: LeadStatus;
  notes: string;
  answers: unknown;
};

export const CSV_HEADER = ["Tarix", "Ad", "E-poçt", "Telefon", "Xidmət", "Mesaj", "Mənbə", "Dil", "Status", "Qeyd", "Cavablar"];

/** RFC 4180 quoting; every field is quoted so commas, quotes and newlines survive. */
export const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** UTF-8 BOM + semicolon separator so Excel (az/ru locales) opens it cleanly. */
export function leadsToCsv(rows: LeadCsvRow[]): string {
  const lines = rows.map((l) =>
    [formatDate(l.createdAt), l.name, l.email, l.phone, l.service, l.message, l.source, l.locale, LEAD_STATUS_LABELS[l.status], l.notes, l.answers ? JSON.stringify(l.answers) : ""].map(csvEscape).join(";"),
  );
  return "\uFEFF" + [CSV_HEADER.map(csvEscape).join(";"), ...lines].join("\r\n");
}
