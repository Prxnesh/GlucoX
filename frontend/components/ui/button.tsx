import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#54c4ff_100%)] text-primary-foreground shadow-[0_16px_34px_rgba(0,158,140,0.24)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(0,158,140,0.28)] dark:shadow-[0_18px_38px_rgba(2,20,26,0.45)]",
        secondary:
          "bg-white/80 text-foreground border border-white/60 shadow-[var(--shadow-card)] hover:bg-white dark:border-white/12 dark:bg-white/10 dark:hover:bg-white/14",
        ghost:
          "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10",
        danger:
          "bg-[linear-gradient(135deg,#ff7d7d_0%,#ff9f6e_100%)] text-white shadow-[0_16px_34px_rgba(255,113,113,0.22)] hover:-translate-y-0.5 dark:shadow-[0_18px_36px_rgba(54,16,16,0.5)]"
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

