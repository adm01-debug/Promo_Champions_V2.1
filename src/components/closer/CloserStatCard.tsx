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
    <Card variant="elevated" className="glass border-border/40 dark:border-glow overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold gradient-text">{value}</span>
              {change !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded",
                  isPositive ? "text-status-success bg-status-success/10" : "text-status-error bg-status-error/10"
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center shadow-sm",
            variant === "primary" ? "gradient-primary" : 
            variant === "success" ? "bg-status-success/20" :
            variant === "warning" ? "bg-streak/20" : "bg-muted/50"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === "primary" ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
