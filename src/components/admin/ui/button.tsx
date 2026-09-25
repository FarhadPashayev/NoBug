import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ad-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ad-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ad-accent text-ad-accent-fg hover:bg-ad-accent/90",
        outline: "border border-ad-border bg-transparent hover:bg-ad-muted",
        ghost: "hover:bg-ad-muted",
        danger: "bg-ad-danger text-white hover:bg-ad-danger/90",
        subtle: "bg-ad-muted text-ad-fg hover:bg-ad-border",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-11 px-6", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  loading = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={props.disabled || loading} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
