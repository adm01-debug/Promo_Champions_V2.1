import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Award, Target } from 'lucide-react';
import { useEligibleBonuses, type EligibleBonus } from '@/hooks/useEligibleBonuses';
import { useAutoAwardBonuses } from '@/hooks/useAutoAwardBonuses';
import type { BonusType } from '@/hooks/useCommissionBonuses';
import { cn } from '@/lib/utils';

const typeLabels: Record<BonusType, string> = {
  first_sale: 'Primeira Venda',
  milestone: 'Marco',
  ranking: 'Ranking',
  streak: 'Sequência',
  other: 'Outro',
};

const typeStyles: Record<BonusType, string> = {
  first_sale: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  milestone: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  ranking: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  streak: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  other: 'bg-muted text-muted-foreground border-border',
};

const formatValue = (kind: 'fixed' | 'percentage', amount: number) =>
  kind === 'fixed'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
    : `${Number(amount).toFixed(2)}%`;

interface Props {
  salespersonId: string | undefined;
}

function BonusRow({ b }: { b: EligibleBonus }) {
  const pct = Math.round(b.progress * 100);
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        b.achieved
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-border bg-card/50',
      )}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-md flex items-center justify-center shrink-0',
          b.achieved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-primary/10 text-primary',
        )}
      >
        {b.achieved ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm truncate">{b.name}</p>
          <Badge variant="outline" className={typeStyles[b.bonus_type]}>
            {typeLabels[b.bonus_type]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          <Sparkles className="inline h-3 w-3 mr-1 text-amber-500" />
          {b.reason}
        </p>

        {!b.achieved && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden" aria-label={`Progresso ${pct}%`}>
            <div
              className="h-full bg-primary/70 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <p
          className={cn(
            'text-sm font-bold mt-1 tabular-nums',
            b.achieved ? 'text-emerald-500' : 'text-muted-foreground',
          )}
        >
          {b.achieved ? '+ ' : ''}
          {formatValue(b.bonus_kind, Number(b.bonus_amount))}
          {!b.achieved && <span className="text-[11px] font-normal"> · {pct}%</span>}
        </p>
      </div>
    </li>
  );
}

export function EligibleBonusesCard({ salespersonId }: Props) {
  const { data: bonuses = [], isLoading } = useEligibleBonuses(salespersonId);

  const { achieved, inProgress } = useMemo(() => {
    const a: EligibleBonus[] = [];
    const p: EligibleBonus[] = [];
    for (const b of bonuses) (b.achieved ? a : p).push(b);
    p.sort((x, y) => y.progress - x.progress);
    return { achieved: a, inProgress: p };
  }, [bonuses]);

  useAutoAwardBonuses(achieved, salespersonId);


  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
      </Card>
    );
  }

  if (bonuses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold tracking-tight">Premiações & Bônus</h3>
              <p className="text-xs text-muted-foreground">
                Conquistas do ciclo e próximos marcos a alcançar
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {achieved.length > 0 && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                {achieved.length} conquistado{achieved.length === 1 ? '' : 's'}
              </Badge>
            )}
            {inProgress.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {inProgress.length} em progresso
              </Badge>
            )}
          </div>
        </header>

        {achieved.length > 0 && (
          <section className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Conquistados
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achieved.map((b) => <BonusRow key={b.id} b={b} />)}
            </ul>
          </section>
        )}

        {inProgress.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Próximos marcos
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inProgress.map((b) => <BonusRow key={b.id} b={b} />)}
            </ul>
          </section>
        )}
      </Card>
    </motion.div>
  );
}
