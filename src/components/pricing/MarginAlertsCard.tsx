import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCriticalMarkupSales } from '@/hooks/bi/useCriticalMarkupSales';
import { CRITICAL_MARKUP_THRESHOLD } from '@/lib/bi/markupOverviewHelpers';
import { formatMarkupPct } from '@/lib/markupHelpers';
import { fmtCurrency } from './pricing-ui';

const ALERTS_LIMIT = 10;

export function MarginAlertsCard({ days }: { days: number }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCriticalMarkupSales(days, ALERTS_LIMIT);
  const alerts = data ?? [];

  return (
    <Card className="glass border-warning/20 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldCheck className="h-24 w-24 text-warning" />
      </div>
      <CardHeader className="bg-warning/10 border-b border-warning/10 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20 border border-warning/30">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle className="text-section-title font-black font-sora">
                Price Guard: Alertas de Margem
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Vendas com markup abaixo de {CRITICAL_MARKUP_THRESHOLD}% nos últimos{' '}
                {days} dias
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <Badge
              variant="outline"
              className="bg-warning/20 text-warning border-warning/40 font-black text-[10px] px-3 py-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              {alerts.length}
              {alerts.length === ALERTS_LIMIT ? '+' : ''}{' '}
              {alerts.length === 1 ? 'INCIDENTE CRÍTICO' : 'INCIDENTES CRÍTICOS'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        {isLoading ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar os alertas de margem.
          </p>
        ) : alerts.length === 0 ? (
          <p className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Nenhuma venda com markup crítico nos últimos {days} dias.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/5 transition-all group gap-4"
              >
                <div className="flex items-center gap-5">
                  <div className="w-1.5 h-12 rounded-full bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                  <div>
                    <div className="text-lg font-black group-hover:text-primary transition-colors">
                      {alert.clientName}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {alert.productName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-10">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">
                      Valor da Venda
                    </div>
                    <div className="text-sm font-black font-mono">
                      {fmtCurrency(alert.amount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono tracking-tighter text-destructive">
                      {formatMarkupPct(alert.markupPct)}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                      Markup
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end p-4">
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-6 text-[10px] font-black tracking-widest border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg"
                onClick={() => navigate('/vendas?markup=critical')}
              >
                REVISAR VENDAS
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
