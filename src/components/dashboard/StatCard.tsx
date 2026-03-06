import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

interface StatCardProps {
  title: string;
  value: string;
  numericValue?: number;
  change?: number;
  previousValue?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  hero?: boolean;
}

export const StatCard = ({
  title,
  value,
  numericValue,
  change = 0,
  previousValue,
  icon: Icon,
  variant = "default",
  hero = false,
}: StatCardProps) => {
  const isPositive = change >= 0;

  const animatedNum = useCountUp(numericValue ?? 0, {
    duration: 1400,
    decimals: value.includes("%") ? 1 : 0,
    enabled: numericValue !== undefined,
  });

  const variantStyles = {
    default: "bg-card border-border/40",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/30",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30",
  };

  // Semantic icon colors per variant
  const iconColors = {
    default: "bg-muted/60 text-muted-foreground",
    primary: "bg-success/15 text-success",         // green for revenue
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  };

  const getDisplayValue = () => {
    if (numericValue === undefined) return value;
    if (value.startsWith("R$")) {
      return `R$ ${animatedNum.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
    }
    if (value.endsWith("%")) {
      return `${animatedNum.toFixed(1)}%`;
    }
    return String(animatedNum);
  };

  return (
    <Card className={cn(
      "hover-lift transition-all duration-200 border",
      variantStyles[variant],
      hero && "lg:col-span-2 relative overflow-hidden"
    )}>
      <CardContent className={cn("p-4 sm:p-6", hero && "sm:p-8")}>
        <div className="flex items-start justify-between">
          <div className={cn("space-y-1 sm:space-y-2", hero && "space-y-2 sm:space-y-3")}>
            <p className={cn(
              "text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide",
              hero && "text-sm sm:text-base"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-lg sm:text-2xl font-bold tabular-nums font-display",
              hero && "text-2xl sm:text-4xl lg:text-5xl"
            )}>
              {getDisplayValue()}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className={cn("h-3 w-3 text-success", hero && "h-4 w-4")} />
                ) : (
                  <TrendingDown className={cn("h-3 w-3 text-destructive", hero && "h-4 w-4")} />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-success" : "text-destructive",
                    hero && "text-sm"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                {previousValue && (
                  <span className={cn("text-xs text-muted-foreground ml-1", hero && "text-sm")}>
                    vs {previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            "p-2 sm:p-3 rounded-xl",
            iconColors[variant],
            hero && "p-3 sm:p-4 rounded-2xl"
          )}>
            <Icon className={cn(
              "h-4 w-4 sm:h-5 sm:w-5",
              hero && "h-6 w-6 sm:h-8 sm:w-8"
            )} />
          </div>
        </div>
        {hero && (
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};
