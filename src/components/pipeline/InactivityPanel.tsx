import React from "react";
import { useInactiveDeals, InactiveDeal } from "@/hooks/useInactiveDeals";
import { Clock, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const SeverityConfig = {
  critical: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Crítico" },
  moderate: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Moderado" },
  mild: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "Leve" },
};

export const InactivityPanel = React.memo(() => {
  const { inactiveDeals, summary } = useInactiveDeals();

  return (
    <div className="glass rounded-xl border border-border/40 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display font-semibold text-sm">Deals Inativos</h3>
        {summary.total > 0 && (
          <Badge variant="destructive" className="text-[10px] ml-auto">
            {summary.total}
          </Badge>
        )}
      </div>

      {/* Summary */}
      <div className="flex gap-2 text-xs">
        {summary.critical > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertOctagon className="h-3 w-3" />{summary.critical}
          </span>
        )}
        {summary.moderate > 0 && (
          <span className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle className="h-3 w-3" />{summary.moderate}
          </span>
        )}
        {summary.mild > 0 && (
          <span className="flex items-center gap-1 text-blue-500">
            <Info className="h-3 w-3" />{summary.mild}
          </span>
        )}
      </div>

      {/* Deal List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {inactiveDeals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs">
            Nenhum deal inativo 🎉
          </div>
        ) : (
          inactiveDeals.slice(0, 15).map((deal) => {
            const config = SeverityConfig[deal.severity];
            const Icon = config.icon;
            return (
              <div
                key={deal.id}
                className={cn("rounded-lg p-2.5 border", config.border, config.bg)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
                    <span className="text-xs font-medium truncate">{deal.clientName}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{deal.daysInactive}d</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Última atividade: {formatDistanceToNow(parseISO(deal.lastActivityDate), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

InactivityPanel.displayName = "InactivityPanel";
