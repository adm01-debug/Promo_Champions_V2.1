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
              "text-xs font-medium px-2 py-1 rounded-full cursor-help",
              isPositive && "bg-success/20 text-success",
              isNegative && "bg-destructive/20 text-destructive",
              !isPositive && !isNegative && "bg-muted text-muted-foreground"
            )}
          >
            {isPositive && "+"}
            {change}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border border-border">
          <div className="text-xs">
            <p className="text-muted-foreground">vs. mês anterior</p>
            {previousValue && (
              <p className="font-medium">Anterior: {previousValue}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div
      className={cn(
        "glass rounded-xl p-5 hover-lift cursor-pointer group",
        variant === "primary" && "gradient-border glow-primary",
        variant === "secondary" && "gradient-border glow-secondary"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-2.5 rounded-lg",
            variant === "primary"
              ? "gradient-primary"
              : variant === "secondary"
              ? "bg-secondary/20"
              : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "primary" || variant === "secondary"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}
          />
        </div>
        {changeElement}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p
        className={cn(
          "text-2xl font-bold",
          variant === "primary" && "gradient-text"
        )}
      >
        {value}
      </p>
    </div>
  );
};
