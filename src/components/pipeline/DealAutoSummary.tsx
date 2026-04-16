import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealAutoSummaryProps {
  deal: {
    id: string;
    client_name: string;
    amount: number;
    status: string;
    created_at: string;
    updated_at?: string;
    stage?: string;
  };
  activitiesCount?: number;
  lastActivityDate?: string;
  className?: string;
}

function DealAutoSummaryComponent({ deal, activitiesCount = 0, lastActivityDate, className }: DealAutoSummaryProps) {
  const summary = useMemo(() => {
    const daysSinceCreation = differenceInDays(new Date(), new Date(deal.created_at));
    const daysSinceUpdate = deal.updated_at ? differenceInDays(new Date(), new Date(deal.updated_at)) : daysSinceCreation;
    const daysSinceActivity = lastActivityDate ? differenceInDays(new Date(), new Date(lastActivityDate)) : 999;

    const risks: string[] = [];
    const strengths: string[] = [];
    const nextSteps: string[] = [];

    // Risk analysis
    if (daysSinceUpdate > 7) risks.push(`Sem atualização há ${daysSinceUpdate} dias`);
    if (daysSinceActivity > 5) risks.push(`Sem atividade há ${daysSinceActivity} dias`);
    if (activitiesCount < 3) risks.push("Poucas interações registradas");
    if (daysSinceCreation > 30 && deal.status !== "completed" && deal.status !== "won") risks.push("Deal aberto há mais de 30 dias");

    // Strengths
    if (activitiesCount >= 5) strengths.push("Bom engajamento com múltiplas interações");
    if (daysSinceActivity <= 2) strengths.push("Comunicação recente e ativa");
    if (deal.amount >= 50000) strengths.push("Deal de alto valor");

    // Next steps
    if (daysSinceActivity > 3) nextSteps.push("Fazer follow-up com o cliente");
    if (activitiesCount < 3) nextSteps.push("Agendar reunião de discovery");
    if (deal.stage === "proposal" || deal.stage === "negotiation") nextSteps.push("Revisar e enviar proposta atualizada");
    if (nextSteps.length === 0) nextSteps.push("Manter cadência de contato atual");

    // Overall status
    const overallStatus: "good" | "warning" | "critical" =
      risks.length >= 3 ? "critical" : risks.length >= 1 ? "warning" : "good";

    const statusText =
      overallStatus === "good" ? "Deal em boa trajetória"
      : overallStatus === "warning" ? "Requer atenção"
      : "Ação urgente necessária";

    return { risks, strengths, nextSteps, overallStatus, statusText, daysSinceCreation };
  }, [deal, activitiesCount, lastActivityDate]);

  const statusColors = {
    good: "border-status-success/30 bg-status-success/5",
    warning: "border-status-warning/30 bg-status-warning/5",
    critical: "border-destructive/30 bg-destructive/5",
  };

  return (
    <Card className={cn("glass border-border/40 p-4 space-y-3", statusColors[summary.overallStatus], className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-display font-bold">Resumo Inteligente</span>
        <Badge variant="outline" className={cn(
          "text-[9px] ml-auto",
          summary.overallStatus === "good" && "text-status-success border-status-success/30",
          summary.overallStatus === "warning" && "text-status-warning border-status-warning/30",
          summary.overallStatus === "critical" && "text-destructive border-destructive/30",
        )}>
          {summary.statusText}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Deal de <span className="font-semibold text-foreground">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deal.amount)}
        </span> aberto há {summary.daysSinceCreation} dias com {activitiesCount} interações registradas.
      </p>

      {summary.risks.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Riscos
          </span>
          {summary.risks.map((r, i) => (
            <p key={i} className="text-[10px] text-muted-foreground pl-4">• {r}</p>
          ))}
        </div>
      )}

      {summary.strengths.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-status-success flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Pontos Fortes
          </span>
          {summary.strengths.map((s, i) => (
            <p key={i} className="text-[10px] text-muted-foreground pl-4">• {s}</p>
          ))}
        </div>
      )}

      <div className="space-y-1 pt-1 border-t border-border/20">
        <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
          <ArrowRight className="h-3 w-3" /> Próximos Passos
        </span>
        {summary.nextSteps.map((s, i) => (
          <p key={i} className="text-[10px] text-muted-foreground pl-4">→ {s}</p>
        ))}
      </div>
    </Card>
  );
}

export const DealAutoSummary = React.memo(DealAutoSummaryComponent);
