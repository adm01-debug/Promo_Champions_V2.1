import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { useAtRiskDeals, useAnalyzeAtRiskDeal } from "@/hooks/deal-intelligence/useAtRiskDeals";
import { toast } from "sonner";
import { DealRow, formatCurrency } from "./DealRow";

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
      if (message.includes("429")) toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      else if (message.includes("402")) toast.error("Créditos de IA esgotados.");
      else toast.error("Erro ao analisar deal");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader><Skeleton className="h-6 w-48 animate-shimmer" /></CardHeader>
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
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-display group"><div className="p-2 rounded-lg bg-gradient-to-br from-status-success/30 to-status-success/10 shadow-md transition-all duration-200 group-hover:scale-110"><AlertTriangle className="h-4 w-4 text-status-success" /></div><span className="gradient-text">Deals em Risco</span></CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
            <div className="p-3 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/5 w-fit mx-auto mb-3 shadow-inner"><Activity className="h-10 w-10 text-status-success opacity-60" /></div>
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
          <CardTitle className="flex items-center gap-2 text-lg font-display group"><div className="p-2 rounded-lg bg-gradient-to-br from-status-warning/30 to-status-warning/10 shadow-md transition-all duration-200 group-hover:scale-110"><AlertTriangle className="h-4 w-4 text-status-warning" /></div><span className="gradient-text">Deals em Risco</span></CardTitle>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200" onClick={() => refetch()} disabled={isRefetching}><RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /></Button>
        </div>
        <div className="flex gap-4 mt-3 p-2.5 rounded-lg glass border border-border/30 shadow-inner">
          {data.summary.critical > 0 && (<div className="flex items-center gap-1.5 animate-fade-in"><div className="h-2.5 w-2.5 rounded-full bg-status-error shadow-md shadow-status-error/50 animate-pulse" /><span className="text-xs"><span className="font-bold text-status-error">{data.summary.critical}</span> críticos</span></div>)}
          {data.summary.high > 0 && (<div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '50ms' }}><div className="h-2.5 w-2.5 rounded-full bg-status-warning shadow-md shadow-status-warning/50" /><span className="text-xs"><span className="font-bold text-status-warning">{data.summary.high}</span> altos</span></div>)}
          {data.summary.medium > 0 && (<div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '100ms' }}><div className="h-2.5 w-2.5 rounded-full bg-rank-gold shadow-md shadow-rank-gold/50" /><span className="text-xs"><span className="font-bold text-rank-gold">{data.summary.medium}</span> médios</span></div>)}
          {data.summary.totalValueAtRisk > 0 && (<div className="ml-auto text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '150ms' }}>Valor em risco: <span className="font-display font-bold text-status-error">{formatCurrency(data.summary.totalValueAtRisk)}</span></div>)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.deals.slice(0, 10).map((deal, index) => (
          <div key={deal.id} style={{ animationDelay: `${index * 75}ms` }}>
            <DealRow deal={deal} onAnalyze={handleAnalyze} isAnalyzing={analyzeMutation.isPending} />
          </div>
        ))}
        {data.deals.length > 10 && (<p className="text-xs text-center text-muted-foreground pt-2 pb-1 bg-muted/30 rounded-lg border border-border/30 mt-3">+{data.deals.length - 10} outros deals em risco</p>)}
      </CardContent>
    </Card>
  );
}
