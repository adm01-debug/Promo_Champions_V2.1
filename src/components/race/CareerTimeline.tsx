import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy } from 'lucide-react';
import { useMyCareer } from '@/hooks/race/useMyCareer';
import { fmtCompact } from './raceFormatters';

interface Props {
  salespersonId?: string;
}

export function CareerTimeline({ salespersonId }: Props) {
  const { data, isLoading } = useMyCareer(salespersonId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <Card variant="modern" className="p-6 text-center">
        <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">
          Sua carreira começa agora — entre em uma corrida ativa.
        </p>
      </Card>
    );
  }

  const { entries, summary } = data;

  return (
    <div className="space-y-4">
      {/* Sumário */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label="Seasons" value={summary.total_seasons} />
        <SummaryStat label="Títulos" value={summary.total_titles} highlight />
        <SummaryStat label="Pódios" value={summary.total_podiums} />
        <SummaryStat
          label="Melhor rank"
          value={summary.best_rank ? `P${summary.best_rank}` : '—'}
        />
      </div>

      {/* Timeline */}
      <ol role="list" aria-label="Histórico de seasons" className="space-y-2">
        {entries.map((e, i) => (
          <motion.li
            key={e.season_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
          >
            <Card
              variant="modern"
              className={e.was_champion ? 'border-warning/40 bg-warning/5' : ''}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted shrink-0"
                  aria-hidden
                >
                  {e.was_champion ? (
                    <Crown className="w-5 h-5 text-warning" />
                  ) : (
                    <span className="text-xs font-mono font-bold">
                      {e.final_rank ? `P${e.final_rank}` : '—'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{e.season_name}</p>
                    <Badge variant="outline" className="h-4 px-1 text-[10px] uppercase shrink-0">
                      {e.role_type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(e.start_date), 'dd MMM', { locale: ptBR })} →{' '}
                    {format(new Date(e.end_date), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display font-black text-sm tabular-nums">
                    {fmtCompact(e.total_sales)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">pts</div>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <Card variant="modern" className="p-3 text-center">
      <div
        className={
          'text-2xl font-display font-black tabular-nums ' +
          (highlight ? 'text-warning' : 'text-foreground')
        }
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
        {label}
      </div>
    </Card>
  );
}
