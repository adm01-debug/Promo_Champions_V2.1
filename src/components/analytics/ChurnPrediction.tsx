import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChurnPrediction } from '@/hooks/useChurnPrediction';
import { AlertTriangle, TrendingDown, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RISK_COLORS = {
  critical: 'hsl(0, 84%, 60%)',
  high: 'hsl(25, 95%, 53%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(142, 76%, 36%)',
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
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Crítico</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{data?.summary.critical || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Alto</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{data?.summary.high || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Médio</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{data?.summary.medium || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Baixo</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{data?.summary.low || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Receita em Risco</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(data?.summary.potentialRevenueLoss || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Clients List */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Clientes em Risco de Churn
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.atRisk && data.atRisk.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {data.atRisk.map((client, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
