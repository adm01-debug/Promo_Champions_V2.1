import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MotionCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "glass" | "interactive" | "glow";
  hoverScale?: number;
  tapScale?: number;
  children: React.ReactNode;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ 
    variant = "default", 
    hoverScale = 1.02, 
    tapScale = 0.98, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const variantStyles = {
      default: "bg-card border border-border/40 rounded-xl",
      elevated: "bg-card border border-border/40 rounded-xl shadow-lg",
      glass: "glass border border-border/40 rounded-xl",
      interactive: "bg-card border border-border/40 rounded-xl cursor-pointer",
      glow: "glass border border-border/40 rounded-xl hover-glow",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(variantStyles[variant], className)}
        whileHover={{ 
          scale: hoverScale,
          y: -4,
          boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.15)",
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{ 
          scale: tapScale,
          transition: { duration: 0.1 }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

// Preset variants for common use cases
export const motionCardPresets = {
  subtle: { hoverScale: 1.01, tapScale: 0.99 },
  normal: { hoverScale: 1.02, tapScale: 0.98 },
  prominent: { hoverScale: 1.03, tapScale: 0.97 },
  bounce: { hoverScale: 1.05, tapScale: 0.95 },
};
