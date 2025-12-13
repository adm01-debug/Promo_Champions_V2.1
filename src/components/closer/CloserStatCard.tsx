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
    <Card className="glass border-border/40 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {change !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium",
                  isPositive ? "text-status-success" : "text-status-error"
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
            "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
