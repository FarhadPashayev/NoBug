import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      <p className="text-sm font-medium text-ad-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-ad-muted-fg">{description}</p>}
      {action}
    </div>
  );
}
