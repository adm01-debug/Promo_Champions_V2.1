import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, Gauge, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Level = 'low' | 'medium' | 'high' | 'critical';

interface ChurnJustificationRow {
  last_level: Level;
  last_days_since: number | null;
  last_expected_interval_days: number | null;
  last_threshold_days: number | null;
  last_alerted_at: string;
}

const LEVEL_META: Record<Level, { label: string; tone: string }> = {
  low: { label: 'Baixo', tone: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  medium: { label: 'Moderado', tone: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  high: { label: 'Alto', tone: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
  critical: { label: 'Crítico', tone: 'bg-destructive/10 text-destructive border-destructive/30' },
};

interface Props {
  clientName: string;
}

export function ClientChurnJustificationCard({ clientName }: Props) {
  const { data } = useQuery({
    queryKey: ['client-churn-justification', clientName],
    enabled: !!clientName,
    queryFn: async (): Promise<ChurnJustificationRow | null> => {
      const { data, error } = await supabase
        .from('client_churn_alerts_state')
        .select(
          'last_level, last_days_since, last_expected_interval_days, last_threshold_days, last_alerted_at',
        )
        .ilike('client_name', clientName)
        .order('last_alerted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as ChurnJustificationRow) ?? null;
    },
    staleTime: 60_000,
  });

  if (!data) return null;

  const meta = LEVEL_META[data.last_level] ?? LEVEL_META.medium;
  const days = data.last_days_since ?? 0;
  const avg = data.last_expected_interval_days ?? 0;
  const limit = data.last_threshold_days ?? 0;
  const alertedAt = new Date(data.last_alerted_at);

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 md:p-5 bg-card/60 backdrop-blur-sm',
        'flex flex-col md:flex-row md:items-center gap-4 md:gap-6',
      )}
      role="region"
      aria-label="Justificativa do alerta de churn"
    >
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', meta.tone)}>
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Alerta de churn
            </span>
            <Badge variant="outline" className={cn('text-[10px] font-bold', meta.tone)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Disparado {formatDistanceToNow(alertedAt, { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
        <Metric
          icon={<CalendarClock className="h-4 w-4" />}
          label="Dias sem comprar"
          value={`${days}d`}
        />
        <Metric
          icon={<Gauge className="h-4 w-4" />}
          label="Média do cliente"
          value={avg > 0 ? `${avg}d` : '—'}
          hint={avg > 0 ? 'Intervalo médio entre compras' : 'Histórico insuficiente'}
        />
        <Metric
          icon={<Timer className="h-4 w-4" />}
          label={`Limite ${meta.label.toLowerCase()}`}
          value={limit > 0 ? `${limit}d` : '—'}
          hint="Gatilho para este nível"
        />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-background/50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-black tracking-tight text-foreground">{value}</div>
      {hint ? <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p> : null}
    </div>
  );
}
