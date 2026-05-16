import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 press-scale",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border border-input bg-background hover:bg-accent/10 hover:border-primary/30 hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Glow variants for CTAs
        glow: "bg-primary text-primary-foreground hover:bg-primary/90 hover-glow shadow-md",
        "glow-secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover-glow-secondary shadow-md",
        "glow-success": "bg-status-success text-primary-foreground hover:bg-status-success/90 hover-glow-success shadow-md",
        "glow-accent": "bg-accent text-accent-foreground hover:bg-accent/90 hover-glow-accent shadow-md",
        // Animated glow pulse for primary CTAs
        "glow-pulse": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md animate-glow-pulse",
        "glow-pulse-success": "bg-status-success text-primary-foreground hover:bg-status-success/90 shadow-md animate-glow-pulse",
        "glow-pulse-accent": "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md animate-glow-pulse",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
  loading?: boolean;
  loadingText?: string;
}

const Button = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        triggerHaptic(variant === 'destructive' ? 'medium' : 'light');
      }
      onClick?.(e);
    };

    if (asChild) {
      return (
        <Comp 
          className={cn(buttonVariants({ variant, size, className }))} 
          ref={ref} 
          onClick={onClick}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    return (
      <Comp 
        className={cn(
          buttonVariants({ variant, size, className }), 
          loading && "cursor-wait relative"
        )} 
        ref={ref} 
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <span className={cn(loading && !loadingText && "opacity-0", "flex items-center gap-2")}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Comp>
    );
  },
));
Button.displayName = "Button";

export { Button, buttonVariants };
