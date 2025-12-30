import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  History, 
  User, 
  FileText, 
  Settings, 
  Database, 
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface AuditEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'view';
  entityType: string;
  entityName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface AuditLogProps {
  entries: AuditEntry[];
  onEntryClick?: (entry: AuditEntry) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const AuditLog: FC<AuditLogProps> = ({ 
  entries, 
  onEntryClick, 
  onLoadMore,
  hasMore 
}) => {
  const actionLabels = {
    create: { label: 'Criou', color: 'bg-green-500' },
    update: { label: 'Atualizou', color: 'bg-blue-500' },
    delete: { label: 'Excluiu', color: 'bg-red-500' },
    view: { label: 'Visualizou', color: 'bg-gray-500' }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Log de Auditoria</h3>
          <p className="text-sm text-muted-foreground">Histórico de ações do sistema</p>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div 
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onEntryClick?.(entry)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.userAvatar} />
              <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{entry.userName}</span>
                {' '}
                <span className={`px-1.5 py-0.5 rounded text-xs text-white ${actionLabels[entry.action].color}`}>
                  {actionLabels[entry.action].label}
                </span>
                {' '}
                <span className="text-muted-foreground">{entry.entityType}</span>
                {' '}
                <span className="font-medium">{entry.entityName}</span>
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {entry.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button variant="outline" className="w-full mt-4" onClick={onLoadMore}>
          Carregar Mais
        </Button>
      )}
    </Card>
  );
};

interface ChangeHistoryProps {
  entityType: string;
  entityName: string;
  history: {
    id: string;
    version: number;
    changedBy: string;
    changedAt: string;
    changes: { field: string; oldValue: string; newValue: string }[];
  }[];
  onRestore?: (version: number) => void;
}

export const ChangeHistory: FC<ChangeHistoryProps> = ({
  entityType,
  entityName,
  history,
  onRestore
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold">Histórico de Alterações</h4>
          <p className="text-sm text-muted-foreground">
            {entityType}: {entityName}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((entry, index) => (
          <div key={entry.id} className="relative pl-6">
            {/* Timeline connector */}
            {index < history.length - 1 && (
              <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="absolute left-0 w-4 h-4 rounded-full bg-primary" />
            
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">Versão {entry.version}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    por {entry.changedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{entry.changedAt}</span>
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRestore?.(entry.version)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                {entry.changes.map((change, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
                    <span className="font-medium min-w-[100px]">{change.field}:</span>
                    <span className="text-muted-foreground line-through">{change.oldValue}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-green-600">{change.newValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface DataRecoveryProps {
  deletedItems: {
    id: string;
    type: string;
    name: string;
    deletedBy: string;
    deletedAt: string;
    expiresAt: string;
  }[];
  onRecover?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export const DataRecovery: FC<DataRecoveryProps> = ({
  deletedItems,
  onRecover,
  onPermanentDelete
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-semibold">Lixeira</h3>
          <p className="text-sm text-muted-foreground">
            Itens excluídos podem ser recuperados por 30 dias
          </p>
        </div>
      </div>

      {deletedItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum item na lixeira
        </div>
      ) : (
        <div className="space-y-3">
          {deletedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <span className="font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Excluído por {item.deletedBy} em {item.deletedAt}
                </p>
                <p className="text-xs text-red-500">
                  Expira em {item.expiresAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onRecover?.(item.id)}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Recuperar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600"
                  onClick={() => onPermanentDelete?.(item.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
