"use client";

import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-ad-fg", className)} {...props} />;
}

const control =
  "w-full rounded-lg border border-ad-border bg-ad-bg px-3 py-2 text-sm text-ad-fg placeholder:text-ad-muted-fg transition-colors focus:border-ad-accent focus:outline-none focus:ring-2 focus:ring-ad-ring/40 disabled:opacity-60 aria-[invalid=true]:border-ad-danger";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-10 appearance-none bg-[length:0]", className)} {...props} />;
}

/** label + control + error, wired to react-hook-form's messages. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-xs text-ad-muted-fg">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs text-ad-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
