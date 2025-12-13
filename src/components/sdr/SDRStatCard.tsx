import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SDRStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  subtitle?: string;
}

export function SDRStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  variant = "default",
  subtitle
}: SDRStatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow overflow-hidden transition-all duration-300 hover-lift group cursor-pointer animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-display">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">{value}</span>
              {change !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md border transition-all duration-300 group-hover:scale-105",
                  isPositive 
                    ? "text-status-success bg-status-success/15 border-status-success/30 shadow-sm shadow-status-success/10" 
                    : "text-status-error bg-status-error/15 border-status-error/30 shadow-sm shadow-status-error/10"
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-medium glass px-2 py-1 rounded-md inline-block">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
            variant === "primary" ? "bg-gradient-to-br from-primary to-accent shadow-primary/30 group-hover:shadow-primary/50" : 
            variant === "success" ? "bg-gradient-to-br from-status-success to-status-success/70 shadow-status-success/30 group-hover:shadow-status-success/50" :
            variant === "warning" ? "bg-gradient-to-br from-streak to-streak/70 shadow-streak/30 group-hover:shadow-streak/50" : 
            "bg-gradient-to-br from-muted/70 to-muted/50 shadow-muted/20"
          )}>
            <Icon className={cn(
              "h-5 w-5 transition-all duration-300 group-hover:scale-110",
              variant !== "default" ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
