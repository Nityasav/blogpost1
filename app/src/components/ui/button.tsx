import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const baseButtonClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl border text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A33A4] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] ring-offset-white";

const buttonVariants = cva(baseButtonClasses, {
  variants: {
    variant: {
      default:
        "border-[#2A33A4] bg-[#2A33A4] text-white shadow-[0_18px_45px_rgba(42,51,164,0.35)] hover:bg-[#2A33A4]/90",
      secondary:
        "border-[#2A33A4]/35 bg-white text-[#2A33A4] shadow-[0_12px_36px_rgba(42,51,164,0.14)] hover:border-[#2A33A4]/70 hover:bg-white",
      outline:
        "border-[#2A33A4]/40 bg-transparent text-[#2A33A4] hover:bg-[#2A33A4]/5",
      ghost:
        "border-transparent bg-transparent text-[#2A33A4]/70 hover:text-[#2A33A4] hover:bg-[#2A33A4]/10",
      link: "border-transparent bg-transparent text-[#2A33A4] underline-offset-4 hover:underline",
    },
    size: {
      default: "h-12 px-6",
      sm: "h-10 rounded-xl px-4",
      lg: "h-14 rounded-3xl px-8 text-base",
      icon: "h-11 w-11 rounded-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
