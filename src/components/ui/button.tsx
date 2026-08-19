import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-gradient text-white shadow-md hover:shadow-lg hover:brightness-110",
        secondary:
          "bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100",
        outline:
          "border border-border bg-background text-foreground hover:border-brand-300 hover:bg-surface",
        ghost: "text-foreground hover:bg-surface-2",
        link: "text-brand-700 underline-offset-4 hover:underline rounded-none h-auto px-0",
        whatsapp: "bg-[#25D366] text-white shadow-md hover:brightness-105 hover:shadow-lg",
        dark: "bg-brand-900 text-white hover:bg-brand-800 shadow-md",
        danger: "bg-danger text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-13 px-7 text-base [&_svg]:size-5",
        xl: "h-14 px-8 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...(!asChild ? { type: type ?? "button" } : {})}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
