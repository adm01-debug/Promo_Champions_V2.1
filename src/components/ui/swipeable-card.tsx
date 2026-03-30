import * as React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftColor?: string;
  rightColor?: string;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Rejeitar",
  rightLabel = "Aceitar",
  leftIcon = <X className="w-6 h-6" />,
  rightIcon = <Check className="w-6 h-6" />,
  leftColor = "bg-destructive",
  rightColor = "bg-success",
  threshold = 100,
  className,
  disabled = false,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  
  // Action indicators opacity
  const leftOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, threshold], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left indicator (reject) */}
      {onSwipeLeft && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className={cn(
            "absolute inset-y-0 left-0 w-20 flex flex-col items-center justify-center rounded-l-xl",
            leftColor,
            "text-white"
          )}
        >
          {leftIcon}
          <span className="text-xs font-medium mt-1">{leftLabel}</span>
        </motion.div>
      )}

      {/* Right indicator (accept) */}
      {onSwipeRight && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className={cn(
            "absolute inset-y-0 right-0 w-20 flex flex-col items-center justify-center rounded-r-xl",
            rightColor,
            "text-white"
          )}
        >
          {rightIcon}
          <span className="text-xs font-medium mt-1">{rightLabel}</span>
        </motion.div>
      )}

      {/* Main card */}
      <motion.div
        style={{ x, rotate, opacity }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          "relative bg-card rounded-xl border border-border shadow-md cursor-grab active:cursor-grabbing",
          disabled && "cursor-default"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Swipeable list item variant
interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = {
    icon: <X className="w-5 h-5" />,
    label: "Excluir",
    color: "bg-destructive"
  },
  rightAction = {
    icon: <Check className="w-5 h-5" />,
    label: "Concluir",
    color: "bg-success"
  },
  className,
}) => {
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [-80, -40, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 40, 80], [0, 0.5, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80 && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > 80 && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Left action background */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className={cn(
          "absolute inset-y-0 left-0 w-20 flex items-center justify-center",
          leftAction.color
        )}
      >
        <div className="text-white text-center">
          {leftAction.icon}
          <p className="text-xs mt-0.5">{leftAction.label}</p>
        </div>
      </motion.div>

      {/* Right action background */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className={cn(
          "absolute inset-y-0 right-0 w-20 flex items-center justify-center",
          rightAction.color
        )}
      >
        <div className="text-white text-center">
          {rightAction.icon}
          <p className="text-xs mt-0.5">{rightAction.label}</p>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
};
