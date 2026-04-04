/**
 * AI Copilot Proativo — inline stagnant deal alerts on pipeline cards
 * Shows a warning badge when a deal hasn't been updated in 7+ days
 * with a contextual suggestion tooltip.
 */
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StagnantAlertProps {
  updatedAt: string;
  clientName: string;
  amount: number;
}

function getDaysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function getSuggestion(days: number, amount: number): string {
  if (days > 14 && amount > 20000) {
    return "Deal de alto valor parado há muito tempo. Agende uma reunião urgente com o decisor.";
  }
  if (days > 14) {
    return "Recomendado: envie um follow-up por email ou ligue para retomar a negociação.";
  }
  if (days > 7 && amount > 10000) {
    return "Deal importante sem avanço. Considere enviar uma proposta revisada.";
  }
  return "Este deal precisa de atenção. Faça um contato rápido para manter o momentum.";
}

export function StagnantDealAlert({ updatedAt, clientName, amount }: StagnantAlertProps) {
  const days = getDaysSince(updatedAt);
  if (days <= 7) return null;

  const isUrgent = days > 14;
  const suggestion = getSuggestion(days, amount);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-help",
          isUrgent
            ? "bg-status-error/15 text-status-error border border-status-error/20"
            : "bg-status-warning/15 text-status-warning border border-status-warning/20"
        )}>
          {isUrgent ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {days}d parado
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={cn("h-4 w-4", isUrgent ? "text-status-error" : "text-status-warning")} />
            <span className="font-semibold text-xs">
              {isUrgent ? "Ação Urgente" : "Atenção Necessária"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>{clientName}</strong> está sem atualização há {days} dias.
          </p>
          <div className="flex items-start gap-1.5 p-2 rounded-md bg-primary/5 border border-primary/10">
            <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-primary font-medium leading-relaxed">{suggestion}</p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
