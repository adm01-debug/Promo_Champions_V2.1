import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, RefreshCw, Play, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type DialerQueue, useQueueStats } from '@/hooks/dialer/usePowerDialer';
import { STRATEGY_OPTIONS } from './dialerHelpers';

interface Props {
  queue: DialerQueue;
  isActive: boolean;
  onSelect: () => void;
  onRebuild: () => void;
  onStart: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  rebuilding?: boolean;
}

export const DialerQueueCard = ({
  queue,
  isActive,
  onSelect,
  onRebuild,
  onStart,
  onEdit,
  onDelete,
  rebuilding,
}: Props) => {
  const { data: stats } = useQueueStats(queue.id);
  const strategy =
    STRATEGY_OPTIONS.find(s => s.value === queue.priority_strategy)?.label ??
    queue.priority_strategy;

  return (
    <Card className={isActive ? 'border-primary ring-1 ring-primary/30' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onSelect} className="text-left flex-1">
            <h3 className="font-semibold">{queue.name}</h3>
            <p className="text-xs text-muted-foreground">{strategy}</p>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline">
              <Phone className="h-3 w-3 mr-1" />
              {stats?.pending_count ?? 0}
            </Badge>
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onEdit}
                aria-label={`Editar fila ${queue.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
                aria-label={`Excluir fila ${queue.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="font-bold text-success">{stats?.done_count ?? 0}</div>
            <div className="text-muted-foreground">Feitas</div>
          </div>
          <div>
            <div className="font-bold text-warning">{stats?.snoozed_count ?? 0}</div>
            <div className="text-muted-foreground">Adiadas</div>
          </div>
          <div>
            <div className="font-bold text-muted-foreground">
              {stats?.skipped_count ?? 0}
            </div>
            <div className="text-muted-foreground">Puladas</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {queue.last_built_at
            ? `Construída ${formatDistanceToNow(new Date(queue.last_built_at), { locale: ptBR, addSuffix: true })}`
            : 'Nunca construída'}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onRebuild}
            disabled={rebuilding}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${rebuilding ? 'animate-spin' : ''}`} />
            Reconstruir
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onStart}
            disabled={(stats?.pending_count ?? 0) === 0}
          >
            <Play className="h-3 w-3 mr-1" />
            Iniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
