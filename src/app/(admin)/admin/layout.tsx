import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { AdminProviders } from "@/components/admin/providers";
import { OfflineBanner } from "@/components/ui/offline-banner";
import "./admin.css";

// The admin panel renders its own document: the public site's root layout
// lives under [lang] and carries the marketing theme.
const interTight = Inter_Tight({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-inter-tight", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b132b" };

export const metadata: Metadata = {
  title: { default: "nobug admin", template: "%s — nobug admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // No theme class on <html>: next-themes owns it, and a hardcoded one is
  // re-applied on every render, undoing the toggle.
  return (
    <html lang="az" className={`${interTight.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        <AdminProviders>
          {children}
          <OfflineBanner lang="az" />
        </AdminProviders>
      </body>
    </html>
  );
}
