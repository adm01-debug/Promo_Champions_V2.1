import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import { toast } from 'sonner';

export type MomentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type MomentStatus = 'new' | 'acknowledged' | 'actioned' | 'dismissed';

export interface CriticalMomentRow {
  id: string;
  recording_id: string;
  owner_id: string;
  salesperson_id: string;
  moment_type: string;
  severity: string;
  timestamp_sec: number;
  quote: string | null;
  context: string | null;
  suggested_action: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CriticalMoment extends CriticalMomentRow {
  recordingTitle: string | null;
  recordedAt: string | null;
  salespersonName: string | null;
  isUnread: boolean;
}

export interface CriticalMomentsResult {
  moments: CriticalMoment[];
  unreadCount: number;
}

export interface CriticalMomentsFilters {
  status?: MomentStatus | 'all';
  severity?: MomentSeverity | 'all';
}

export const MOMENT_TYPE_LABELS: Record<string, string> = {
  objection: 'Objeção',
  buying_signal: 'Sinal de compra',
  price_mention: 'Menção de preço',
  discount_request: 'Pedido de desconto',
  churn_signal: 'Sinal de churn',
  competitor: 'Concorrente citado',
  commitment: 'Compromisso assumido',
  next_step: 'Próximo passo',
};

type SeverityMeta = { label: string; tone: string };

const MEDIUM_SEVERITY: SeverityMeta = {
  label: 'Média',
  tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

export const SEVERITY_META: Record<string, SeverityMeta> = {
  low: { label: 'Baixa', tone: 'bg-muted text-muted-foreground border-transparent' },
  medium: MEDIUM_SEVERITY,
  high: {
    label: 'Alta',
    tone: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  },
  critical: {
    label: 'Crítica',
    tone: 'bg-destructive/15 text-destructive border-destructive/30',
  },
};

export const MOMENT_STATUS_LABELS: Record<MomentStatus, string> = {
  new: 'Novo',
  acknowledged: 'Reconhecido',
  actioned: 'Tratado',
  dismissed: 'Dispensado',
};

export const MOMENT_STATUS_FILTERS: Array<{
  value: MomentStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Novos' },
  { value: 'acknowledged', label: 'Reconhecidos' },
  { value: 'actioned', label: 'Tratados' },
  { value: 'dismissed', label: 'Dispensados' },
];

export const SEVERITY_FILTERS: Array<{ value: MomentSeverity | 'all'; label: string }> = [
  { value: 'all', label: 'Todas as severidades' },
  { value: 'critical', label: 'Crítica' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

export function momentTypeLabel(type: string): string {
  return MOMENT_TYPE_LABELS[type] ?? type;
}

export function severityMeta(severity: string): SeverityMeta {
  return SEVERITY_META[severity] ?? MEDIUM_SEVERITY;
}

export function momentStatusLabel(status: string): string {
  return MOMENT_STATUS_LABELS[status as MomentStatus] ?? status;
}

/** Converte o segundo do áudio em mm:ss para o trecho citado na gravação. */
export function formatMomentTimestamp(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

interface RecordingLookup {
  id: string;
  title: string;
  recorded_at: string;
}

interface SalespersonLookup {
  id: string;
  name: string;
}

interface NotificationLookup {
  moment_id: string;
}

/**
 * Momentos críticos detectados na análise das gravações de chamada.
 *
 * A visibilidade é decidida no banco: `call_critical_moments` libera o dono e a
 * gestão, `critical_moment_notifications` libera apenas o destinatário. Por isso
 * não há filtro por usuário aqui — filtrar de novo esconderia a linha que o
 * gestor recebeu por notificação.
 */
export function useCriticalMoments(filters: CriticalMomentsFilters = {}) {
  const status = filters.status ?? 'all';
  const severity = filters.severity ?? 'all';

  return useQuery({
    queryKey: ['critical-moments', status, severity],
    queryFn: async (): Promise<CriticalMomentsResult> => {
      let query = supabase
        .from('call_critical_moments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (status !== 'all') query = query.eq('status', status);
      if (severity !== 'all') query = query.eq('severity', severity);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as CriticalMomentRow[];
      if (rows.length === 0) return { moments: [], unreadCount: 0 };

      const recordingIds = [...new Set(rows.map(row => row.recording_id))];
      const salespersonIds = [...new Set(rows.map(row => row.salesperson_id))];

      const [recordings, salespeople, notifications] = await Promise.all([
        chunkedIn<RecordingLookup>(
          recordingIds,
          chunk =>
            supabase
              .from('call_recordings')
              .select('id, title, recorded_at')
              .in('id', chunk as string[]),
          { parallel: true, label: 'critical-moments/recordings' }
        ),
        chunkedIn<SalespersonLookup>(
          salespersonIds,
          chunk =>
            supabase
              .from('salespeople')
              .select('id, name')
              .in('id', chunk as string[]),
          { parallel: true, label: 'critical-moments/salespeople' }
        ),
        supabase
          .from('critical_moment_notifications')
          .select('moment_id')
          .is('read_at', null)
          .limit(500),
      ]);

      if (notifications.error) throw notifications.error;

      const recordingById = new Map(recordings.map(row => [row.id, row]));
      const salespersonById = new Map(salespeople.map(row => [row.id, row]));
      const unreadIds = new Set(
        ((notifications.data ?? []) as NotificationLookup[]).map(row => row.moment_id)
      );

      const moments = rows.map<CriticalMoment>(row => ({
        ...row,
        recordingTitle: recordingById.get(row.recording_id)?.title ?? null,
        recordedAt: recordingById.get(row.recording_id)?.recorded_at ?? null,
        salespersonName: salespersonById.get(row.salesperson_id)?.name ?? null,
        isUnread: unreadIds.has(row.id),
      }));

      return {
        moments,
        unreadCount: moments.filter(moment => moment.isUnread).length,
      };
    },
  });
}

export function useCriticalMomentActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['critical-moments'] });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MomentStatus }) => {
      const { error } = await supabase
        .from('call_critical_moments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_result, variables) => {
      invalidate();
      toast.success(
        `Momento marcado como ${momentStatusLabel(variables.status).toLowerCase()}`
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const markRead = useMutation({
    mutationFn: async (momentIds: string[]) => {
      if (momentIds.length === 0) return 0;
      const { error } = await supabase
        .from('critical_moment_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('moment_id', momentIds)
        .is('read_at', null);
      if (error) throw error;
      return momentIds.length;
    },
    onSuccess: count => {
      invalidate();
      if (count > 0) toast.success(`${count} alerta(s) marcado(s) como lido(s)`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { setStatus, markRead };
}
