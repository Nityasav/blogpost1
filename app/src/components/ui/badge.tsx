import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A33A4] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#2A33A4] bg-[#2A33A4] text-white",
        secondary: "border-[#2A33A4]/40 bg-white text-[#2A33A4]",
        outline: "border-[#2A33A4]/40 bg-transparent text-[#2A33A4]",
        neutral: "border-transparent bg-[#2A33A4]/08 text-[#2A33A4]/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
