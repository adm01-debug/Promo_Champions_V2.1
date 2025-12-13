import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "relative overflow-hidden rounded-md",
  {
    variants: {
      variant: {
        default: "bg-muted/60",
        intense: "bg-muted/80",
        subtle: "bg-muted/40",
        primary: "bg-primary/10",
      },
      shimmer: {
        default: "via-muted-foreground/10",
        intense: "via-muted-foreground/20",
        glow: "via-primary/15",
      },
    },
    defaultVariants: {
      variant: "default",
      shimmer: "default",
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, shimmer, ...props }: SkeletonProps) {
  const shimmerClass = shimmer === "intense" 
    ? "via-muted-foreground/20" 
    : shimmer === "glow" 
    ? "via-primary/15" 
    : "via-muted-foreground/10";

  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    >
      <div 
        className={cn(
          "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent animate-shimmer",
          shimmerClass
        )} 
      />
    </div>
  );
}

export { Skeleton, skeletonVariants };
