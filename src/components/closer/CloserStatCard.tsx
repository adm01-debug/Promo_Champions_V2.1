import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CloserStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  subtitle?: string;
}

export function CloserStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  variant = "default",
  subtitle
}: CloserStatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  const variantStyles = {
    default: "from-muted/50 to-muted/30",
    primary: "from-primary/20 to-primary/5",
    success: "from-status-success/20 to-status-success/5",
    warning: "from-streak/20 to-streak/5",
  };

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow overflow-hidden transition-all duration-300 hover-lift group cursor-pointer">
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
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md border transition-all duration-300",
                  isPositive 
                    ? "text-status-success bg-status-success/15 border-status-success/30" 
                    : "text-status-error bg-status-error/15 border-status-error/30"
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
            variant === "primary" ? "bg-gradient-to-br from-primary to-accent shadow-primary/20 group-hover:shadow-primary/40" : 
            variant === "success" ? "bg-gradient-to-br from-status-success to-status-success/70 shadow-status-success/20" :
            variant === "warning" ? "bg-gradient-to-br from-streak to-streak/70 shadow-streak/20" : 
            "bg-gradient-to-br from-muted/70 to-muted/50"
          )}>
            <Icon className={cn(
              "h-5 w-5 transition-transform duration-300",
              variant !== "default" ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
