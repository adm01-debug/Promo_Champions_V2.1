import { Target, Check, X, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ICPData } from "@/hooks/useICPData";
import { cn } from "@/lib/utils";

interface ICPBadgeProps {
  icpData: ICPData | null | undefined;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function ICPBadge({ icpData, size = "md", showTooltip = true, className }: ICPBadgeProps) {
  if (!icpData) {
    return null;
  }

  const isMatch = icpData.is_icp_match;
  const hasPartialData = icpData.ramo_atividade || icpData.grupo_nicho;

  const sizeClasses = {
    sm: "text-[9px] px-1 py-0.5 gap-0.5",
    md: "text-[10px] px-1.5 py-0.5 gap-1",
    lg: "text-xs px-2 py-1 gap-1.5",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  const getBadgeContent = () => {
    if (isMatch) {
      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center font-black border-none transition-all uppercase tracking-widest",
            "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
            "hover:bg-emerald-500/20",
            sizeClasses[size],
            className
          )}
        >
          <Target className={cn("animate-pulse", iconSizes[size])} />
          <span>ICP ELITE</span>
        </Badge>
      );
    }

    if (hasPartialData) {
      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center font-black border-none transition-all uppercase tracking-widest",
            "bg-amber-500/10 text-amber-500",
            "hover:bg-amber-500/20",
            sizeClasses[size],
            className
          )}
        >
          <Target className={iconSizes[size]} />
          <span>ICP ACTIVE</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center font-black border-none transition-all uppercase tracking-widest",
          "bg-muted/40 text-muted-foreground/60",
          sizeClasses[size],
          className
        )}
      >
        <Target className={iconSizes[size]} />
        <span>NON-ICP</span>
      </Badge>
    );
  };


  if (!showTooltip) {
    return getBadgeContent();
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{getBadgeContent()}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[250px] glass border-border/50 p-3"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                {isMatch
                  ? "Perfil Ideal (ICP)"
                  : hasPartialData
                  ? "ICP Parcial"
                  : "Fora do ICP"}
              </span>
            </div>

            <div className="text-xs space-y-1">
              {icpData.ramo_atividade && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ramo:</span>
                  <span className="font-medium">{icpData.ramo_atividade}</span>
                </div>
              )}
              {icpData.grupo_nicho && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Nicho:</span>
                  <span className="font-medium">{icpData.grupo_nicho}</span>
                </div>
              )}
              {icpData.capital_social && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Capital:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(icpData.capital_social)}
                  </span>
                </div>
              )}
              {icpData.num_colaboradores && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Colaboradores:</span>
                  <span className="font-medium">{icpData.num_colaboradores}</span>
                </div>
              )}
            </div>

            {isMatch && (
              <p className="text-[10px] text-status-success mt-2 pt-2 border-t border-border/30">
                ✓ Corresponde ao perfil ideal de cliente
              </p>
            )}
            {hasPartialData && !isMatch && (
              <p className="text-[10px] text-status-warning mt-2 pt-2 border-t border-border/30">
                ⚠ Dados ICP incompletos (falta ramo ou nicho)
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simple inline version for compact spaces
export function ICPIndicator({ isMatch }: { isMatch: boolean | undefined }) {
  if (isMatch === undefined) return null;

  return (
    <div
      className={cn(
        "h-2 w-2 rounded-full",
        isMatch ? "bg-status-success" : "bg-muted-foreground/30"
      )}
      title={isMatch ? "ICP Match" : "Fora do ICP"}
    />
  );
}
