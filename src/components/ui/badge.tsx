import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1e1e1e] text-[#F0EFED]",
        secondary: "border-[rgba(255,255,255,0.1)] bg-transparent text-[#888]",
        accent: "border-transparent bg-[#536878]/30 text-[#8aaabb]",
        lime: "border-transparent bg-[#C5F04A]/15 text-[#C5F04A]",
        destructive: "border-transparent bg-destructive/20 text-destructive",
        outline: "border-[rgba(255,255,255,0.15)] text-[#888]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
