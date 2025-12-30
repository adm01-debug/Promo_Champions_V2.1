import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Package, 
  RefreshCw,
  BarChart3
} from "lucide-react";
import { useDemandForecast } from "@/hooks/useDemandForecast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DemandForecastDashboard() {
  const { 
    generateForecasts, 
    isGenerating, 
    lastForecastResult,
    storedForecasts,
    forecastsLoading,
    inventoryLevels,
    inventoryLoading,
  } = useDemandForecast();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-status-success" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-status-error" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      critical: { variant: "destructive", label: "Crítico" },
      high: { variant: "destructive", label: "Alto" },
      medium: { variant: "secondary", label: "Médio" },
      low: { variant: "outline", label: "Baixo" },
    };
    const { variant, label } = variants[risk] || variants.low;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const forecasts = lastForecastResult?.forecasts || [];
  const criticalItems = forecasts.filter(f => f.risk_level === 'critical').length;
  const highRiskItems = forecasts.filter(f => f.risk_level === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Previsão de Demanda
          </h2>
          <p className="text-muted-foreground">
            Análise preditiva de demanda de produtos
          </p>
        </div>
        <Button 
          onClick={() => generateForecasts()} 
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Gerando...' : 'Gerar Previsões'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastForecastResult?.total_products || storedForecasts?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-status-error/30 bg-status-error/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-status-error flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Itens Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-error">
              {criticalItems}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-status-warning/30 bg-status-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-status-warning flex items-center gap-2">
              <Package className="h-4 w-4" />
              Alto Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">
              {highRiskItems}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última Atualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastForecastResult?.generated_at 
                ? new Date(lastForecastResult.generated_at).toLocaleString('pt-BR')
                : 'Nunca'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts Table */}
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle>Previsões por Produto</CardTitle>
          <CardDescription>
            Demanda prevista para os próximos 30, 60 e 90 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating || forecastsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : forecasts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-center">30 dias</TableHead>
                  <TableHead className="text-center">60 dias</TableHead>
                  <TableHead className="text-center">90 dias</TableHead>
                  <TableHead className="text-center">Tendência</TableHead>
                  <TableHead className="text-center">Risco</TableHead>
                  <TableHead className="text-center">Confiança</TableHead>
                  <TableHead>Recomendação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((forecast) => (
                  <TableRow key={forecast.product_id}>
                    <TableCell className="font-medium">
                      {forecast.product_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={forecast.current_stock <= 0 ? 'text-status-error font-bold' : ''}>
                        {forecast.current_stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{forecast.predicted_demand_30d}</TableCell>
                    <TableCell className="text-center">{forecast.predicted_demand_60d}</TableCell>
                    <TableCell className="text-center">{forecast.predicted_demand_90d}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(forecast.trend)}
                        <span className="text-xs capitalize">{forecast.trend === 'increasing' ? 'Alta' : forecast.trend === 'decreasing' ? 'Baixa' : 'Estável'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRiskBadge(forecast.risk_level)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={forecast.confidence * 100} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(forecast.confidence * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {forecast.reorder_recommendation}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma previsão gerada ainda.</p>
              <p className="text-sm">Clique em "Gerar Previsões" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Levels */}
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Níveis de Estoque
          </CardTitle>
          <CardDescription>
            Status atual do inventário por produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : inventoryLevels && inventoryLevels.length > 0 ? (
            <div className="space-y-4">
              {inventoryLevels.slice(0, 10).map((item) => {
                const percentage = (item.current_stock / item.max_stock_level) * 100;
                const isCritical = item.current_stock <= item.reorder_point;
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.products?.name || 'Produto'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isCritical ? 'text-status-error font-bold' : 'text-muted-foreground'}`}>
                          {item.current_stock} / {item.max_stock_level}
                        </span>
                        {isCritical && (
                          <AlertTriangle className="h-4 w-4 text-status-error" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isCritical ? '[&>div]:bg-status-error' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum nível de estoque cadastrado.</p>
              <p className="text-sm">Os níveis serão criados automaticamente ao gerar previsões.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
