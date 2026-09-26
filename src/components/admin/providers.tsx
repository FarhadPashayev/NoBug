"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  // one client per browser session; created lazily so it is never shared between requests
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // flaky connections: two retries, 1 s → 2 s → 4 s; mutations never retry (they are not idempotent)
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 2, retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000) },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={client}>
        {children}
        {/* bottom-right: a top-right toast covers the topbar's theme/profile/logout controls */}
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
