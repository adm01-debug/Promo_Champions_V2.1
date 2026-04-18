import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RaceEvent {
  id: string;
  event_type: string;
  message: string | null;
  created_at: string;
  season_id: string;
  salesperson_id: string;
}

export function RaceAuditFeed() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-race-audit'],
    queryFn: async (): Promise<RaceEvent[]> => {
      const { data, error } = await supabase
        .from('race_events')
        .select('id,event_type,message,created_at,season_id,salesperson_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as RaceEvent[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel('admin-race-audit')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'race_events' }, () => {
        qc.invalidateQueries({ queryKey: ['admin-race-audit'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5" /> Auditoria de eventos da corrida</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sem eventos registrados.</p>
        ) : (
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {data.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors text-sm">
                <Badge variant="outline" className="text-[10px] uppercase">{e.event_type}</Badge>
                <span className="flex-1 truncate">{e.message ?? '—'}</span>
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {format(new Date(e.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
