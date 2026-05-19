import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Clock, Activity, ChevronDown, Sparkles, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AtRiskDeal } from "@/hooks/deal-intelligence/useAtRiskDeals";

const RISK_COLORS = {
  critical: "bg-status-error/20 text-status-error border-status-error/30",
  high: "bg-status-warning/20 text-status-warning border-status-warning/30",
  medium: "bg-rank-gold/20 text-rank-gold border-rank-gold/30",
  low: "bg-status-success/20 text-status-success border-status-success/30",
};

const RISK_LABELS = { critical: "Crítico", high: "Alto", medium: "Médio", low: "Baixo" };

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface DealRowProps {
  deal: AtRiskDeal;
  onAnalyze: (dealId: string) => Promise<{ analysis: string; recommendations: string[] }>;
  isAnalyzing: boolean;
}

export const DealRow = React.memo(function DealRow({ deal, onAnalyze, isAnalyzing }: DealRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ analysis: string; recommendations: string[] } | null>(null);

  const handleAnalyze = async () => {
    try {
      const result = await onAnalyze(deal.id);
      if (result) { setAiAnalysis(result); setExpanded(true); }
    } catch { /* handled in parent */ }
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 group/deal animate-fade-in">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-all duration-200" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1">
          <Badge className={`${RISK_COLORS[deal.riskLevel]} border shadow-sm transition-all duration-200 group-hover/deal:scale-105`}>
            {deal.riskLevel === "critical" && <Flame className="h-3 w-3 mr-1 animate-pulse" />}
            {RISK_LABELS[deal.riskLevel]}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="font-display font-medium truncate group-hover/deal:text-primary transition-colors">{deal.clientName}</p>
            <p className="text-xs text-muted-foreground truncate">{deal.productName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider><Tooltip><TooltipTrigger><div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"><Clock className="h-4 w-4" /><span className="text-xs font-medium">{Math.floor(deal.hoursSinceLastActivity / 24)}d</span></div></TooltipTrigger><TooltipContent className="glass border-border/50 shadow-lg">{deal.hoursSinceLastActivity} horas sem atividade</TooltipContent></Tooltip></TooltipProvider>
          <TooltipProvider><Tooltip><TooltipTrigger><div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"><Activity className="h-4 w-4" /><span className="text-xs font-medium">{deal.activityCount}</span></div></TooltipTrigger><TooltipContent className="glass border-border/50 shadow-lg">{deal.activityCount} atividades registradas</TooltipContent></Tooltip></TooltipProvider>
          <span className="font-display font-bold text-sm min-w-[100px] text-right gradient-text">{formatCurrency(deal.amount)}</span>
          <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}><ChevronDown className="h-4 w-4 text-muted-foreground group-hover/deal:text-primary transition-colors" /></div>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/20 space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {deal.riskFactors.map((factor, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-muted/30 border-border/50 shadow-sm animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>{factor}</Badge>
            ))}
          </div>

          {deal.suggestedAction && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3 animate-fade-in shadow-inner">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Ação Sugerida</p>
                <p className="text-xs font-bold">{deal.suggestedAction}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-muted-foreground">Vendedor: <span className="text-foreground font-medium">{deal.salespersonName}</span></span>
            <Button size="sm" variant="glow" className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} disabled={isAnalyzing}>
              <Sparkles className={`h-4 w-4 mr-1 ${isAnalyzing ? "animate-pulse text-primary-foreground" : ""}`} />Analisar com IA
            </Button>
          </div>
          {aiAnalysis && (
            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30 space-y-2 shadow-inner animate-fade-in">
              <p className="text-sm">{aiAnalysis.analysis}</p>
              {aiAnalysis.recommendations?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-display font-semibold text-muted-foreground mb-1.5">Recomendações:</p>
                  <ul className="text-xs space-y-1.5">
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}><span className="text-primary mt-0.5">•</span>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export { RISK_COLORS, RISK_LABELS, formatCurrency };
