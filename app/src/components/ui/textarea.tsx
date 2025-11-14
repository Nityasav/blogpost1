import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-2xl border border-[#2A33A4]/25 bg-white px-4 py-3 text-sm text-[#2A33A4] shadow-[0_18px_50px_rgba(42,51,164,0.08)] transition-all duration-300 ease-out ring-offset-white placeholder:text-[#2A33A4]/45 focus-visible:border-[#2A33A4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A33A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
