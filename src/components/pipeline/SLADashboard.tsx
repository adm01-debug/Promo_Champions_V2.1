import React, { useMemo } from "react";
import { useDealSLAs, DealSLAStatus } from "@/hooks/useDealSLAs";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const StatusIcon = ({ status }: { status: DealSLAStatus["status"] }) => {
  switch (status) {
    case "breached":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
};

export const SLADashboard = React.memo(() => {
  const { slaStatuses, summary } = useDealSLAs();

  const sortedDeals = useMemo(
    () =>
      [...slaStatuses].sort((a, b) => {
        const order = { breached: 0, warning: 1, ok: 2 };
        return order[a.status] - order[b.status] || b.percentUsed - a.percentUsed;
      }),
    [slaStatuses]
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 border border-destructive/20 text-center">
          <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-destructive">{summary.breached}</p>
          <p className="text-xs text-muted-foreground">SLA Violado</p>
        </div>
        <div className="glass rounded-xl p-4 border border-yellow-500/20 text-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-yellow-500">{summary.warning}</p>
          <p className="text-xs text-muted-foreground">Em Risco</p>
        </div>
        <div className="glass rounded-xl p-4 border border-green-500/20 text-center">
          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-green-500">{summary.ok}</p>
          <p className="text-xs text-muted-foreground">No Prazo</p>
        </div>
      </div>

      {/* Deal List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {sortedDeals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum deal com SLA ativo
          </div>
        ) : (
          sortedDeals.map((deal) => (
            <div
              key={deal.dealId}
              className={cn(
                "glass rounded-lg p-3 border transition-colors",
                deal.status === "breached" && "border-destructive/30 bg-destructive/5",
                deal.status === "warning" && "border-yellow-500/30 bg-yellow-500/5",
                deal.status === "ok" && "border-border/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon status={deal.status} />
                  <span className="text-sm font-medium truncate">{deal.clientName}</span>
                </div>
                <Badge
                  variant={deal.status === "breached" ? "destructive" : deal.status === "warning" ? "outline" : "secondary"}
                  className="text-[10px] shrink-0"
                >
                  {deal.status === "breached"
                    ? "Violado"
                    : deal.status === "warning"
                    ? `${deal.daysRemaining}d restantes`
                    : deal.hoursInStage < 24 ? `${Math.round(deal.maxHours - deal.hoursInStage)}h restantes` : `${deal.daysRemaining}d restantes`}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Progress
                        value={Math.min(deal.percentUsed, 100)}
                        className={cn(
                          "h-1.5",
                          deal.status === "breached" && "[&>div]:bg-destructive",
                          deal.status === "warning" && "[&>div]:bg-yellow-500"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{Math.round(deal.hoursInStage)}h de {deal.maxHours}h ({Math.round(deal.percentUsed)}%)</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap capitalize">
                  {deal.stage}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

SLADashboard.displayName = "SLADashboard";
