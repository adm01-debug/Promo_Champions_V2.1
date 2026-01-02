import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HistoryPanel({ tableName, recordId }: { tableName: string; recordId: string }) {
  const { data: history, isLoading } = useAuditLog(tableName, recordId);

  if (isLoading) return <div>Carregando...</div>;
  if (!history?.length) return <div className="text-muted-foreground">Sem histórico</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map(entry => (
          <div key={entry.id} className="border-l-2 pl-3 pb-3">
            <div className="font-medium">{entry.action}</div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
