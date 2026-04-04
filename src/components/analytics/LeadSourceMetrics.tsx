import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useLeadSourceAnalysis, 
  sourceLabels, 
  sourceColors,
} from "@/hooks/useLeadSourceAnalysis";
import { TrendingUp, Users, DollarSign, Target, Award, Zap, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LeadSourceMetrics() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <Target className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Análise por Fonte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Análise por Fonte de Lead</span>
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
            Últimos 3 meses
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Best performers */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {data?.highestValueSource && (
            <div className="p-3 rounded-xl glass border border-status-success/20 hover-lift transition-all group cursor-default shadow-sm hover-glow-success">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-md bg-status-success/10 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-3.5 w-3.5 text-status-success" />
                </div>
                <span className="text-[10px] text-status-success font-medium">Maior Valor</span>
              </div>
              <p className="text-sm font-bold font-display group-hover:text-status-success transition-colors">
                {sourceLabels[data.highestValueSource]}
              </p>
            </div>
          )}
          {data?.bestConversionSource && (
            <div className="p-3 rounded-xl glass border border-status-info/20 hover-lift transition-all group cursor-default shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-md bg-status-info/10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-3.5 w-3.5 text-status-info" />
                </div>
                <span className="text-[10px] text-status-info font-medium">Melhor Conversão</span>
              </div>
              <p className="text-sm font-bold font-display group-hover:text-status-info transition-colors">
                {sourceLabels[data.bestConversionSource]}
              </p>
            </div>
          )}
          {data?.highestVolumeSource && (
            <div className="p-3 rounded-xl glass border border-accent/20 hover-lift transition-all group cursor-default shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-md bg-accent/10 group-hover:scale-110 transition-transform">
                  <Users className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="text-[10px] text-accent font-medium">Maior Volume</span>
              </div>
              <p className="text-sm font-bold font-display group-hover:text-accent transition-colors">
                {sourceLabels[data.highestVolumeSource]}
              </p>
            </div>
          )}
        </div>

        {/* Source list */}
        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-3">
            {data?.sources.map((source, index) => (
              <div
                key={source.source}
                className={cn(
                  "p-4 rounded-xl glass space-y-3 hover-lift transition-all group cursor-default animate-fade-in",
                  index === 0 && "ring-1 ring-primary/20 shadow-md"
                )}
                style={{ animationDelay: `${(index + 1) * 75}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-4 h-4 rounded-full shadow-md group-hover:scale-110 transition-transform" 
                      style={{ 
                        backgroundColor: sourceColors[source.source],
                        boxShadow: `0 2px 8px ${sourceColors[source.source]}50`
                      }}
                    />
                    <span className="font-medium text-sm font-display group-hover:text-primary transition-colors">
                      {sourceLabels[source.source]}
                    </span>
                    {index === 0 && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-rank-gold/20 text-rank-gold border-0 shadow-sm animate-float">
                        <Award className="h-2.5 w-2.5 mr-0.5" />
                        #1
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-bold font-display gradient-text group-hover:scale-105 transition-transform">
                    {formatCurrency(source.closedValue)}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                    <p className="text-base font-bold font-display">{source.totalLeads}</p>
                    <p className="text-[9px] text-muted-foreground">Leads</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                    <p className="text-base font-bold font-display">{source.closedDeals}</p>
                    <p className="text-[9px] text-muted-foreground">Fechados</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-status-success/5 group-hover:bg-status-success/10 transition-colors">
                    <p className="text-base font-bold text-status-success font-display">{source.conversionRate.toFixed(1)}%</p>
                    <p className="text-[9px] text-muted-foreground">Conversão</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                    <p className="text-base font-bold font-display">{formatCurrency(source.avgDealSize)}</p>
                    <p className="text-[9px] text-muted-foreground">Ticket Médio</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>% do total de leads</span>
                    </div>
                    <span className="font-medium">{source.percentageOfTotal.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={source.percentageOfTotal} 
                    className="h-2 shadow-inner"
                    style={{ 
                      ["--progress-background" as any]: sourceColors[source.source] 
                    }}
                  />
                </div>
              </div>
            ))}

            {(!data?.sources || data.sources.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                <div className="p-4 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 mb-3 shadow-lg">
                  <Zap className="h-10 w-10 opacity-50 animate-pulse" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhum dado de fonte disponível</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Adicione leads com fonte para ver a análise</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
