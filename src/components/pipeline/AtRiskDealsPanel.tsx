import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  Activity, 
  ChevronDown, 
  _ChevronUp,
  Sparkles,
  RefreshCw 
} from "lucide-react";
import { useAtRiskDeals, useAnalyzeAtRiskDeal, AtRiskDeal } from "@/hooks/useAtRiskDeals";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const RISK_COLORS = {
  critical: "bg-status-error/20 text-status-error border-status-error/30",
  high: "bg-status-warning/20 text-status-warning border-status-warning/30",
  medium: "bg-rank-gold/20 text-rank-gold border-rank-gold/30",
  low: "bg-status-success/20 text-status-success border-status-success/30",
};

const RISK_LABELS = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface DealRowProps {
  deal: AtRiskDeal;
  onAnalyze: (dealId: string) => Promise<{ analysis: string; recommendations: string[] }>;
  isAnalyzing: boolean;
}

function DealRow({ deal, onAnalyze, isAnalyzing }: DealRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    recommendations: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    try {
      const result = await onAnalyze(deal.id);
      if (result) {
        setAiAnalysis(result);
        setExpanded(true);
      }
    } catch (error) {
      // Error is handled in parent
    }
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 group/deal animate-fade-in">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-all duration-200"
        onClick={() => setExpanded(!expanded)}
      >
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">{Math.floor(deal.hoursSinceLastActivity / 24)}d</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="glass border-border/50 shadow-lg">
                {deal.hoursSinceLastActivity} horas sem atividade
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-medium">{deal.activityCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="glass border-border/50 shadow-lg">
                {deal.activityCount} atividades registradas
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="font-display font-bold text-sm min-w-[100px] text-right gradient-text">
            {formatCurrency(deal.amount)}
          </span>
          
          <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover/deal:text-primary transition-colors" />
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/20 space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {deal.riskFactors.map((factor, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-muted/30 border-border/50 shadow-sm animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {factor}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Vendedor: <span className="text-foreground font-medium">{deal.salespersonName}</span>
            </span>
            <Button 
              size="sm" 
              variant="glow"
              className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleAnalyze();
              }}
              disabled={isAnalyzing}
            >
              <Sparkles className={`h-4 w-4 mr-1 ${isAnalyzing ? "animate-pulse text-white" : ""}`} />
              Analisar com IA
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
                      <li 
                        key={idx} 
                        className="flex items-start gap-1.5 animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <span className="text-primary mt-0.5">•</span>
                        {rec}
                      </li>
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
}

export function AtRiskDealsPanel() {
  const { data, isLoading, refetch, isRefetching } = useAtRiskDeals();
  const analyzeMutation = useAnalyzeAtRiskDeal();

  const handleAnalyze = async (dealId: string) => {
    try {
      const result = await analyzeMutation.mutateAsync(dealId);
      toast.success("Análise concluída");
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (message.includes("402")) {
        toast.error("Créditos de IA esgotados.");
      } else {
        toast.error("Erro ao analisar deal");
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48 animate-shimmer" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full animate-shimmer" style={{ animationDelay: '50ms' }} />
          <Skeleton className="h-16 w-full animate-shimmer" style={{ animationDelay: '100ms' }} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.deals.length === 0) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-status-success/30 to-status-success/10 shadow-md transition-all duration-200 group-hover:scale-110">
              <AlertTriangle className="h-4 w-4 text-status-success" />
            </div>
            <span className="gradient-text">Deals em Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
            <div className="p-3 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/5 w-fit mx-auto mb-3 shadow-inner">
              <Activity className="h-10 w-10 text-status-success opacity-60" />
            </div>
            <p className="font-display font-medium gradient-text">Nenhum deal em risco identificado</p>
            <p className="text-xs mt-1">Todos os deals estão com boa atividade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-display group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-status-warning/30 to-status-warning/10 shadow-md transition-all duration-200 group-hover:scale-110">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            </div>
            <span className="gradient-text">Deals em Risco</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex gap-4 mt-3 p-2.5 rounded-lg glass border border-border/30 shadow-inner">
          {data.summary.critical > 0 && (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <div className="h-2.5 w-2.5 rounded-full bg-status-error shadow-md shadow-status-error/50 animate-pulse" />
              <span className="text-xs">
                <span className="font-bold text-status-error">{data.summary.critical}</span> críticos
              </span>
            </div>
          )}
          {data.summary.high > 0 && (
            <div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="h-2.5 w-2.5 rounded-full bg-status-warning shadow-md shadow-status-warning/50" />
              <span className="text-xs">
                <span className="font-bold text-status-warning">{data.summary.high}</span> altos
              </span>
            </div>
          )}
          {data.summary.medium > 0 && (
            <div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="h-2.5 w-2.5 rounded-full bg-rank-gold shadow-md shadow-rank-gold/50" />
              <span className="text-xs">
                <span className="font-bold text-rank-gold">{data.summary.medium}</span> médios
              </span>
            </div>
          )}
          {data.summary.totalValueAtRisk > 0 && (
            <div className="ml-auto text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '150ms' }}>
              Valor em risco: <span className="font-display font-bold text-status-error">{formatCurrency(data.summary.totalValueAtRisk)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.deals.slice(0, 10).map((deal, index) => (
          <div key={deal.id} style={{ animationDelay: `${index * 75}ms` }}>
            <DealRow 
              deal={deal} 
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzeMutation.isPending}
            />
          </div>
        ))}
        
        {data.deals.length > 10 && (
          <p className="text-xs text-center text-muted-foreground pt-2 pb-1 bg-muted/30 rounded-lg border border-border/30 mt-3">
            +{data.deals.length - 10} outros deals em risco
          </p>
        )}
      </CardContent>
    </Card>
  );
}
