import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Award } from 'lucide-react';
import { useEligibleBonuses } from '@/hooks/useEligibleBonuses';
import type { BonusType } from '@/hooks/useCommissionBonuses';

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

export function EligibleBonusesCard({ salespersonId }: Props) {
  const { data: bonuses = [], isLoading } = useEligibleBonuses(salespersonId);

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
              <h3 className="font-bold tracking-tight">Premiações Elegíveis</h3>
              <p className="text-xs text-muted-foreground">
                Bônus adicionais que você conquistou este ciclo
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            {bonuses.length} {bonuses.length === 1 ? 'ativo' : 'ativos'}
          </Badge>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bonuses.map((b) => (
            <li
              key={b.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">{b.name}</p>
                  <Badge variant="outline" className={typeStyles[b.bonus_type]}>
                    {typeLabels[b.bonus_type]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  <Sparkles className="inline h-3 w-3 mr-1 text-amber-500" />
                  {b.reason}
                </p>
                <p className="text-sm font-bold text-emerald-500 mt-1 tabular-nums">
                  + {formatValue(b.bonus_kind, Number(b.bonus_amount))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}
