import { memo } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

interface SDRStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  subtitle?: string;
  highlight?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return {
        border: "border-l-4 border-l-primary",
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
      };
    case "success":
      return {
        border: "border-l-4 border-l-success",
        iconBg: "bg-success/15",
        iconColor: "text-success",
      };
    case "warning":
      return {
        border: "border-l-4 border-l-warning",
        iconBg: "bg-warning/15",
        iconColor: "text-warning",
      };
    case "danger":
      return {
        border: "border-l-4 border-l-destructive",
        iconBg: "bg-destructive/15",
        iconColor: "text-destructive",
      };
    default:
      return {
        border: "border-l-4 border-l-muted-foreground/30",
        iconBg: "bg-muted/50",
        iconColor: "text-muted-foreground",
      };
  }
};

const SDRStatCardInner = function SDRStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  variant = "default",
  subtitle,
  highlight = false
}: SDRStatCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const hasSignificantChange = Math.abs(change ?? 0) >= 10;
  const styles = getVariantStyles(variant);
  
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
  const animatedValue = useCountUp(numericValue || 0, {
    duration: 1400,
    decimals: typeof value === 'string' && value.includes(".") ? 1 : 0
  });

  const displayValue = typeof value === 'string' && value.includes("%") 
    ? `${animatedValue.toFixed(1)}%` 
    : typeof value === 'number' 
      ? animatedValue.toLocaleString('pt-BR') 
      : value;

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className={cn(
        "glass overflow-hidden group cursor-pointer border-border/40",
        styles.border,
        highlight && "ring-2 ring-primary/40 shadow-lg shadow-primary/10"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-display">
                  {title}
                </p>
                {highlight && (
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-2xl font-bold font-display transition-transform group-hover:scale-105 tabular-nums",
                  variant === "primary" ? "gradient-text" : "text-foreground"
                )}>
                  {displayValue}
                </span>
                {change !== undefined && (
                  <span className={cn(
                    "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md border transition-all group-hover:scale-105 shadow-sm",
                    isPositive 
                      ? "text-success bg-success/15 border-success/30 shadow-success/10" 
                      : "text-destructive bg-destructive/15 border-destructive/30 shadow-destructive/10",
                    hasSignificantChange && isPositive && "animate-pulse"
                  )}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground font-medium glass px-2 py-1 rounded-md inline-block shadow-sm">
                  {subtitle}
                </p>
              )}
            </div>
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
              styles.iconBg
            )}>
              <Icon className={cn("h-5 w-5 transition-all group-hover:scale-110", styles.iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
export const SDRStatCard = memo(SDRStatCardInner);
