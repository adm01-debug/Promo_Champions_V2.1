import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        success: "border-transparent bg-success/15 text-success hover:bg-success/25",
        warning: "border-transparent bg-warning/15 text-warning hover:bg-warning/25",
        info: "border-transparent bg-info/15 text-info hover:bg-info/25",
        pending: "border-transparent bg-warning/15 text-warning hover:bg-warning/25",
        completed: "border-transparent bg-success/15 text-success hover:bg-success/25",
        cancelled: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        // Pipeline stages
        qualified: "border-transparent bg-primary/15 text-primary hover:bg-primary/25",
        proposal: "border-transparent bg-secondary/15 text-secondary-foreground hover:bg-secondary/25",
        negotiation: "border-transparent bg-accent/15 text-accent-foreground hover:bg-accent/25",
        won: "border-transparent bg-success/15 text-success hover:bg-success/25",
        lost: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        // Gamification
        gold: "border-transparent bg-rank-gold/15 text-rank-gold hover:bg-rank-gold/25",
        silver: "border-transparent bg-rank-silver/15 text-rank-silver hover:bg-rank-silver/25",
        bronze: "border-transparent bg-rank-bronze/15 text-rank-bronze hover:bg-rank-bronze/25",
        xp: "border-transparent bg-xp/15 text-xp hover:bg-xp/25",
        streak: "border-transparent bg-streak/15 text-streak hover:bg-streak/25",
        // Priority
        high: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        medium: "border-transparent bg-warning/15 text-warning hover:bg-warning/25",
        low: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        // Status indicators
        active: "border-transparent bg-online/15 text-online hover:bg-online/25",
        inactive: "border-transparent bg-offline/15 text-offline hover:bg-offline/25",
        live: "border-transparent bg-live-pulse/15 text-live-pulse hover:bg-live-pulse/25 animate-pulse",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
