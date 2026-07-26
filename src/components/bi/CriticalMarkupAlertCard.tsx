import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCriticalMarkupSales } from '@/hooks/bi/useCriticalMarkupSales';
import { formatBRL, formatMarkupPct } from '@/lib/markupHelpers';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  days?: number;
}

export const CriticalMarkupAlertCard = memo(({ className, days = 30 }: Props) => {
  const navigate = useNavigate();
  const { data, isLoading } = useCriticalMarkupSales(days);
  const sales = data ?? [];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-section-title flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Alerta de markup crítico
          {sales.length > 0 && (
            <Badge
              variant="outline"
              className="bg-destructive/15 text-destructive border-destructive/30"
            >
              {sales.length}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => navigate('/vendas?markup=critical')}
        >
          Ver vendas
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sales.length === 0 ? (
          <p className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Nenhuma venda com markup crítico nos últimos {days} dias.
          </p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{sale.clientName}</p>
                <p className="truncate text-xs text-muted-foreground">{sale.productName}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatBRL(sale.amount)}
                </span>
                <Badge
                  variant="outline"
                  className="bg-destructive/15 text-destructive border-destructive/30 tabular-nums"
                >
                  {formatMarkupPct(sale.markupPct)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
});

CriticalMarkupAlertCard.displayName = 'CriticalMarkupAlertCard';
