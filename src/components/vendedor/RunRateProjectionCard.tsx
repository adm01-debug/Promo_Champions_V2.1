import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Target, AlertTriangle, CheckCircle2, Wallet, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRunRateProjection } from '@/hooks/useRunRateProjection';
import { useEligibleBonuses } from '@/hooks/useEligibleBonuses';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RunRateProjectionCardProps {
  salespersonId: string | null | undefined;
  /** Percentual de comissão do vendedor (ex.: 5 para 5%). */
  commissionRate?: number | null;
  className?: string;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n || 0);

const confidenceMeta = {
  low: { label: 'Baixa', className: 'bg-muted text-muted-foreground border-border' },
  medium: { label: 'Média', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  high: { label: 'Alta', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
} as const;

export const RunRateProjectionCard = memo(function RunRateProjectionCard({
  salespersonId,
  commissionRate,
  className,
}: RunRateProjectionCardProps) {
  // commission_rate no banco vem como percentual (5 = 5%). Hook trabalha com fração.
  const rateFraction =
    commissionRate != null && commissionRate > 0 ? commissionRate / 100 : undefined;
  const { data, isLoading } = useRunRateProjection(salespersonId, {
    commissionRate: rateFraction,
  });
  const { data: bonuses = [] } = useEligibleBonuses(salespersonId ?? undefined);

  const { achievedFixedTotal, achievedCount, inProgressCount } = useMemo(() => {
    let sum = 0;
    let ac = 0;
    let ip = 0;
    for (const b of bonuses) {
      if (b.achieved) {
        ac++;
        if (b.bonus_kind === 'fixed') sum += Number(b.bonus_amount) || 0;
      } else {
        ip++;
      }
    }
    return { achievedFixedTotal: sum, achievedCount: ac, inProgressCount: ip };
  }, [bonuses]);

  if (isLoading || !data) {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-72" />
        </CardContent>
      </Card>
    );
  }

  const {
    mtdRevenue,
    goal,
    projectedEOM,
    daysRemaining,
    attainmentProjected,
    dailyPaceRequired,
    gap,
    confidence,
    monthEnd,
    hasGoal,
    hasCommissionRate,
    mtdCommission,
    projectedCommission,
    commissionGap,
  } = data;

  // Status color por atingimento projetado
  const statusColor = !hasGoal
    ? 'text-primary'
    : attainmentProjected >= 1
      ? 'text-emerald-500'
      : attainmentProjected >= 0.8
        ? 'text-amber-500'
        : 'text-destructive';

  const StatusIcon = !hasGoal
    ? Sparkles
    : attainmentProjected >= 1
      ? CheckCircle2
      : AlertTriangle;

  // Larguras da barra (denominador = max(goal, projectedEOM))
  const barMax = Math.max(goal, projectedEOM, 1);
  const mtdPct = Math.min(100, (mtdRevenue / barMax) * 100);
  const projPct = Math.min(100, (projectedEOM / barMax) * 100);
  const goalPct = hasGoal ? Math.min(100, (goal / barMax) * 100) : 0;

  const monthEndLabel = format(new Date(monthEnd + 'T00:00:00'), "d 'de' MMM", {
    locale: ptBR,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Projeção no ritmo atual
            </CardTitle>
            <Badge
              variant="outline"
              className={cn('text-[10px]', confidenceMeta[confidence].className)}
            >
              Confiança: {confidenceMeta[confidence].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <p className={cn('text-3xl md:text-4xl font-black tabular-nums', statusColor)}>
                {formatBRL(projectedEOM)}
              </p>
              <p className="text-xs text-muted-foreground">
                projetado até {monthEndLabel} · faltam {daysRemaining} dia
                {daysRemaining === 1 ? '' : 's'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-sm">
              <StatusIcon className={cn('h-4 w-4', statusColor)} />
              {hasGoal ? (
                <span className={cn('font-semibold tabular-nums', statusColor)}>
                  {(attainmentProjected * 100).toFixed(0)}% da meta
                </span>
              ) : (
                <span className="text-muted-foreground">Sem meta definida</span>
              )}
            </div>
          </div>

          {/* Barra: MTD (sólido) + projeção incremental (translúcido) + marker da meta */}
          <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="absolute top-0 h-full bg-primary/30 transition-all"
              style={{ width: `${projPct}%` }}
              aria-hidden
            />
            <div
              className="absolute top-0 h-full bg-primary transition-all"
              style={{ width: `${mtdPct}%` }}
              aria-hidden
            />
            {hasGoal && (
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground/70"
                style={{ left: `${goalPct}%` }}
                title={`Meta: ${formatBRL(goal)}`}
                aria-label={`Meta: ${formatBRL(goal)}`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>Atual: {formatBRL(mtdRevenue)}</span>
            {hasGoal && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" /> Meta: {formatBRL(goal)}
              </span>
            )}
          </div>

          {/* Comissão projetada no bolso do vendedor */}
          {hasCommissionRate && (
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-primary/15 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Comissão projetada ({(commissionRate ?? 0).toFixed(1)}%)
                </p>
                <p className="text-xl font-black tabular-nums text-primary">
                  {formatBRL(projectedCommission)}
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground tabular-nums">
                <p>Já acumulado: <span className="font-semibold text-foreground">{formatBRL(mtdCommission)}</span></p>
                {hasGoal && commissionGap > 0 && (
                  <p>Falta p/ meta: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatBRL(commissionGap)}</span></p>
                )}
              </div>
            </div>
          )}


          {/* Insight secundário */}
          <p className="text-sm text-foreground/90">
            {!hasGoal ? (
              <>Defina uma meta mensal para ver quanto falta para batê-la.</>
            ) : gap > 0 && daysRemaining > 0 ? (
              <>
                Precisa fechar{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatBRL(dailyPaceRequired)}/dia
                </span>{' '}
                nos próximos {daysRemaining} dia{daysRemaining === 1 ? '' : 's'} para
                bater a meta.
              </>
            ) : gap > 0 ? (
              <>
                Mês encerrado no ritmo atual — faltaria{' '}
                <span className="font-semibold text-destructive">{formatBRL(gap)}</span>{' '}
                para a meta.
              </>
            ) : (
              <>
                No ritmo atual você{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  supera a meta em {formatBRL(Math.abs(gap))}
                </span>
                . Continue assim!
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
});
