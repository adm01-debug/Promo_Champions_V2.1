import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Inbox, Search, FileX, Users, ShoppingCart, 
  Calendar, Bell, FolderOpen, Plus 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
    {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick}>
        {action.icon || <Plus className="mr-2 h-4 w-4" />}
        {action.label}
      </Button>
    )}
  </div>
);

export const EmptyInbox: FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<Inbox className="h-16 w-16" />}
    title="Caixa vazia"
    description="Nenhuma mensagem por aqui"
    action={onCreate ? { label: "Nova Mensagem", onClick: onCreate } : undefined}
  />
);

export const EmptySearch: FC<{ query?: string }> = ({ query }) => (
  <EmptyState
    icon={<Search className="h-16 w-16" />}
    title="Nenhum resultado"
    description={query ? `Não encontramos resultados para "${query}"` : "Tente ajustar sua busca"}
  />
);

export const EmptyFile: FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <EmptyState
    icon={<FileX className="h-16 w-16" />}
    title="Sem arquivos"
    description="Nenhum arquivo foi enviado ainda"
    action={onUpload ? { label: "Enviar Arquivo", onClick: onUpload } : undefined}
  />
);

export const EmptyUsers: FC<{ onInvite?: () => void }> = ({ onInvite }) => (
  <EmptyState
    icon={<Users className="h-16 w-16" />}
    title="Sem usuários"
    description="Convide membros para sua equipe"
    action={onInvite ? { label: "Convidar", onClick: onInvite } : undefined}
  />
);

export const EmptyCart: FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={<ShoppingCart className="h-16 w-16" />}
    title="Carrinho vazio"
    description="Adicione produtos ao seu carrinho"
    action={onBrowse ? { label: "Ver Produtos", onClick: onBrowse } : undefined}
  />
);

export const EmptyCalendar: FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<Calendar className="h-16 w-16" />}
    title="Sem eventos"
    description="Nenhum evento agendado"
    action={onCreate ? { label: "Criar Evento", onClick: onCreate } : undefined}
  />
);

export const EmptyNotifications: FC = () => (
  <EmptyState
    icon={<Bell className="h-16 w-16" />}
    title="Sem notificações"
    description="Você está em dia!"
  />
);

export const EmptyFolder: FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<FolderOpen className="h-16 w-16" />}
    title="Pasta vazia"
    description="Nenhum item nesta pasta"
    action={onCreate ? { label: "Adicionar Item", onClick: onCreate } : undefined}
  />
);
