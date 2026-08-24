import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ProgressRingProps {
  /** 0–100 progress value */
  value: number;
  /** Ring diameter in px */
  size?: number;
  /** Ring stroke width */
  strokeWidth?: number;
  /** Optional label inside the ring */
  label?: string;
  /** Show the percentage text inside */
  showValue?: boolean;
  className?: string;
  /** Semantic color variant */
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "xp";
}

const variantColors: Record<string, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  xp: "text-xp",
};

const trackColors: Record<string, string> = {
  default: "stroke-muted/40",
  primary: "stroke-primary/15",
  success: "stroke-success/15",
  warning: "stroke-warning/15",
  destructive: "stroke-destructive/15",
  xp: "stroke-xp/15",
};

/**
 * Animated SVG circular progress ring.
 * Uses CSS transition for smooth animation on value change.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 5,
  label,
  showValue = true,
  className,
  variant = "primary",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const { radius, circumference, offset } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    return { radius: r, circumference: c, offset: c - (clamped / 100) * c };
  }, [size, strokeWidth, clamped]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColors[variant]}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", variantColors[variant])}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className={cn("font-bold tabular-nums font-display leading-none", size >= 80 ? "text-lg" : size >= 56 ? "text-sm" : "text-xs")}>
            {Math.round(clamped)}%
          </span>
        )}
        {label && (
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 leading-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
