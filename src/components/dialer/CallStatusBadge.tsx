import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  initiated: 'Iniciando…',
  ringing: 'Tocando…',
  'in-progress': 'Em ligação',
  completed: 'Concluída',
  busy: 'Ocupado',
  'no-answer': 'Sem resposta',
  failed: 'Falhou',
  canceled: 'Cancelada',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  initiated: 'secondary',
  ringing: 'secondary',
  'in-progress': 'default',
  completed: 'outline',
  busy: 'destructive',
  'no-answer': 'destructive',
  failed: 'destructive',
  canceled: 'outline',
};

export const CallStatusBadge = ({ status }: { status: string }) => {
  const isLive = ['initiated', 'ringing', 'in-progress'].includes(status);
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'outline'} className={cn(isLive && 'animate-pulse')}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
};
