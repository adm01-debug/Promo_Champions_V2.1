import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Users, TrendingUp, TrendingDown, Target, Sparkles, RefreshCw, BarChart3 } from 'lucide-react';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useSalespersonCoaching, CoachingData } from '@/hooks/useSalespersonCoaching';
import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CoachingComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: salespeople } = useSalespeople();

  const coachingQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['salesperson-coaching', id],
      queryFn: async (): Promise<CoachingData> => {
        const { data, error } = await supabase.functions.invoke('salesperson-coaching', {
          body: { salespersonId: id }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
      },
      staleTime: 1000 * 60 * 10,
    }))
  });

  const isLoading = coachingQueries.some(q => q.isLoading);
  const coachingData = coachingQueries
    .filter(q => q.data)
    .map(q => q.data as CoachingData);

  const toggleSalesperson = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const getComparisonColor = (value: number) => {
    if (value > 5) return 'text-status-success';
    if (value < -5) return 'text-status-error';
    return 'text-status-warning';
  };

  const getRankBadge = (index: number) => {
    const colors = [
      'bg-rank-gold/20 text-rank-gold border-rank-gold/30',
      'bg-rank-silver/20 text-rank-silver border-rank-silver/30',
      'bg-rank-bronze/20 text-rank-bronze border-rank-bronze/30',
      'bg-muted text-muted-foreground'
    ];
    return colors[index] || colors[3];
  };

  // Sort by win rate for ranking
  const rankedData = [...coachingData].sort((a, b) => b.metrics.winRate - a.metrics.winRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-secondary/30 to-info/20 border-secondary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl">Comparativo de Coaching</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare performance e coaching entre vendedores da equipe (máx. 4)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {salespeople?.map(sp => (
              <label
                key={sp.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedIds.includes(sp.id)
                    ? 'bg-secondary/20 border border-secondary/50'
                    : 'bg-background/30 border border-border/50 hover:border-border'
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(sp.id)}
                  onCheckedChange={() => toggleSalesperson(sp.id)}
                  disabled={!selectedIds.includes(sp.id) && selectedIds.length >= 4}
                />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={sp.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{sp.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{sp.name}</span>
              </label>
            ))}
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline">{selectedIds.length} selecionado(s)</Badge>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Limpar seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && selectedIds.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-muted-foreground">Carregando dados de coaching...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {coachingData.length >= 2 && !isLoading && (
        <div className="space-y-6">
          {/* Metrics Comparison Table */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Comparativo de Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Vendedor</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ranking</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Total Deals</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Vitórias</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Derrotas</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Win Rate</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">vs Equipe</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedData.map((coaching, index) => (
                      <tr key={coaching.salesperson.id} className="border-b border-border/30 hover:bg-background/30">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{coaching.salesperson.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{coaching.salesperson.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          <Badge variant="outline" className={getRankBadge(index)}>
                            #{index + 1}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-2 font-mono">{coaching.metrics.totalDeals}</td>
                        <td className="text-center py-3 px-2 font-mono text-status-success">{coaching.metrics.wins}</td>
                        <td className="text-center py-3 px-2 font-mono text-status-error">{coaching.metrics.losses}</td>
                        <td className="text-center py-3 px-2">
                          <span className="font-bold text-lg">{coaching.metrics.winRate.toFixed(1)}%</span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <div className={`flex items-center justify-center gap-1 ${getComparisonColor(coaching.metrics.comparisonToTeam)}`}>
                            {coaching.metrics.comparisonToTeam >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 font-mono">
                          R$ {coaching.metrics.avgDealValue.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Side by Side Coaching Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedData.map((coaching, index) => (
              <Card key={coaching.salesperson.id} className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                      <AvatarFallback>{coaching.salesperson.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{coaching.salesperson.name}</CardTitle>
                        <Badge variant="outline" className={getRankBadge(index)}>#{index + 1}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{coaching.coaching.summary}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Strengths */}
                  {coaching.coaching.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-status-success mb-2 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Pontos Fortes
                      </h4>
                      <div className="space-y-1">
                        {coaching.coaching.strengths.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-xs text-muted-foreground bg-status-success/10 rounded px-2 py-1">
                            {s.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {coaching.coaching.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-status-warning mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Áreas de Melhoria
                      </h4>
                      <div className="space-y-1">
                        {coaching.coaching.improvements.slice(0, 2).map((im, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-status-warning/10 rounded px-2 py-1">
                            <span className="text-muted-foreground flex-1">{im.title}</span>
                            <Badge variant="outline" className="text-[10px] px-1">
                              {im.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Loss Reasons */}
                  {coaching.metrics.topLossReasons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-status-error mb-2">Top Motivos de Perda</h4>
                      <div className="space-y-1">
                        {coaching.metrics.topLossReasons.slice(0, 2).map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-status-error/10 rounded px-2 py-1">
                            <span className="text-muted-foreground">{r.reason}</span>
                            <span className="text-status-error font-mono">{r.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights Summary */}
          <Card className="bg-gradient-to-br from-status-purple/20 to-accent/10 border-status-purple/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-status-purple">
                <Sparkles className="h-5 w-5" />
                Insights do Comparativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Best Performer */}
                <div className="bg-background/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Melhor Performance</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={rankedData[0]?.salesperson.avatar_url || undefined} />
                      <AvatarFallback>{rankedData[0]?.salesperson.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rankedData[0]?.salesperson.name}</p>
                      <p className="text-xs text-status-success">{rankedData[0]?.metrics.winRate.toFixed(1)}% win rate</p>
                    </div>
                  </div>
                </div>

                {/* Biggest Gap */}
                {rankedData.length >= 2 && (
                  <div className="bg-background/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Gap entre 1º e último</p>
                    <p className="text-2xl font-bold text-status-warning">
                      {(rankedData[0]?.metrics.winRate - rankedData[rankedData.length - 1]?.metrics.winRate).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">diferença de win rate</p>
                  </div>
                )}

                {/* Team Average */}
                <div className="bg-background/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Média do Grupo</p>
                  <p className="text-2xl font-bold text-secondary">
                    {(rankedData.reduce((sum, c) => sum + c.metrics.winRate, 0) / rankedData.length).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">win rate médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {selectedIds.length < 2 && !isLoading && (
        <Card className="bg-card/30 border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-secondary/10">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium">Selecione pelo menos 2 vendedores</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Escolha 2 a 4 vendedores acima para comparar métricas de performance e coaching lado a lado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
