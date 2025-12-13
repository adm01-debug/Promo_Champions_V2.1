import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useSalespersonCoaching } from '@/hooks/useSalespersonCoaching';
import { useQueryClient } from '@tanstack/react-query';

export function SalespersonCoaching() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const { data: salespeople } = useSalespeople();
  const { data: coaching, isLoading, error, refetch } = useSalespersonCoaching(selectedSalesperson);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['salesperson-coaching', selectedSalesperson] });
    refetch();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'média': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Selector */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Coaching IA Personalizado</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Análise automática de padrões de win/loss com recomendações personalizadas
                </p>
              </div>
            </div>
            {coaching && (
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedSalesperson || ''} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="w-[280px] bg-background/50">
                <SelectValue placeholder="Selecione um vendedor..." />
              </SelectTrigger>
              <SelectContent>
                {salespeople?.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{sp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {sp.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedSalesperson && (
              <p className="text-sm text-muted-foreground">
                Selecione um vendedor para gerar análise de coaching
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-muted-foreground">Analisando padrões e gerando coaching...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <p>Erro ao gerar coaching: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaching Results */}
      {coaching && !isLoading && (
        <div className="space-y-6">
          {/* Salesperson Header with Metrics */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16 border-2 border-purple-500/30">
                  <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                  <AvatarFallback className="text-xl bg-purple-500/20">
                    {coaching.salesperson.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{coaching.salesperson.name}</h3>
                  <p className="text-muted-foreground mt-1">{coaching.coaching.summary}</p>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Deals</p>
                      <p className="text-2xl font-bold">{coaching.metrics.totalDeals}</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-2xl font-bold text-green-400">{coaching.metrics.winRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">vs Equipe</p>
                      <div className="flex items-center gap-1">
                        {coaching.metrics.comparisonToTeam >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <p className={`text-2xl font-bold ${coaching.metrics.comparisonToTeam >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Ticket Médio</p>
                      <p className="text-2xl font-bold">R$ {coaching.metrics.avgDealValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {coaching.coaching.strengths.length > 0 && (
            <Card className="bg-green-900/10 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coaching.coaching.strengths.map((strength, i) => (
                  <div key={i} className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <h4 className="font-medium text-green-300">{strength.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{strength.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {coaching.coaching.improvements.length > 0 && (
            <Card className="bg-yellow-900/10 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                  <Target className="h-5 w-5" />
                  Áreas de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coaching.coaching.improvements.map((improvement, i) => (
                  <div key={i} className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-yellow-300">{improvement.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                        {improvement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{improvement.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          {coaching.coaching.actions.length > 0 && (
            <Card className="bg-purple-900/10 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-400">
                  <Lightbulb className="h-5 w-5" />
                  Ações Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coaching.coaching.actions.map((action, i) => (
                  <div key={i} className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <h4 className="font-medium text-purple-300">{action.action}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        <span className="text-purple-400">Prazo:</span> {action.timeline}
                      </span>
                      <span className="text-muted-foreground">
                        <span className="text-purple-400">Impacto:</span> {action.expectedImpact}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Generated timestamp */}
          <p className="text-xs text-muted-foreground text-center">
            Análise gerada em: {new Date(coaching.generatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!selectedSalesperson && !isLoading && (
        <Card className="bg-card/30 border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-purple-500/10">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">Coaching Inteligente</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Selecione um vendedor acima para gerar uma análise completa de performance 
                  com insights baseados em IA e recomendações personalizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
