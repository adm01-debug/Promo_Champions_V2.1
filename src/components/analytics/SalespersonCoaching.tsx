import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, Sparkles, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { useSalespeople } from '@/hooks/sales/useSalespeople';
import { useSalespersonCoaching } from '@/hooks/sales/useSalespersonCoaching';
import { useQueryClient } from '@tanstack/react-query';
import { CoachingResults } from './CoachingResults';

export function SalespersonCoaching() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const { data: salespeople } = useSalespeople();
  const { data: coaching, isLoading, error, refetch } = useSalespersonCoaching(selectedSalesperson);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['salesperson-coaching', selectedSalesperson] });
    refetch();
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
                <p className="text-sm text-muted-foreground mt-1">Análise automática de padrões de win/loss com recomendações personalizadas</p>
              </div>
            </div>
            {coaching && (
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="glass hover-lift border-border/50">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Atualizar
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
                  {salespeople?.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id} className="hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border/50">
                          <AvatarImage src={sp.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">{sp.name.charAt(0)}</AvatarFallback>
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
                <Zap className="h-4 w-4 text-status-warning" />Selecione um vendedor para gerar análise de coaching
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
              <div className="p-2 rounded-lg bg-status-error/20"><AlertTriangle className="h-5 w-5" /></div>
              <div><p className="font-medium">Erro ao gerar coaching</p><p className="text-sm text-muted-foreground">{error.message}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaching Results */}
      {coaching && !isLoading && <CoachingResults coaching={coaching} />}

      {/* Empty State */}
      {!selectedSalesperson && !isLoading && (
        <Card className="glass dark:border-glow border-dashed animate-fade-in">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-status-purple/20 to-status-purple/5 animate-pulse"><Brain className="h-10 w-10 text-status-purple" /></div>
                <Sparkles className="h-5 w-5 text-status-warning absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium font-display text-lg">Coaching Inteligente</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                  Selecione um vendedor acima para gerar uma análise completa de performance com insights baseados em IA e recomendações personalizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
