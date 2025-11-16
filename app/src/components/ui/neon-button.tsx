
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
  "relative group inline-flex items-center justify-center gap-1.5 rounded-full border text-center text-sm font-medium text-foreground transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A33A4]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/0",
        solid:
          "border-transparent bg-blue-500 text-white hover:border-foreground/50 hover:bg-blue-600",
        ghost: "border-transparent bg-transparent hover:border-[#2A33A4]/30 hover:bg-white/10",
      },
      size: {
        default: "px-6 py-2",
        sm: "px-4 py-1.5 text-xs",
        lg: "px-9 py-2.5 text-base",
        toolbar: "h-10 w-10 p-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

type BaseProps = VariantProps<typeof buttonVariants> & {
  neon?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type LinkButtonProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "color"> & {
    href: string;
  };

type NativeButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const Button = React.forwardRef<ButtonElement, ButtonProps>((props, ref) => {
  const { className, neon = true, size, variant, children, ...restProps } = props;

  const sharedClasses = cn(buttonVariants({ variant, size }), className);
  const content = (
    <>
      <span
        className={cn(
          "absolute inset-x-0 inset-y-0 mx-auto hidden h-px w-3/4 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 dark:via-blue-500",
          neon && "block",
        )}
      />
      {children}
    </>
  );

  if ("href" in restProps && restProps.href) {
    const { href, ...anchorProps } = restProps as LinkButtonProps;
    return (
      <Link
        href={href}
        className={sharedClasses}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { type, ...buttonProps } = restProps as NativeButtonProps;

  return (
    <button
      className={sharedClasses}
      type={type ?? "button"}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...buttonProps}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };


