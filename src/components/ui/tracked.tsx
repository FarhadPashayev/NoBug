"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** next/link that fires one GA4 event on click. */
export function TrackedLink({ event, onClick, ...props }: ComponentProps<typeof Link> & { event: AnalyticsEvent }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}

/** plain anchor (mailto:, tel:, external) that fires one GA4 event on click. */
export function TrackedAnchor({ event, onClick, ...props }: ComponentProps<"a"> & { event: AnalyticsEvent }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}
