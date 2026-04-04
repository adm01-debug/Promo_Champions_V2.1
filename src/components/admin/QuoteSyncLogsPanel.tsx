import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function QuoteSyncLogsPanel() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['quote-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <RefreshCw className="h-4 w-4 text-primary" />
          Logs de Sincronização de Orçamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Nenhum log de sincronização encontrado.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  {statusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{log.action}</span>
                      <Badge variant="outline" className={`text-xs ${statusColor(log.status)}`}>
                        {log.status}
                      </Badge>
                      {log.quote_number && (
                        <span className="text-xs text-muted-foreground">
                          #{log.quote_number}
                        </span>
                      )}
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1 truncate">
                        {log.error_message}
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
