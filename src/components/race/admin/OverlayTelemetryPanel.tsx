import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Row {
  overlay_name: string;
  total_views: number;
  unique_users: number;
  last_viewed_at: string;
}

/**
 * Widget de telemetria: agrega `race_overlay_telemetry` dos últimos 30 dias
 * para guiar decisões de remoção de overlays pouco visualizados.
 */
export function OverlayTelemetryPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['race-overlay-telemetry-30d'],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Row[]> => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from('race_overlay_telemetry')
        .select('overlay_name, viewed_count, last_viewed_at, user_id')
        .gte('last_viewed_at', since);
      if (error) throw error;
      const map = new Map<string, Row>();
      for (const r of data ?? []) {
        const cur = map.get(r.overlay_name) ?? {
          overlay_name: r.overlay_name,
          total_views: 0,
          unique_users: 0,
          last_viewed_at: r.last_viewed_at,
        };
        cur.total_views += r.viewed_count ?? 0;
        cur.unique_users += 1;
        if (r.last_viewed_at > cur.last_viewed_at) cur.last_viewed_at = r.last_viewed_at;
        map.set(r.overlay_name, cur);
      }
      return Array.from(map.values()).sort((a, b) => b.total_views - a.total_views);
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const rows = data ?? [];
  const cold = rows.filter((r) => r.total_views < 5);
  const hot = rows.filter((r) => r.total_views >= 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Overlays usados nos últimos 30 dias
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Use como guia para remover overlays pouco visualizados (disciplina de remoção).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <section>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <Eye className="w-4 h-4 text-status-success" /> Em uso ({hot.length})
          </h3>
          {hot.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum overlay com tráfego significativo ainda.</p>
          ) : (
            <ul className="space-y-1.5">
              {hot.map((r) => (
                <li key={r.overlay_name} className="flex items-center justify-between text-sm border-b border-border/50 pb-1">
                  <span className="font-mono">{r.overlay_name}</span>
                  <span className="text-muted-foreground text-xs">
                    {r.total_views} views · {r.unique_users} usuários ·{' '}
                    {formatDistanceToNow(new Date(r.last_viewed_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <EyeOff className="w-4 h-4 text-status-warning" /> Candidatos a remoção ({cold.length})
          </h3>
          {cold.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum overlay frio detectado.</p>
          ) : (
            <ul className="space-y-1.5">
              {cold.map((r) => (
                <li key={r.overlay_name} className="flex items-center justify-between text-sm border-b border-border/30 pb-1 opacity-75">
                  <span className="font-mono">{r.overlay_name}</span>
                  <span className="text-muted-foreground text-xs">{r.total_views} views</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
