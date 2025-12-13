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
  ChevronUp,
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
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Badge className={RISK_COLORS[deal.riskLevel]}>
            {deal.riskLevel === "critical" && <Flame className="h-3 w-3 mr-1" />}
            {RISK_LABELS[deal.riskLevel]}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{deal.clientName}</p>
            <p className="text-xs text-muted-foreground truncate">{deal.productName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{Math.floor(deal.hoursSinceLastActivity / 24)}d</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {deal.hoursSinceLastActivity} horas sem atividade
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">{deal.activityCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {deal.activityCount} atividades registradas
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="font-semibold text-sm min-w-[100px] text-right">
            {formatCurrency(deal.amount)}
          </span>
          
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/20 space-y-3">
          <div className="flex flex-wrap gap-2">
            {deal.riskFactors.map((factor, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {factor}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Vendedor: <span className="text-foreground">{deal.salespersonName}</span>
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAnalyze();
              }}
              disabled={isAnalyzing}
            >
              <Sparkles className={`h-4 w-4 mr-1 ${isAnalyzing ? "animate-pulse" : ""}`} />
              Analisar com IA
            </Button>
          </div>
          
          {aiAnalysis && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm">{aiAnalysis.analysis}</p>
              {aiAnalysis.recommendations?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Recomendações:</p>
                  <ul className="text-xs space-y-1">
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
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
    } catch (error: any) {
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos de IA esgotados.");
      } else {
        toast.error("Erro ao analisar deal");
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.deals.length === 0) {
    return (
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-status-warning/20">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            </div>
            <span>Deals em Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum deal em risco identificado</p>
            <p className="text-xs mt-1">Todos os deals estão com boa atividade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="border-border/40 dark:border-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-status-warning/20">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            </div>
            <span>Deals em Risco</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex gap-4 mt-3">
          {data.summary.critical > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-status-error" />
              <span className="text-xs">
                <span className="font-bold">{data.summary.critical}</span> críticos
              </span>
            </div>
          )}
          {data.summary.high > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-status-warning" />
              <span className="text-xs">
                <span className="font-bold">{data.summary.high}</span> altos
              </span>
            </div>
          )}
          {data.summary.medium > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rank-gold" />
              <span className="text-xs">
                <span className="font-bold">{data.summary.medium}</span> médios
              </span>
            </div>
          )}
          {data.summary.totalValueAtRisk > 0 && (
            <div className="ml-auto text-xs text-muted-foreground">
              Valor em risco: <span className="font-bold text-status-error">{formatCurrency(data.summary.totalValueAtRisk)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.deals.slice(0, 10).map(deal => (
          <DealRow 
            key={deal.id} 
            deal={deal} 
            onAnalyze={handleAnalyze}
            isAnalyzing={analyzeMutation.isPending}
          />
        ))}
        
        {data.deals.length > 10 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{data.deals.length - 10} outros deals em risco
          </p>
        )}
      </CardContent>
    </Card>
  );
}
