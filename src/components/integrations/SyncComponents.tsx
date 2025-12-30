import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Webhook, RefreshCw, CheckCircle2, XCircle, 
  Clock, ArrowUpDown, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SyncEvent {
  id: string;
  type: 'sync' | 'webhook' | 'import' | 'export';
  status: 'success' | 'error' | 'pending';
  source: string;
  target: string;
  recordsAffected: number;
  timestamp: string;
  duration?: string;
  errorMessage?: string;
}

interface SyncHistoryProps {
  events: SyncEvent[];
  onRetry?: (id: string) => void;
  className?: string;
}

export const SyncHistory: FC<SyncHistoryProps> = ({ events, onRetry, className }) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredEvents = events.filter(e => 
    filter === 'all' || e.status === filter
  );

  const statusConfig = {
    success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          {(['all', 'success', 'error'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === 'all' ? 'Todos' : f === 'success' ? 'Sucesso' : 'Erros'}
            </Button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-2">
        {filteredEvents.map((event) => {
          const config = statusConfig[event.status];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div className={cn("p-2 rounded-full", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{event.source}</span>
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm">{event.target}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{event.recordsAffected} registros</span>
                  {event.duration && <span>• {event.duration}</span>}
                  <span>• {event.timestamp}</span>
                </div>
                {event.errorMessage && (
                  <p className="text-xs text-red-500 mt-1">{event.errorMessage}</p>
                )}
              </div>

              <Badge
                variant={event.status === 'success' ? 'default' : 
                        event.status === 'error' ? 'destructive' : 'secondary'}
              >
                {event.type}
              </Badge>

              {event.status === 'error' && onRetry && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onRetry(event.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Status de conexão
interface ConnectionStatusProps {
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  onSync?: () => void;
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({
  name,
  status,
  lastSync,
  onSync
}) => {
  const statusStyles = {
    connected: "bg-green-500",
    disconnected: "bg-gray-400",
    error: "bg-red-500",
    syncing: "bg-blue-500 animate-pulse"
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", statusStyles[status])} />
        <div>
          <p className="font-medium text-sm">{name}</p>
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Última sync: {lastSync}
            </p>
          )}
        </div>
      </div>

      {onSync && status !== 'syncing' && (
        <Button variant="ghost" size="sm" onClick={onSync}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Sincronizar
        </Button>
      )}
    </div>
  );
};
