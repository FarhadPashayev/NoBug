import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-ad-muted text-ad-muted-fg",
  accent: "bg-ad-accent/15 text-ad-accent",
  success: "bg-emerald-500/15 text-emerald-500",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-ad-danger/15 text-ad-danger",
} as const;

export function Badge({ tone = "neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone], className)} {...props} />;
}
