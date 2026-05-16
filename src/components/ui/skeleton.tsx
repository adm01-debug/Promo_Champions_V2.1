import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "relative overflow-hidden rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-muted/50 dark:bg-muted/30",
        intense: "bg-muted/80",
        subtle: "bg-muted/30",
        primary: "bg-primary/8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Use branded shimmer with primary color tint */
  branded?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, branded = true, ...props }, ref) => {
    const shimmerGradient = branded
      ? "from-transparent via-primary/[0.12] to-transparent"
      : "from-transparent via-muted-foreground/10 to-transparent";

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      >
        <div 
          className={cn(
            "absolute inset-0 -translate-x-full bg-gradient-to-r animate-shimmer",
            shimmerGradient
          )} 
        />
        {branded && (
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,rgba(14,165,233,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-scan" />
        )}
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
