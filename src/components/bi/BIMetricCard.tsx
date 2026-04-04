import React from "react";
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ComparisonData {
  previousPeriod?: { value: number; label: string };
  lastYear?: { value: number; label: string };
  goal?: { value: number; label: string };
  projection?: { value: number; label: string };
}

interface BIMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  comparison?: ComparisonData;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  format?: "currency" | "percent" | "number";
  subtitle?: string;
  className?: string;
  delay?: number;
}

const formatValue = (value: number, format: "currency" | "percent" | "number" = "number"): string => {
  switch (format) {
    case "currency":
      return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const BIMetricCard: FC<BIMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  comparison,
  variant = "default",
  format = "number",
  subtitle,
  className,
  delay = 0
}) => {
  const currentValue = typeof value === "string" ? parseFloat(value.replace(/[^\d.-]/g, "")) || 0 : value;

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return { 
          border: "border-l-4 border-l-primary", 
          icon: "bg-primary/15 text-primary",
          value: "gradient-text"
        };
      case "success":
        return { 
          border: "border-l-4 border-l-success", 
          icon: "bg-success/15 text-success",
          value: "text-success"
        };
      case "warning":
        return { 
          border: "border-l-4 border-l-warning", 
          icon: "bg-warning/15 text-warning",
          value: "text-warning"
        };
      case "danger":
        return { 
          border: "border-l-4 border-l-destructive", 
          icon: "bg-destructive/15 text-destructive",
          value: "text-destructive"
        };
      default:
        return { 
          border: "", 
          icon: "bg-muted text-muted-foreground",
          value: ""
        };
    }
  };

  const styles = getVariantStyles();

  const renderComparisonBadge = (
    label: string,
    currentVal: number,
    compareVal: number,
    formatType: "currency" | "percent" | "number"
  ) => {
    const change = calculateChange(currentVal, compareVal);
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-help",
              isPositive ? "bg-success/10 text-success" : 
              isNeutral ? "bg-muted text-muted-foreground" :
              "bg-destructive/10 text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : 
               isNeutral ? <Minus className="h-3 w-3" /> :
               <TrendingDown className="h-3 w-3" />}
              <span>{isPositive ? "+" : ""}{change.toFixed(1)}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}: {formatValue(compareVal, formatType)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
    >
      <Card className={cn(
        "glass-card hover-lift group relative overflow-hidden transition-all duration-300",
        styles.border,
        className
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "p-2 rounded-xl transition-transform duration-300 group-hover:scale-110",
              styles.icon
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate">{title}</span>
          </div>

          {/* Value */}
          <p className={cn("text-2xl font-bold mb-1", styles.value)}>
            {typeof value === "number" ? formatValue(value, format) : value}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
          )}

          {/* Comparisons */}
          {comparison && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {comparison.previousPeriod && (
                renderComparisonBadge(
                  comparison.previousPeriod.label,
                  currentValue,
                  comparison.previousPeriod.value,
                  format
                )
              )}
              {comparison.lastYear && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground cursor-help">
                        <span>AA</span>
                        <span>{calculateChange(currentValue, comparison.lastYear.value) > 0 ? "+" : ""}
                          {calculateChange(currentValue, comparison.lastYear.value).toFixed(1)}%
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{comparison.lastYear.label}: {formatValue(comparison.lastYear.value, format)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {comparison.goal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-help",
                        currentValue >= comparison.goal.value 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}>
                        <span>Meta</span>
                        <span>{((currentValue / comparison.goal.value) * 100).toFixed(0)}%</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Meta: {formatValue(comparison.goal.value, format)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Grid wrapper for metrics
export const BIMetricsGrid: FC<{ children: React.ReactNode; cols?: 2 | 3 | 4 | 6 }> = ({ 
  children, 
  cols = 6 
}) => {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
  };

  return (
    <div className={cn("grid gap-4", gridCols[cols])}>
      {children}
    </div>
  );
};
