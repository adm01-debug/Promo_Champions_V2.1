import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RippleProps {
  x: number;
  y: number;
  size: number;
  id: number;
}

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border-2 border-input bg-transparent hover:bg-accent/10 hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  ripple?: boolean;
  haptic?: boolean;
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    loadingText, 
    ripple = true,
    haptic = true,
    children, 
    disabled, 
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<RippleProps[]>([]);
    const nextId = React.useRef(0);

    const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled || loading) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple: RippleProps = {
        x,
        y,
        size,
        id: nextId.current++,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Haptic feedback
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(event);
      onClick?.(event);
    };

    if (asChild) {
      return (
        <Slot 
          className={cn(buttonVariants({ variant, size, className }))} 
          ref={ref as React.Ref<HTMLElement>} 
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), loading && "cursor-wait")}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute rounded-full bg-primary-foreground/30 pointer-events-none"
              style={{
                left: r.x,
                top: r.y,
                width: r.size,
                height: r.size,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText || children}</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export { RippleButton, buttonVariants };
