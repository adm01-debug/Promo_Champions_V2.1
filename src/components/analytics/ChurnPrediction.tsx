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
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/50 rounded-lg w-1/3" />
            <div className="h-64 bg-muted/50 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <span className="text-lg font-semibold">Previsão de Churn</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="elevated" className="border-destructive/30 hover-lift cursor-pointer hover-glow-error">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-destructive/20">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Crítico</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{data?.summary.critical || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="border-primary/30 hover-lift cursor-pointer hover-glow-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <TrendingDown className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Alto</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{data?.summary.high || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="border-status-warning/30 hover-lift cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-status-warning/20">
                <Users className="h-3.5 w-3.5 text-status-warning" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Médio</span>
            </div>
            <p className="text-2xl font-bold text-status-warning">{data?.summary.medium || 0}</p>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="border-status-success/30 hover-lift cursor-pointer hover-glow-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-status-success/20">
                <Users className="h-3.5 w-3.5 text-status-success" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Baixo</span>
            </div>
            <p className="text-2xl font-bold text-status-success">{data?.summary.low || 0}</p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border-primary/30 hover-lift cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <DollarSign className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Receita em Risco</span>
            </div>
            <p className="text-lg font-bold gradient-text">
              {formatCurrency(data?.summary.potentialRevenueLoss || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Clients List */}
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-destructive/20">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            </div>
            Clientes em Risco de Churn
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.atRisk && data.atRisk.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {data.atRisk.map((client, index) => (
                <div 
                  key={index}
                  className="glass rounded-xl p-4 border border-border/40 hover:border-primary/40 transition-colors hover-lift cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">{client.clientName}</p>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: RISK_COLORS[client.riskLevel],
                          color: RISK_COLORS[client.riskLevel],
                        }}
                      >
                        {RISK_LABELS[client.riskLevel]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Última compra: {format(new Date(client.lastPurchase), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span>•</span>
                      <span>{client.daysSinceLastPurchase} dias atrás</span>
                      <span>•</span>
                      <span>{client.totalPurchases} compras</span>
                      <span>•</span>
                      <span>Intervalo médio: {client.avgPurchaseInterval} dias</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(client.totalRevenue)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={client.riskScore} 
                        className="w-20 h-1.5"
                        style={{ 
                          '--progress-background': RISK_COLORS[client.riskLevel],
                        } as React.CSSProperties}
                      />
                      <span className="text-xs text-muted-foreground w-8">{client.riskScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Sem dados de clientes disponíveis para análise
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
