import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  previousValue?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return {
        border: "border-l-4 border-l-primary",
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
        glow: "hover:shadow-glow-primary",
        gradient: "from-primary/5 to-transparent",
      };
    case "success":
      return {
        border: "border-l-4 border-l-success",
        iconBg: "bg-success/15",
        iconColor: "text-success",
        glow: "hover:shadow-glow-success",
        gradient: "from-success/5 to-transparent",
      };
    case "warning":
      return {
        border: "border-l-4 border-l-warning",
        iconBg: "bg-warning/15",
        iconColor: "text-warning",
        glow: "hover:shadow-glow-warning",
        gradient: "from-warning/5 to-transparent",
      };
    case "danger":
      return {
        border: "border-l-4 border-l-destructive",
        iconBg: "bg-destructive/15",
        iconColor: "text-destructive",
        glow: "hover:shadow-glow-destructive",
        gradient: "from-destructive/5 to-transparent",
      };
    default:
      return {
        border: "border-l-4 border-l-muted-foreground/30",
        iconBg: "bg-muted/50",
        iconColor: "text-muted-foreground group-hover:text-primary",
        glow: "hover:shadow-md",
        gradient: "from-muted/10 to-transparent",
      };
  }
};

export const StatCard = ({
  title,
  value,
  change,
  previousValue,
  icon: Icon,
  variant = "default",
}: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const styles = getVariantStyles(variant);

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const changeElement = change !== undefined && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-help transition-all duration-200",
              isPositive && "bg-success/15 text-success",
              isNegative && "bg-destructive/15 text-destructive",
              !isPositive && !isNegative && "bg-muted/30 text-muted-foreground"
            )}
          >
            <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">{Math.abs(change)}%</span>
            <span className="sm:hidden">{Math.abs(change)}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass border-border/40 shadow-lg">
          <div className="text-xs">
            <p className="text-muted-foreground">vs. mês anterior</p>
            {previousValue && (
              <p className="font-medium gradient-text">Anterior: {previousValue}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <motion.div
      className={cn(
        "glass rounded-xl p-3 sm:p-4 lg:p-5 cursor-pointer group border border-border/40 relative overflow-hidden",
        styles.border,
        styles.glow
      )}
      whileHover={{ 
        scale: 1.02,
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", styles.gradient)} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
          <div className={cn("p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 group-hover:scale-110", styles.iconBg)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-colors", styles.iconColor)} />
          </div>
          {changeElement}
        </div>
        <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1.5 font-medium truncate">{title}</p>
        <p className={cn(
          "text-lg sm:text-xl lg:text-2xl font-bold font-display truncate",
          variant === "primary" ? "gradient-text" : "text-foreground"
        )}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};
