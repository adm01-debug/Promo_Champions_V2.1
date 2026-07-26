import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Percent, AlertTriangle } from 'lucide-react';
import { useMarkupOverview } from '@/hooks/bi/useMarkupOverview';
import { formatMarkupPct, MARKUP_TIER_LABELS, classifyMarkup } from '@/lib/markupHelpers';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

const PERIODS = [30, 60, 90] as const;

export const MarkupOverviewCard = memo(({ className }: Props) => {
  const [days, setDays] = useState<number>(30);
  const { data, isLoading } = useMarkupOverview(days);

  const summary = data?.summary;
  const topSellers = (data?.sellers ?? []).slice(0, 5);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-section-title flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          Rentabilidade (markup)
        </CardTitle>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="h-8 w-[110px]" aria-label="Período do markup">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p} value={String(p)}>
                {p} dias
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading || !summary ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : summary.total === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma venda no período selecionado.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-label text-muted-foreground">Markup médio</p>
                <p className="text-2xl font-bold tracking-tight">
                  {formatMarkupPct(summary.average)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-label text-muted-foreground">Mediana</p>
                <p className="text-2xl font-bold tracking-tight">
                  {formatMarkupPct(summary.median)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['excellent', 'healthy', 'critical', 'unknown'] as const).map((tier) => (
                <Badge
                  key={tier}
                  variant="outline"
                  className={cn('gap-1', classifyMarkup(
                    tier === 'excellent' ? 50 : tier === 'healthy' ? 30 : tier === 'critical' ? 5 : null,
                  ).className)}
                >
                  {MARKUP_TIER_LABELS[tier]}: {summary.counts[tier]}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-label text-muted-foreground">Top vendedores por markup médio</p>
              {topSellers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem vendas atribuídas.</p>
              ) : (
                topSellers.map((s) => (
                  <div
                    key={s.salespersonId}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="truncate text-sm">{s.name}</span>
                    <span className="flex items-center gap-2">
                      {s.criticalCount > 0 && (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-destructive/15 text-destructive border-destructive/30"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {s.criticalCount}
                        </Badge>
                      )}
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMarkupPct(s.average)}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

MarkupOverviewCard.displayName = 'MarkupOverviewCard';
