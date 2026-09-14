"use client";

import { sendGAEvent } from "@next/third-parties/google";

// GA4 custom events. The taxonomy is the point: which of the twelve services
// people actually want. Measurement ID comes from NEXT_PUBLIC_GA_ID; when it
// is unset nothing is loaded and these calls are no-ops.
export type AnalyticsEvent =
  | { name: "service_click"; params: { service_id: string; position: "primary" | "secondary"; locale: string } }
  | { name: "enquiry_start"; params: { service_id: string; locale: string } }
  | { name: "enquiry_step"; params: { step: number; service_id: string } }
  | { name: "enquiry_submit"; params: { service_id: string; locale: string } }
  | { name: "contact_email_click"; params: { locale: string } }
  | { name: "contact_phone_click"; params: { locale: string } }
  | { name: "contact_whatsapp_click"; params: { locale: string } }
  | { name: "language_switch"; params: { from: string; to: string } };

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function track(event: AnalyticsEvent) {
  if (!GA_ID || typeof window === "undefined") return;
  sendGAEvent("event", event.name, event.params);
}
