import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  previousValue?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary";
}

export const StatCard = ({
  title,
  value,
  change,
  previousValue,
  icon: Icon,
  variant = "default",
}: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const changeElement = change !== undefined && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full cursor-help shadow-sm",
              isPositive && "bg-status-success/20 text-status-success",
              isNegative && "bg-status-error/20 text-status-error",
              !isPositive && !isNegative && "bg-muted/50 text-muted-foreground"
            )}
          >
            {isPositive && "+"}
            {change}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass border-border/40">
          <div className="text-xs">
            <p className="text-muted-foreground">vs. mês anterior</p>
            {previousValue && (
              <p className="font-medium gradient-text">Anterior: {previousValue}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div
      className={cn(
        "glass rounded-xl p-5 cursor-pointer group border transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "dark:border-glow",
        variant === "default" && "border-border/40",
        variant === "primary" && "border-primary/30 shadow-sm shadow-primary/10 hover:shadow-primary/20",
        variant === "secondary" && "border-secondary/30"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-2.5 rounded-xl shadow-sm",
            variant === "primary"
              ? "gradient-primary"
              : variant === "secondary"
              ? "bg-secondary/20"
              : "bg-muted/50"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "primary"
                ? "text-white"
                : variant === "secondary"
                ? "text-secondary-foreground"
                : "text-muted-foreground group-hover:text-primary transition-colors"
            )}
          />
        </div>
        {changeElement}
      </div>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">{title}</p>
      <p
        className={cn(
          "text-2xl font-bold",
          variant === "primary" ? "gradient-text" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
};
