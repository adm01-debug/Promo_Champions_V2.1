import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { MiniSparkline } from "@/components/dashboard/MiniSparkline";

interface StatCardProps {
  title: string;
  value: string;
  numericValue?: number;
  change?: number;
  previousValue?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  hero?: boolean;
  sparklineData?: number[];
}

export const StatCard = React.memo(({
  title,
  value,
  numericValue,
  change = 0,
  previousValue,
  icon: Icon,
  variant = "default",
  hero = false,
  sparklineData,
}: StatCardProps) => {
  const isPositive = change >= 0;

  const animatedNum = useCountUp(numericValue ?? 0, {
    duration: 1400,
    decimals: value.includes("%") ? 1 : 0,
    enabled: numericValue !== undefined,
  });

  const variantStyles = useMemo(() => ({
    default: "bg-card border-border/50 hover:border-border",
    primary: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40",
    success: "bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 hover:border-success/40",
    warning: "bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20 hover:border-warning/40",
  }), []);

  const iconColors = useMemo(() => ({
    default: "bg-muted/50 text-muted-foreground",
    primary: "bg-primary/15 text-primary shadow-sm shadow-primary/10",
    success: "bg-success/15 text-success shadow-sm shadow-success/10",
    warning: "bg-warning/15 text-warning shadow-sm shadow-warning/10",
  }), []);

  const sparklineColors = useMemo(() => ({
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  }), []);

  const heroStyles = hero
    ? "relative overflow-hidden ring-1 ring-primary/10 shadow-lg shadow-primary/5"
    : "";

  const displayValue = useMemo(() => {
    if (numericValue === undefined) return value;
    if (value.startsWith("R$")) {
      return `R$ ${animatedNum.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
    }
    if (value.endsWith("%")) {
      return `${animatedNum.toFixed(1)}%`;
    }
    return String(animatedNum);
  }, [numericValue, value, animatedNum]);

  return (
    <Card className={cn(
      "hover-lift transition-all duration-200",
      variantStyles[variant],
      heroStyles,
    )}>
      <CardContent className={cn("p-4 sm:p-6", hero && "sm:p-8")}>
        <div className="flex items-start justify-between">
          <div className={cn("space-y-1 sm:space-y-2 flex-1 min-w-0", hero && "space-y-2 sm:space-y-3")}>
            <p className={cn(
              "text-xs sm:text-sm text-muted-foreground font-medium tracking-wide uppercase",
              hero && "text-sm sm:text-base"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-lg sm:text-2xl font-bold tabular-nums font-display tracking-tight",
              hero && "text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            )}>
              {displayValue}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold",
                  isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                  hero && "text-sm px-2 py-1"
                )}>
                  {isPositive ? (
                    <TrendingUp className={cn("h-3 w-3", hero && "h-3.5 w-3.5")} />
                  ) : (
                    <TrendingDown className={cn("h-3 w-3", hero && "h-3.5 w-3.5")} />
                  )}
                  {isPositive ? "+" : ""}{change.toFixed(1)}%
                </span>
                {previousValue && (
                  <span className={cn("text-xs text-muted-foreground", hero && "text-sm")}>
                    vs {previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn(
              "p-2 sm:p-3 rounded-xl transition-transform duration-200",
              iconColors[variant],
              hero && "p-3 sm:p-4 rounded-2xl"
            )}>
              <Icon className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                hero && "h-6 w-6 sm:h-8 sm:w-8"
              )} />
            </div>
            {!hero && sparklineData && sparklineData.length > 1 && (
              <MiniSparkline
                data={sparklineData}
                className={sparklineColors[variant]}
                width={56}
                height={20}
              />
            )}
          </div>
        </div>

        {hero && sparklineData && sparklineData.length > 1 && (
          <div className="mt-3 -mb-2">
            <MiniSparkline
              data={sparklineData}
              className={sparklineColors[variant]}
              width={240}
              height={32}
              strokeWidth={2}
            />
          </div>
        )}

        {hero && (
          <>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          </>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";
