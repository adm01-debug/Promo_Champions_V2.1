// CoachingComparison - side-by-side coaching comparison
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Users, TrendingUp, TrendingDown, Target, Sparkles, BarChart3, Crown, Trophy, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { useSalespeople } from '@/hooks/useSalespeople';
import { CoachingData } from '@/hooks/useSalespersonCoaching';
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
      'bg-muted text-muted-foreground border-border'
    ];
    return colors[index] || colors[3];
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-3 w-3" />;
    if (index === 1) return <Trophy className="h-3 w-3" />;
    return null;
  };

  // Sort by win rate for ranking
  const rankedData = [...coachingData].sort((a, b) => b.metrics.winRate - a.metrics.winRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass dark:border-glow card-elevated animate-fade-in bg-gradient-to-br from-secondary/10 via-transparent to-status-info/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-lg shadow-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl font-display gradient-text flex items-center gap-2">
                Comparativo de Coaching
                <Sparkles className="h-4 w-4 text-status-warning animate-pulse" />
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare performance e coaching entre vendedores da equipe (máx. 4)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pb-2">
              {salespeople?.map((sp, index) => (
                <label
                  key={sp.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 animate-fade-in ${
                    selectedIds.includes(sp.id)
                      ? 'glass border-2 border-secondary/50 bg-secondary/10 hover-glow'
                      : 'glass border border-border/50 hover:border-primary/30 hover-lift'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Checkbox
                    checked={selectedIds.includes(sp.id)}
                    onCheckedChange={() => toggleSalesperson(sp.id)}
                    disabled={!selectedIds.includes(sp.id) && selectedIds.length >= 4}
                    className="border-border/50"
                  />
                  <Avatar className={`h-6 w-6 transition-transform ${selectedIds.includes(sp.id) ? 'scale-110' : ''}`}>
                    <AvatarImage src={sp.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">
                      {sp.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{sp.name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border border-secondary/30">
                {selectedIds.length} selecionado(s)
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground hover:text-foreground">
                Limpar seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && selectedIds.length > 0 && (
        <Card className="glass dark:border-glow card-elevated animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10">
                  <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                </div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground font-medium">Carregando dados de coaching...</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Isso pode levar alguns segundos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {coachingData.length >= 2 && !isLoading && (
        <div className="space-y-6">
          {/* Metrics Comparison Table */}
          <Card className="glass dark:border-glow card-elevated animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 font-display">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <span className="gradient-text">Comparativo de Métricas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">Vendedor</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ranking</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Vitórias</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Derrotas</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Win Rate</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">vs Equipe</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ticket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedData.map((coaching, index) => (
                        <tr 
                          key={coaching.salesperson.id} 
                          className={`border-b border-border/30 transition-colors animate-fade-in ${
                            index === 0 ? 'bg-rank-gold/5' : 'hover:bg-background/50'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Avatar className={`h-8 w-8 ${index === 0 ? 'border-2 border-rank-gold shadow-sm shadow-rank-gold/20' : ''}`}>
                                <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">
                                  {coaching.salesperson.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className={`font-medium ${index === 0 ? 'gradient-text font-display' : ''}`}>
                                {coaching.salesperson.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant="outline" className={`${getRankBadge(index)} border`}>
                              {getRankIcon(index)}
                              #{index + 1}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2 font-mono text-sm">{coaching.metrics.totalDeals}</td>
                          <td className="text-center py-3 px-2 font-mono text-sm text-status-success">{coaching.metrics.wins}</td>
                          <td className="text-center py-3 px-2 font-mono text-sm text-status-error">{coaching.metrics.losses}</td>
                          <td className="text-center py-3 px-2">
                            <span className={`font-bold text-lg font-display ${
                              coaching.metrics.winRate >= 60 ? 'text-status-success' : 
                              coaching.metrics.winRate >= 40 ? 'text-status-warning' : 'text-status-error'
                            }`}>
                              {coaching.metrics.winRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <div className={`flex items-center justify-center gap-1 ${getComparisonColor(coaching.metrics.comparisonToTeam)}`}>
                              {coaching.metrics.comparisonToTeam >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="font-medium text-sm">
                                {coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 font-mono text-sm">
                            R$ {coaching.metrics.avgDealValue.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Side by Side Coaching Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedData.map((coaching, index) => (
              <Card 
                key={coaching.salesperson.id} 
                className={`glass dark:border-glow card-elevated animate-fade-in transition-all duration-300 ${
                  index === 0 ? 'ring-1 ring-rank-gold/30 hover-glow-gold' : 'hover-lift'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Avatar className={`h-12 w-12 border-2 transition-transform duration-300 group-hover:scale-105 ${
                        index === 0 ? 'border-rank-gold shadow-lg shadow-rank-gold/20' : 'border-primary/30'
                      }`}>
                        <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                        <AvatarFallback className="font-display bg-gradient-to-br from-primary/20 to-primary/5">
                          {coaching.salesperson.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-br from-rank-gold to-rank-gold/80 shadow-lg animate-pulse">
                          <Crown className="h-3 w-3 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className={`text-base font-display ${index === 0 ? 'gradient-text' : ''}`}>
                          {coaching.salesperson.name}
                        </CardTitle>
                        <Badge variant="outline" className={`${getRankBadge(index)} border text-xs`}>
                          {getRankIcon(index)}
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{coaching.coaching.summary}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Strengths */}
                  {coaching.coaching.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium font-display text-status-success mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pontos Fortes
                      </h4>
                      <div className="space-y-1.5">
                        {coaching.coaching.strengths.slice(0, 2).map((s, i) => (
                          <p 
                            key={i} 
                            className="text-xs text-muted-foreground glass rounded-lg px-2.5 py-1.5 border border-status-success/20 bg-status-success/5"
                          >
                            {s.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {coaching.coaching.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium font-display text-status-warning mb-2 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" /> Áreas de Melhoria
                      </h4>
                      <div className="space-y-1.5">
                        {coaching.coaching.improvements.slice(0, 2).map((im, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-2 text-xs glass rounded-lg px-2.5 py-1.5 border border-status-warning/20 bg-status-warning/5"
                          >
                            <span className="text-muted-foreground flex-1">{im.title}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-status-warning/30 text-status-warning">
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
                      <h4 className="text-sm font-medium font-display text-status-error mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Top Motivos de Perda
                      </h4>
                      <div className="space-y-1.5">
                        {coaching.metrics.topLossReasons.slice(0, 2).map((r, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between text-xs glass rounded-lg px-2.5 py-1.5 border border-status-error/20 bg-status-error/5"
                          >
                            <span className="text-muted-foreground">{r.reason}</span>
                            <span className="text-status-error font-mono font-medium">{r.percentage}%</span>
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
          <Card className="glass dark:border-glow card-elevated animate-fade-in bg-gradient-to-br from-status-purple/10 via-transparent to-accent/5" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-status-purple font-display">
                <div className="p-1.5 rounded-lg bg-status-purple/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                Insights do Comparativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Best Performer */}
                <div className="glass rounded-xl p-4 border border-rank-gold/30 bg-rank-gold/5 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Crown className="h-3 w-3 text-rank-gold" />
                    Melhor Performance
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-rank-gold/50 shadow-sm shadow-rank-gold/20">
                      <AvatarImage src={rankedData[0]?.salesperson.avatar_url || undefined} />
                      <AvatarFallback className="font-display bg-rank-gold/20">{rankedData[0]?.salesperson.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium font-display">{rankedData[0]?.salesperson.name}</p>
                      <p className="text-xs text-status-success font-medium">{rankedData[0]?.metrics.winRate.toFixed(1)}% win rate</p>
                    </div>
                  </div>
                </div>

                {/* Biggest Gap */}
                {rankedData.length >= 2 && (
                  <div className="glass rounded-xl p-4 border border-status-warning/30 bg-status-warning/5 hover-lift transition-all">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-status-warning" />
                      Gap entre 1º e último
                    </p>
                    <p className="text-3xl font-bold font-display text-status-warning">
                      {(rankedData[0]?.metrics.winRate - rankedData[rankedData.length - 1]?.metrics.winRate).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">diferença de win rate</p>
                  </div>
                )}

                {/* Team Average */}
                <div className="glass rounded-xl p-4 border border-secondary/30 bg-secondary/5 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3 text-secondary" />
                    Média do Grupo
                  </p>
                  <p className="text-3xl font-bold font-display text-secondary">
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
        <Card className="glass dark:border-glow border-dashed animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 animate-pulse">
                  <Users className="h-10 w-10 text-secondary" />
                </div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium font-display text-lg">Selecione pelo menos 2 vendedores</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
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
