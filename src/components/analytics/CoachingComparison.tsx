import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Users, TrendingDown, Target, Sparkles, Crown } from 'lucide-react';
import { useSalespeople } from '@/hooks/sales/useSalespeople';
import { CoachingData } from '@/hooks/useSalespersonCoaching';
import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CoachingMetricsTable } from '@/components/analytics/coaching/CoachingMetricsTable';
import { CoachingCardGrid } from '@/components/analytics/coaching/CoachingCardGrid';

export function CoachingComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: salespeople } = useSalespeople();

  const coachingQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['salesperson-coaching', id],
      queryFn: async (): Promise<CoachingData> => {
        const { data, error } = await supabase.functions.invoke('salesperson-coaching', { body: { salespersonId: id } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
      },
      staleTime: 1000 * 60 * 10,
    }))
  });

  const isLoading = coachingQueries.some(q => q.isLoading);
  const coachingData = coachingQueries.filter(q => q.data).map(q => q.data as CoachingData);
  const rankedData = [...coachingData].sort((a, b) => b.metrics.winRate - a.metrics.winRate);

  const toggleSalesperson = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card className="glass dark:border-glow card-elevated animate-fade-in bg-gradient-to-br from-secondary/10 via-transparent to-status-info/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-lg shadow-secondary/10"><Users className="h-6 w-6 text-secondary" /></div>
            <div>
              <CardTitle className="text-xl font-display gradient-text flex items-center gap-2">Comparativo de Coaching<Sparkles className="h-4 w-4 text-status-warning animate-pulse" /></CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Compare performance e coaching entre vendedores da equipe (máx. 4)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pb-2">
              {salespeople?.map((sp, index) => (
                <label key={sp.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 animate-fade-in ${selectedIds.includes(sp.id) ? 'glass border-2 border-secondary/50 bg-secondary/10 hover-glow' : 'glass border border-border/50 hover:border-primary/30 hover-lift'}`} style={{ animationDelay: `${index * 30}ms` }}>
                  <Checkbox checked={selectedIds.includes(sp.id)} onCheckedChange={() => toggleSalesperson(sp.id)} disabled={!selectedIds.includes(sp.id) && selectedIds.length >= 4} className="border-border/50" />
                  <Avatar className={`h-6 w-6 transition-transform ${selectedIds.includes(sp.id) ? 'scale-110' : ''}`}><AvatarImage src={sp.avatar_url || undefined} /><AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">{sp.name.charAt(0)}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium">{sp.name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border border-secondary/30">{selectedIds.length} selecionado(s)</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-muted-foreground hover:text-foreground">Limpar seleção</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && selectedIds.length > 0 && (
        <Card className="glass dark:border-glow card-elevated animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10"><Loader2 className="h-10 w-10 animate-spin text-secondary" /></div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center"><p className="text-muted-foreground font-medium">Carregando dados de coaching...</p><p className="text-xs text-muted-foreground/70 mt-1">Isso pode levar alguns segundos</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {coachingData.length >= 2 && !isLoading && (
        <div className="space-y-6">
          <CoachingMetricsTable rankedData={rankedData} />
          <CoachingCardGrid rankedData={rankedData} />

          {/* Insights Summary */}
          <Card className="glass dark:border-glow card-elevated animate-fade-in bg-gradient-to-br from-status-purple/10 via-transparent to-accent/5" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-status-purple font-display"><div className="p-1.5 rounded-lg bg-status-purple/20"><Sparkles className="h-5 w-5" /></div>Insights do Comparativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 border border-rank-gold/30 bg-rank-gold/5 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Crown className="h-3 w-3 text-rank-gold" />Melhor Performance</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-rank-gold/50 shadow-sm shadow-rank-gold/20"><AvatarImage src={rankedData[0]?.salesperson.avatar_url || undefined} /><AvatarFallback className="font-display bg-rank-gold/20">{rankedData[0]?.salesperson.name.charAt(0)}</AvatarFallback></Avatar>
                    <div><p className="font-medium font-display">{rankedData[0]?.salesperson.name}</p><p className="text-xs text-status-success font-medium">{rankedData[0]?.metrics.winRate.toFixed(1)}% win rate</p></div>
                  </div>
                </div>
                {rankedData.length >= 2 && (
                  <div className="glass rounded-xl p-4 border border-status-warning/30 bg-status-warning/5 hover-lift transition-all">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><TrendingDown className="h-3 w-3 text-status-warning" />Gap entre 1º e último</p>
                    <p className="text-3xl font-bold font-display text-status-warning">{(rankedData[0]?.metrics.winRate - rankedData[rankedData.length - 1]?.metrics.winRate).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">diferença de win rate</p>
                  </div>
                )}
                <div className="glass rounded-xl p-4 border border-secondary/30 bg-secondary/5 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Target className="h-3 w-3 text-secondary" />Média do Grupo</p>
                  <p className="text-3xl font-bold font-display text-secondary">{(rankedData.reduce((sum, c) => sum + c.metrics.winRate, 0) / rankedData.length).toFixed(1)}%</p>
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
              <div className="relative"><div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 animate-pulse"><Users className="h-10 w-10 text-secondary" /></div><Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" /></div>
              <div><h3 className="font-medium font-display text-lg">Selecione pelo menos 2 vendedores</h3><p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">Escolha 2 a 4 vendedores acima para comparar métricas de performance e coaching lado a lado.</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
