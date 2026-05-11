import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#F0EFED] text-[#0A0A0A] hover:bg-white font-semibold tracking-tight",
        accent: "bg-[#536878] text-[#F0EFED] hover:bg-[#607d8d] font-medium",
        lime: "bg-[#C5F04A] text-[#0A0A0A] hover:bg-[#d4ff55] font-semibold tracking-tight",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-[rgba(255,255,255,0.12)] bg-transparent text-[#F0EFED] hover:bg-[#161616] hover:border-[rgba(255,255,255,0.2)]",
        secondary: "bg-[#1a1a1a] text-[#F0EFED] hover:bg-[#222] border border-[rgba(255,255,255,0.08)]",
        ghost: "text-[#888] hover:text-[#F0EFED] hover:bg-[#161616]",
        link: "text-[#F0EFED] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
