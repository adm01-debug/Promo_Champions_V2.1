import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs mês anterior",
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const variantStyles = {
    default: "bg-card",
    primary: "gradient-primary text-primary-foreground",
    success: "gradient-success text-success-foreground",
    warning: "gradient-warning text-warning-foreground",
    destructive: "gradient-destructive text-destructive-foreground",
  };

  const iconBgStyles = {
    default: "bg-secondary",
    primary: "bg-primary-foreground/20",
    success: "bg-success-foreground/20",
    warning: "bg-warning-foreground/20",
    destructive: "bg-destructive-foreground/20",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-1",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  variant === "default"
                    ? isPositive
                      ? "bg-success/10 text-success"
                      : isNegative
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                    : "bg-primary-foreground/20"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : null}
                {Math.abs(change)}%
              </span>
              <span
                className={cn(
                  "text-xs",
                  variant === "default" ? "text-muted-foreground" : "opacity-70"
                )}
              >
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3",
            iconBgStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}