import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] transition-[border-color,background-color,color,box-shadow] focus:outline-none focus:ring-2 focus:ring-ring/45",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/95 text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.24)] hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary/95 text-secondary-foreground hover:bg-secondary/75",
        destructive:
          "border-transparent bg-destructive/95 text-destructive-foreground shadow-[0_8px_20px_hsl(var(--destructive)/0.24)] hover:bg-destructive/80",
        outline: "border-border/80 bg-background/60 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
