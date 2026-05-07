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
    default: "bg-[#0d1117]/60 border-white/[0.05] hover:border-white/[0.1] backdrop-blur-xl shadow-xl",
    primary: "bg-primary/5 border-primary/20 hover:border-primary/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]",
    success: "bg-success/5 border-success/20 hover:border-success/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(var(--success-rgb),0.1)]",
    warning: "bg-warning/5 border-warning/20 hover:border-warning/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(var(--warning-rgb),0.1)]",
  }), []);

  const iconColors = useMemo(() => ({
    default: "bg-white/[0.03] text-white/40",
    primary: "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]",
    success: "bg-success/10 text-success shadow-[0_0_20px_rgba(var(--success-rgb),0.3)]",
    warning: "bg-warning/10 text-warning shadow-[0_0_20px_rgba(var(--warning-rgb),0.3)]",
  }), []);

  const sparklineColors = useMemo(() => ({
    default: "text-white/20",
    primary: "text-primary/60",
    success: "text-success/60",
    warning: "text-warning/60",
  }), []);

  const heroStyles = hero
    ? "relative overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02]"
    : "hover:scale-[1.03] transition-transform duration-500 ease-out";

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
      "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-3xl group",
      variantStyles[variant],
      heroStyles,
    )}>
      <CardContent className={cn("p-6 sm:p-8", hero && "sm:p-10")}>
        <div className="flex items-start justify-between relative z-10">
          <div className={cn("space-y-2 flex-1 min-w-0", hero && "space-y-4")}>
            <p className={cn(
              "text-[10px] sm:text-xs text-white/30 font-black tracking-[0.2em] uppercase",
              hero && "text-xs sm:text-sm text-primary/80"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl sm:text-4xl font-black tabular-nums tracking-tightest leading-none",
              hero && "text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent"
            )}>
              {displayValue}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  isPositive
                    ? "bg-success/10 text-success ring-1 ring-success/20"
                    : "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
                  hero && "text-xs px-3 py-1.5"
                )}>
                  {isPositive ? (
                    <TrendingUp className={cn("h-3 w-3", hero && "h-4 w-4")} />
                  ) : (
                    <TrendingDown className={cn("h-3 w-3", hero && "h-4 w-4")} />
                  )}
                  {isPositive ? "+" : ""}{change.toFixed(1)}%
                </span>
                {previousValue && (
                  <span className={cn("text-[10px] font-bold text-white/20 uppercase tracking-widest", hero && "text-xs")}>
                    vs {previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className={cn(
              "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
              iconColors[variant],
              hero && "p-6 rounded-[2rem]"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                hero && "h-10 w-10"
              )} />
            </div>
            {!hero && sparklineData && sparklineData.length > 1 && (
              <MiniSparkline
                data={sparklineData}
                className={sparklineColors[variant]}
                width={80}
                height={24}
                strokeWidth={2}
              />
            )}
          </div>
        </div>

        {hero && sparklineData && sparklineData.length > 1 && (
          <div className="mt-8 -mb-4 opacity-40 group-hover:opacity-80 transition-opacity duration-700">
            <MiniSparkline
              data={sparklineData}
              className={sparklineColors[variant]}
              width={400}
              height={60}
              strokeWidth={3}
            />
          </div>
        )}

        {hero && (
          <>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";
