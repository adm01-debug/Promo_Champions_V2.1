import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  useLeadSourceAnalysis, 
  sourceLabels, 
  sourceColors,
  LeadSource 
} from "@/hooks/useLeadSourceAnalysis";
import { TrendingUp, Users, DollarSign, Target, Award, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceMetrics() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Análise por Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Análise por Fonte de Lead
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Últimos 3 meses
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Best performers */}
        <div className="grid grid-cols-3 gap-3">
          {data?.highestValueSource && (
            <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-status-success" />
                <span className="text-[10px] text-status-success font-medium">Maior Valor</span>
              </div>
              <p className="text-sm font-bold">{sourceLabels[data.highestValueSource]}</p>
            </div>
          )}
          {data?.bestConversionSource && (
            <div className="p-3 rounded-lg bg-status-info/10 border border-status-info/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-status-info" />
                <span className="text-[10px] text-status-info font-medium">Melhor Conversão</span>
              </div>
              <p className="text-sm font-bold">{sourceLabels[data.bestConversionSource]}</p>
            </div>
          )}
          {data?.highestVolumeSource && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-[10px] text-accent font-medium">Maior Volume</span>
              </div>
              <p className="text-sm font-bold">{sourceLabels[data.highestVolumeSource]}</p>
            </div>
          )}
        </div>

        {/* Source list */}
        <div className="space-y-3">
          {data?.sources.map((source, index) => (
            <div
              key={source.source}
              className="p-3 rounded-lg bg-muted/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: sourceColors[source.source] }}
                  />
                  <span className="font-medium text-sm">{sourceLabels[source.source]}</span>
                  {index === 0 && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                      <Award className="h-2.5 w-2.5 mr-0.5" />
                      #1
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold">{formatCurrency(source.closedValue)}</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{source.totalLeads}</p>
                  <p className="text-[9px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{source.closedDeals}</p>
                  <p className="text-[9px] text-muted-foreground">Fechados</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-status-success">{source.conversionRate.toFixed(1)}%</p>
                  <p className="text-[9px] text-muted-foreground">Conversão</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(source.avgDealSize)}</p>
                  <p className="text-[9px] text-muted-foreground">Ticket Médio</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>% do total de leads</span>
                  <span>{source.percentageOfTotal.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={source.percentageOfTotal} 
                  className="h-1.5"
                  style={{ 
                    ["--progress-background" as any]: sourceColors[source.source] 
                  }}
                />
              </div>
            </div>
          ))}

          {(!data?.sources || data.sources.length === 0) && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Zap className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Nenhum dado de fonte disponível</p>
              <p className="text-xs mt-1">Adicione leads com fonte para ver a análise</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
