import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const variantStyles = {
  default: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  warning: "bg-warning text-warning-foreground",
  success: "bg-success text-success-foreground",
  info: "bg-info text-info-foreground",
};

const sizeStyles = {
  sm: "h-4 min-w-4 text-[9px] px-1",
  md: "h-5 min-w-5 text-[10px] px-1.5",
  lg: "h-6 min-w-6 text-xs px-2",
};

export const NotificationBadge = memo(function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  variant = "destructive",
  size = "md",
  pulse = true,
  className,
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;
  const shouldShow = count > 0 || showZero;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={cn(
            "inline-flex items-center justify-center rounded-full font-bold leading-none",
            variantStyles[variant],
            sizeStyles[size],
            pulse && count > 0 && "animate-pulse",
            className
          )}
        >
          {displayCount}
        </motion.span>
      )}
    </AnimatePresence>
  );
});

NotificationBadge.displayName = "NotificationBadge";

// Dot variant for simpler indicator
interface NotificationDotProps {
  visible?: boolean;
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const dotSizeStyles = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export const NotificationDot = memo(function NotificationDot({
  visible = true,
  variant = "destructive",
  size = "md",
  pulse = true,
  className,
}: NotificationDotProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={cn(
            "rounded-full",
            variantStyles[variant],
            dotSizeStyles[size],
            pulse && "animate-pulse",
            className
          )}
        />
      )}
    </AnimatePresence>
  );
});

NotificationDot.displayName = "NotificationDot";
