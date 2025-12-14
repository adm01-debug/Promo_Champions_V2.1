import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SDRStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "info";
  subtitle?: string;
  highlight?: boolean;
}

export function SDRStatCard({ 
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

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          iconBg: "bg-gradient-to-br from-primary to-accent shadow-primary/30 group-hover:shadow-primary/50",
          ring: "ring-1 ring-primary/20",
          glow: "hover-glow"
        };
      case "success":
        return {
          iconBg: "bg-gradient-to-br from-status-success to-status-success/70 shadow-status-success/30 group-hover:shadow-status-success/50",
          ring: "ring-1 ring-status-success/20",
          glow: "hover-glow-success"
        };
      case "warning":
        return {
          iconBg: "bg-gradient-to-br from-streak to-streak/70 shadow-streak/30 group-hover:shadow-streak/50",
          ring: "ring-1 ring-streak/20",
          glow: ""
        };
      case "info":
        return {
          iconBg: "bg-gradient-to-br from-status-info to-status-info/70 shadow-status-info/30 group-hover:shadow-status-info/50",
          ring: "ring-1 ring-status-info/20",
          glow: ""
        };
      default:
        return {
          iconBg: "bg-gradient-to-br from-muted/70 to-muted/50 shadow-muted/20",
          ring: "",
          glow: ""
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn(
      "glass dark:border-glow card-elevated overflow-hidden transition-all hover-lift group cursor-pointer animate-fade-in",
      styles.ring,
      styles.glow,
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
              <span className="text-2xl font-bold font-display gradient-text transition-transform group-hover:scale-105">
                {value}
              </span>
              {change !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md border transition-all group-hover:scale-105 shadow-sm",
                  isPositive 
                    ? "text-status-success bg-status-success/15 border-status-success/30 shadow-status-success/10" 
                    : "text-status-error bg-status-error/15 border-status-error/30 shadow-status-error/10",
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
            "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl",
            styles.iconBg
          )}>
            <Icon className={cn(
              "h-5 w-5 transition-all group-hover:scale-110",
              variant !== "default" ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
