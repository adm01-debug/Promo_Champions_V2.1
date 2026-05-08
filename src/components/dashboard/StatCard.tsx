import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { MiniSparkline } from "@/components/dashboard/MiniSparkline";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

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
  const { theme } = useDashboardTheme();
  const isPositive = change >= 0;

  const animatedNum = useCountUp(numericValue ?? 0, {
    duration: 1400,
    decimals: value.includes("%") ? 1 : 0,
    enabled: numericValue !== undefined,
  });

  const variantStyles = useMemo(() => ({
    default: "bg-black/40 border-white/5 backdrop-blur-md hover:border-white/20",
    primary: "bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/30 shadow-[0_0_20px_rgba(14,165,233,0.05)] hover:border-primary/50",
    success: "bg-gradient-to-br from-success/20 via-success/5 to-transparent border-success/30 shadow-[0_0_20px_rgba(34,197,94,0.05)] hover:border-success/50",
    warning: "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent border-warning/30 shadow-[0_0_20px_rgba(234,179,8,0.05)] hover:border-warning/50",
  }), []);

  const iconColors = useMemo(() => ({
    default: "bg-white/5 text-muted-foreground border border-white/10",
    primary: "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
    success: "bg-success/20 text-success border border-success/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]",
    warning: "bg-warning/20 text-warning border border-warning/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
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
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={cn(
        "group relative h-full overflow-hidden transition-all duration-300",
        theme === "cyber" ? variantStyles[variant] : "bg-card border-border/40 hover:border-primary/20",
        heroStyles,
      )}>
      {/* Decorative cyber-elements */}
      {theme === "cyber" && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/20 group-hover:border-white/40 transition-colors" />
        </div>
      )}
      
      {/* Ambient Glow for Hero */}
      {hero && theme === "cyber" && (
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
      )}

      <CardContent className={cn("relative z-10 p-4 sm:p-5", hero && "sm:p-7")}>
        <div className="flex items-start justify-between">
          <div className={cn("space-y-1 sm:space-y-2 flex-1 min-w-0", hero && "space-y-2 sm:space-y-3")}>
            <p className={cn(
              "text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground/80 transition-colors",
              hero && "text-xs sm:text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-lg sm:text-3xl font-black tabular-nums font-display tracking-tighter",
              hero && "text-8xl sm:text-[16rem] lg:text-[22rem] 2xl:text-[26rem] font-black text-primary bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary-glow to-primary-glow/80 selection:bg-primary/30 py-16 drop-shadow-[0_0_150px_rgba(139,92,246,1)] animate-pulse-gentle",
              !hero && variant === "primary" && "text-primary",
              !hero && variant === "success" && "text-success",
              !hero && variant === "warning" && "text-warning"
            )} style={{ 
              textShadow: hero ? `0 0 80px hsl(var(--primary) / 0.95), 0 0 160px hsl(var(--primary) / 0.6), 0 0 240px hsl(var(--primary) / 0.2)` : 
                          variant !== 'default' ? '0 0 15px currentColor' : 'none' 
            }}>
              {displayValue}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-black",
                  isPositive
                    ? "bg-success/10 text-success border-success/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                    : "bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
                  hero && "text-xs px-2 py-1"
                )}>
                  {isPositive ? (
                    <TrendingUp className={cn("h-2.5 w-2.5", hero && "h-3.5 w-3.5")} />
                  ) : (
                    <TrendingDown className={cn("h-2.5 w-2.5", hero && "h-3.5 w-3.5")} />
                  )}
                  {isPositive ? "+" : ""}{change.toFixed(1)}%
                </span>
                {previousValue && (
                  <span className={cn("text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest", hero && "text-[10px]")}>
                    BASE: {previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn(
              "p-2 sm:p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110",
              iconColors[variant],
              hero && "p-3 sm:p-4 rounded-2xl"
            )}>
              <Icon className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                hero && "h-6 w-6 sm:h-8 sm:w-8"
              )} />
            </div>
            {sparklineData && sparklineData.length > 1 && (
              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                <MiniSparkline
                  data={sparklineData}
                  className={sparklineColors[variant]}
                  width={60}
                  height={24}
                />
              </div>
            )}
          </div>
        </div>

        {hero && sparklineData && sparklineData.length > 1 && (
          <div className="mt-4 -mb-2 opacity-60 group-hover:opacity-100 transition-all">
            <MiniSparkline
              data={sparklineData}
              className={sparklineColors[variant]}
              width={300}
              height={40}
              strokeWidth={3}
            />
          </div>
        )}
      </CardContent>

      {/* Decorative Grid Scanline */}
      {theme === "cyber" && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      )}
      </Card>
    </motion.div>
  );
});

StatCard.displayName = "StatCard";