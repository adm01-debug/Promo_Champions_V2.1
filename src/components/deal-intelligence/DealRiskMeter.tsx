import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DealRiskMeter({ score, label, size = "md", className }: Props) {
  // Score is typically 0-100, where 100 is healthy and 0 is critical risk.
  // We'll invert it or show it as health. The user asked for a "Risk Meter".
  // Let's show Risk % (100 - score).
  const risk = 100 - score;
  
  const getColor = (r: number) => {
    if (r < 30) return "text-green-500 bg-green-500/10";
    if (r < 60) return "text-yellow-500 bg-yellow-500/10";
    if (r < 80) return "text-orange-500 bg-orange-500/10";
    return "text-red-500 bg-red-500/10";
  }

  const getBarColor = (r: number) => {
    if (r < 30) return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
    if (r < 60) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]";
    if (r < 80) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]";
    return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
  }

  const sizes = {
    sm: "h-1.5 w-24",
    md: "h-2 w-32",
    lg: "h-3 w-full"
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full", getColor(risk))}>
            {Math.round(risk)}% Risco
          </span>
        </div>
      )}
      <div className={cn("relative overflow-hidden bg-secondary/50 rounded-full", sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${risk}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(risk))}
        />
      </div>
    </div>
  );
}
