import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChurnPrediction } from '@/hooks/useChurnPrediction';
import { AlertTriangle, TrendingDown, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RISK_COLORS = {
  critical: 'hsl(var(--status-error))',
  high: 'hsl(var(--primary))',
  medium: 'hsl(var(--status-warning))',
  low: 'hsl(var(--status-success))',
};

const RISK_LABELS = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

export function ChurnPrediction() {
  const { data, isLoading } = useChurnPrediction();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow animate-fade-in">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/50 rounded-lg w-1/3 animate-shimmer" />
            <div className="h-64 bg-muted/50 rounded-lg animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 group/header">
        <div className="p-2 rounded-lg bg-destructive/20 shadow-md shadow-destructive/20 transition-all duration-300 group-hover/header:scale-110 group-hover/header:shadow-destructive/40">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <span className="text-lg font-display font-semibold gradient-text">Previsão de Churn</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="elevated" className="glass border-destructive/30 hover-lift cursor-pointer hover-glow-error transition-all duration-300 animate-fade-in group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-destructive/20 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-destructive/20">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">Crítico</span>
            </div>
            <p className="text-2xl font-bold font-display text-destructive transition-transform duration-300 group-hover:scale-105">{data?.summary.critical || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="glass border-primary/30 hover-lift cursor-pointer transition-all duration-300 animate-fade-in group" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary/30">
                <TrendingDown className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">Alto</span>
            </div>
            <p className="text-2xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">{data?.summary.high || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="glass border-status-warning/30 hover-lift cursor-pointer transition-all duration-300 animate-fade-in group" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-status-warning/20 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-warning/20">
                <Users className="h-3.5 w-3.5 text-status-warning" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">Médio</span>
            </div>
            <p className="text-2xl font-bold font-display text-status-warning transition-transform duration-300 group-hover:scale-105">{data?.summary.medium || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="glass border-status-success/30 hover-lift cursor-pointer hover-glow-success transition-all duration-300 animate-fade-in group" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-status-success/20 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-success/20">
                <Users className="h-3.5 w-3.5 text-status-success" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">Baixo</span>
            </div>
            <p className="text-2xl font-bold font-display text-status-success transition-transform duration-300 group-hover:scale-105">{data?.summary.low || 0}</p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="glass border-primary/30 hover-lift cursor-pointer transition-all duration-300 animate-fade-in group" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary/30">
                <DollarSign className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">Receita em Risco</span>
            </div>
            <p className="text-lg font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-105">
              {formatCurrency(data?.summary.potentialRevenueLoss || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Clients List */}
      <Card variant="elevated" className="glass border-border/40 dark:border-glow transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
            <div className="p-1.5 rounded-lg bg-destructive/20 shadow-md transition-all duration-300 group-hover/title:scale-110 shadow-destructive/20">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="gradient-text">Clientes em Risco de Churn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.atRisk && data.atRisk.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {data.atRisk.map((client, index) => (
                <div 
                  key={index}
                  className="glass rounded-xl p-4 border border-border/40 hover:border-primary/40 transition-all duration-300 hover-lift cursor-pointer flex items-center gap-4 animate-fade-in group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display font-medium text-foreground truncate transition-colors group-hover:text-primary">{client.clientName}</p>
                      <Badge 
                        variant="outline"
                        className="transition-transform group-hover:scale-105"
                        style={{ 
                          borderColor: RISK_COLORS[client.riskLevel],
                          color: RISK_COLORS[client.riskLevel],
                        }}
                      >
                        {RISK_LABELS[client.riskLevel]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground transition-colors group-hover:text-foreground/70">
                      <span>Última compra: {format(new Date(client.lastPurchase), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span className="text-border">•</span>
                      <span>{client.daysSinceLastPurchase} dias atrás</span>
                      <span className="text-border">•</span>
                      <span>{client.totalPurchases} compras</span>
                      <span className="text-border">•</span>
                      <span>Intervalo médio: {client.avgPurchaseInterval} dias</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-medium text-foreground transition-transform duration-300 group-hover:scale-105">{formatCurrency(client.totalRevenue)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={client.riskScore} 
                        className="w-20 h-1.5 shadow-inner"
                        style={{ 
                          '--progress-background': RISK_COLORS[client.riskLevel],
                        } as React.CSSProperties}
                      />
                      <span className="text-xs text-muted-foreground font-display w-8">{client.riskScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
              <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner animate-pulse">
                <Users className="h-10 w-10 opacity-50" />
              </div>
              <p className="font-display font-medium gradient-text">Sem dados de clientes disponíveis para análise</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
