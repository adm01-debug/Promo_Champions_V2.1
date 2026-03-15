// SalespersonCoaching - AI coaching insights for salespeople
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Zap, Award } from 'lucide-react';
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
      case 'alta': return 'bg-status-error/20 text-status-error border-status-error/30';
      case 'média': return 'bg-status-warning/20 text-status-warning border-status-warning/30';
      case 'baixa': return 'bg-status-success/20 text-status-success border-status-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Selector */}
      <Card className="glass dark:border-glow card-elevated animate-fade-in bg-gradient-to-br from-status-purple/10 via-transparent to-accent/5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-status-purple/30 to-status-purple/10 shadow-lg shadow-status-purple/10 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-status-purple" />
              </div>
              <div>
                <CardTitle className="text-xl font-display gradient-text flex items-center gap-2">
                  Coaching IA Personalizado
                  <Sparkles className="h-4 w-4 text-status-warning animate-pulse" />
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Análise automática de padrões de win/loss com recomendações personalizadas
                </p>
              </div>
            </div>
            {coaching && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="glass hover-lift border-border/50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select value={selectedSalesperson || ''} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="w-full sm:w-[300px] glass border-border/50 hover:border-primary/30 transition-colors">
                <SelectValue placeholder="Selecione um vendedor..." />
              </SelectTrigger>
              <SelectContent className="glass border-border/50">
                <ScrollArea className="h-[200px]">
                  {salespeople?.map((sp, index) => (
                    <SelectItem 
                      key={sp.id} 
                      value={sp.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border/50">
                          <AvatarImage src={sp.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">
                            {sp.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {sp.name}
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            {!selectedSalesperson && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-status-warning" />
                Selecione um vendedor para gerar análise de coaching
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="glass dark:border-glow card-elevated animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-status-purple/20 animate-ping" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-status-purple/30 to-status-purple/10">
                  <Loader2 className="h-10 w-10 animate-spin text-status-purple" />
                </div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground font-medium">Analisando padrões e gerando coaching...</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Isso pode levar alguns segundos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="glass border-status-error/30 bg-status-error/5 animate-fade-in">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-status-error">
              <div className="p-2 rounded-lg bg-status-error/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Erro ao gerar coaching</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaching Results */}
      {coaching && !isLoading && (
        <div className="space-y-6">
          {/* Salesperson Header with Metrics */}
          <Card className="glass dark:border-glow card-elevated animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-status-purple/30 shadow-lg shadow-status-purple/10 transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-status-purple/30 to-status-purple/10 font-display">
                      {coaching.salesperson.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-br from-status-purple to-status-purple/80 shadow-lg">
                    <Award className="h-4 w-4 text-background" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold font-display gradient-text">{coaching.salesperson.name}</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{coaching.coaching.summary}</p>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="glass rounded-xl p-3 border border-border/40 hover-lift transition-all">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Total Deals
                      </p>
                      <p className="text-2xl font-bold font-display mt-1">{coaching.metrics.totalDeals}</p>
                    </div>
                    <div className="glass rounded-xl p-3 border border-status-success/30 bg-status-success/5 hover-lift transition-all">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-status-success" />
                        Taxa de Conversão
                      </p>
                      <p className="text-2xl font-bold font-display text-status-success mt-1">{coaching.metrics.winRate.toFixed(1)}%</p>
                    </div>
                    <div className={`glass rounded-xl p-3 border hover-lift transition-all ${
                      coaching.metrics.comparisonToTeam >= 0 
                        ? "border-status-success/30 bg-status-success/5" 
                        : "border-status-error/30 bg-status-error/5"
                    }`}>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {coaching.metrics.comparisonToTeam >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-status-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-status-error" />
                        )}
                        vs Equipe
                      </p>
                      <p className={`text-2xl font-bold font-display mt-1 ${coaching.metrics.comparisonToTeam >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                        {coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%
                      </p>
                    </div>
                    <div className="glass rounded-xl p-3 border border-border/40 hover-lift transition-all">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-status-warning" />
                        Ticket Médio
                      </p>
                      <p className="text-2xl font-bold font-display mt-1">R$ {coaching.metrics.avgDealValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {coaching.coaching.strengths.length > 0 && (
            <Card className="glass border-status-success/30 bg-gradient-to-br from-status-success/10 to-transparent animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-success font-display">
                  <div className="p-1.5 rounded-lg bg-status-success/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  Pontos Fortes
                  <Badge variant="secondary" className="bg-status-success/20 text-status-success ml-auto">
                    {coaching.coaching.strengths.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3 pr-2">
                    {coaching.coaching.strengths.map((strength, i) => (
                      <div 
                        key={i} 
                        className="glass rounded-xl p-4 border border-status-success/20 hover-lift transition-all animate-fade-in"
                        style={{ animationDelay: `${(i + 1) * 50}ms` }}
                      >
                        <h4 className="font-medium font-display text-status-success flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {strength.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{strength.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {coaching.coaching.improvements.length > 0 && (
            <Card className="glass border-status-warning/30 bg-gradient-to-br from-status-warning/10 to-transparent animate-fade-in" style={{ animationDelay: '150ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-warning font-display">
                  <div className="p-1.5 rounded-lg bg-status-warning/20">
                    <Target className="h-5 w-5" />
                  </div>
                  Áreas de Melhoria
                  <Badge variant="secondary" className="bg-status-warning/20 text-status-warning ml-auto">
                    {coaching.coaching.improvements.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3 pr-2">
                    {coaching.coaching.improvements.map((improvement, i) => (
                      <div 
                        key={i} 
                        className="glass rounded-xl p-4 border border-status-warning/20 hover-lift transition-all animate-fade-in"
                        style={{ animationDelay: `${(i + 1) * 50}ms` }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium font-display text-status-warning flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            {improvement.title}
                          </h4>
                          <Badge variant="outline" className={`${getPriorityColor(improvement.priority)} text-xs`}>
                            {improvement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{improvement.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          {coaching.coaching.actions.length > 0 && (
            <Card className="glass border-status-purple/30 bg-gradient-to-br from-status-purple/10 to-transparent animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-status-purple font-display">
                  <div className="p-1.5 rounded-lg bg-status-purple/20">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  Ações Recomendadas
                  <Badge variant="secondary" className="bg-status-purple/20 text-status-purple ml-auto">
                    {coaching.coaching.actions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3 pr-2">
                    {coaching.coaching.actions.map((action, i) => (
                      <div 
                        key={i} 
                        className="glass rounded-xl p-4 border border-status-purple/20 hover-lift transition-all animate-fade-in"
                        style={{ animationDelay: `${(i + 1) * 50}ms` }}
                      >
                        <h4 className="font-medium font-display text-status-purple flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          {action.action}
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-status-purple/10 text-status-purple">
                            <Target className="h-3 w-3" />
                            {action.timeline}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-status-success/10 text-status-success">
                            <TrendingUp className="h-3 w-3" />
                            {action.expectedImpact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Generated timestamp */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground glass px-4 py-2 rounded-full w-fit mx-auto">
            <Sparkles className="h-3 w-3 text-status-warning" />
            Análise gerada em: {new Date(coaching.generatedAt).toLocaleString('pt-BR')}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedSalesperson && !isLoading && (
        <Card className="glass dark:border-glow border-dashed animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-status-purple/20 to-status-purple/5 animate-pulse">
                  <Brain className="h-10 w-10 text-status-purple" />
                </div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium font-display text-lg">Coaching Inteligente</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
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
