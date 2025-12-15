import { LucideIcon } from "lucide-react";
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
        glow: "hover:shadow-primary/20",
      };
    case "success":
      return {
        border: "border-l-4 border-l-success",
        iconBg: "bg-success/15",
        iconColor: "text-success",
        glow: "hover:shadow-success/20",
      };
    case "warning":
      return {
        border: "border-l-4 border-l-warning",
        iconBg: "bg-warning/15",
        iconColor: "text-warning",
        glow: "hover:shadow-warning/20",
      };
    case "danger":
      return {
        border: "border-l-4 border-l-destructive",
        iconBg: "bg-destructive/15",
        iconColor: "text-destructive",
        glow: "hover:shadow-destructive/20",
      };
    default:
      return {
        border: "border-l-4 border-l-muted-foreground/30",
        iconBg: "bg-muted/50",
        iconColor: "text-muted-foreground group-hover:text-primary",
        glow: "hover:shadow-muted/20",
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

  const changeElement = change !== undefined && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full cursor-help shadow-sm",
              isPositive && "bg-success/20 text-success",
              isNegative && "bg-destructive/20 text-destructive",
              !isPositive && !isNegative && "bg-muted/50 text-muted-foreground"
            )}
          >
            {isPositive && "+"}
            {change}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass border-border/40">
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
        "glass rounded-xl p-5 cursor-pointer group border border-border/40",
        styles.border,
        styles.glow
      )}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl shadow-sm transition-colors", styles.iconBg)}>
          <Icon className={cn("h-5 w-5 transition-colors", styles.iconColor)} />
        </div>
        {changeElement}
      </div>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">{title}</p>
      <p className={cn(
        "text-2xl font-bold font-display",
        variant === "primary" ? "gradient-text" : "text-foreground"
      )}>
        {value}
      </p>
    </motion.div>
  );
};
