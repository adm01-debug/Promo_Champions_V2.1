import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border/50 shadow-sm hover:shadow-md hover:border-primary/15 dark:border-border/30 dark:hover:border-primary/20 dark:shadow-[0_0_0_1px_hsl(var(--primary)/0.04)]",
        elevated: "bg-card border-border/40 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20",
        floating: "bg-card border-border/30 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-primary/25",
        glass: "glass glass-hover backdrop-blur-md",
        depth: "card-depth bg-gradient-to-b from-card to-card/95",
        interactive: "bg-card border-border/40 shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 cursor-pointer",
        ghost: "bg-transparent border-transparent shadow-none",
        modern: "card-modern bg-card border-border/40",
        glow: "bg-card border-border/40 shadow-sm hover:shadow-glow-primary hover:border-primary/40",
        gradient: "bg-gradient-to-br from-card via-card to-muted/20 border-border/40 shadow-sm hover:shadow-md",
        outlined: "bg-transparent border-2 border-border hover:border-primary/50",
        success: "bg-card border-l-4 border-l-success border-border/40 shadow-sm hover:shadow-glow-success",
        warning: "bg-card border-l-4 border-l-warning border-border/40 shadow-sm hover:shadow-glow-warning",
        destructive: "bg-card border-l-4 border-l-destructive border-border/40 shadow-sm hover:shadow-glow-destructive",
        primary: "bg-card border-l-4 border-l-primary border-border/40 shadow-sm hover:shadow-glow-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover = true, onClick, ...props }, ref) => {
    const isInteractive = variant === 'interactive' || !!onClick;
    
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteractive) {
        triggerHaptic('light');
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        className={cn(
          cardVariants({ variant }),
          !hover && "hover:transform-none hover:shadow-none",
          isInteractive && "outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
          className
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
