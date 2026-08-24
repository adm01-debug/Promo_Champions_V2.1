import React, { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, FileX, Users, DollarSign, Search, Inbox, Target, Zap, Bell, Calendar, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'generic'
  | 'search'
  | 'data'
  | 'clients'
  | 'sales'
  | 'goals'
  | 'activities'
  | 'notifications'
  | 'tasks'
  | 'deals'
  | 'inbox'
  | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode | LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const presets: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string; color: string }> = {
  generic: {
    icon: Inbox,
    title: 'Nenhum item encontrado',
    description: 'Não há dados para exibir no momento.',
    color: 'text-muted-foreground'
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado',
    description: 'Tente ajustar os filtros ou termos de busca.',
    color: 'text-info'
  },
  data: {
    icon: FileX,
    title: 'Sem dados disponíveis',
    description: 'Não há dados para exibir. Verifique seus filtros ou tente novamente.',
    color: 'text-primary'
  },
  clients: {
    icon: Users,
    title: 'Nenhum cliente',
    description: 'Adicione seu primeiro cliente para começar a vender!',
    color: 'text-success'
  },
  sales: {
    icon: ShoppingCart,
    title: 'Nenhuma venda',
    description: 'Suas vendas aparecerão aqui. Que tal prospectar novos clientes?',
    color: 'text-primary'
  },
  goals: {
    icon: Target,
    title: 'Sem metas definidas',
    description: 'Defina suas metas para acompanhar seu progresso.',
    color: 'text-streak'
  },
  activities: {
    icon: Zap,
    title: 'Nenhuma atividade',
    description: 'Registre suas atividades para ganhar XP e subir no ranking!',
    color: 'text-warning'
  },
  notifications: {
    icon: Bell,
    title: 'Tudo em dia!',
    description: 'Você não tem novas notificações.',
    color: 'text-info'
  },
  tasks: {
    icon: Calendar,
    title: 'Sem tarefas pendentes',
    description: 'Ótimo trabalho! Você está em dia com suas tarefas.',
    color: 'text-success'
  },
  deals: {
    icon: DollarSign,
    title: 'Nenhum deal encontrado',
    description: 'Comece criando seu primeiro deal e acompanhe suas oportunidades.',
    color: 'text-primary'
  },
  inbox: {
    icon: Inbox,
    title: 'Caixa de entrada vazia',
    description: 'Parabéns! Você está em dia com todas as suas tarefas.',
    color: 'text-success'
  },
  custom: {
    icon: Inbox,
    title: '',
    description: '',
    color: 'text-muted-foreground'
  }
};

export const EmptyState: FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  icon,
  action,
  secondaryAction,
  illustration,
  className,
  size = 'md'
}) => {
  const preset = presets[type];
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;

  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'h-10 w-10',
      iconContainer: 'h-16 w-16',
      title: 'text-base',
      description: 'text-xs',
      buttonSize: 'sm' as const
    },
    md: {
      container: 'py-12 px-6',
      icon: 'h-12 w-12',
      iconContainer: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
      buttonSize: 'default' as const
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'h-16 w-16',
      iconContainer: 'h-24 w-24',
      title: 'text-xl',
      description: 'text-base',
      buttonSize: 'lg' as const
    }
  };

  const s = sizeClasses[size];

  // Handle both ReactNode icon and LucideIcon
  const renderIcon = () => {
    if (illustration) return illustration;
    
    if (icon) {
      // If icon is a React element (passed as <Icon />)
      if (React.isValidElement(icon)) {
        return icon;
      }
      // If icon is a LucideIcon component
      const IconComponent = icon as LucideIcon;
      return <IconComponent className={cn(s.icon, preset.color)} strokeWidth={1.5} />;
    }
    
    const PresetIcon = preset.icon;
    return <PresetIcon className={cn(s.icon, preset.color)} strokeWidth={1.5} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        s.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'rounded-full bg-muted/50 flex items-center justify-center mb-4',
          s.iconContainer
        )}
      >
        {renderIcon()}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn('font-semibold text-foreground mb-2', s.title)}
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn('text-muted-foreground max-w-sm mb-6', s.description)}
      >
        {displayDescription}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3"
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={s.buttonSize}
              className="gap-2"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={s.buttonSize}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Legacy exports for backward compatibility
export const NoDeals: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    type="deals"
    action={onCreate ? { label: 'Criar Deal', onClick: onCreate } : undefined}
  />
);

export const NoClients: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    type="clients"
    action={onCreate ? { label: 'Adicionar Cliente', onClick: onCreate } : undefined}
  />
);

export const NoActivities: React.FC = () => (
  <EmptyState type="activities" />
);

export const NoSearchResults: React.FC<{ onClear?: () => void }> = ({ onClear }) => (
  <EmptyState
    type="search"
    action={onClear ? { label: 'Limpar Filtros', onClick: onClear, variant: 'outline' } : undefined}
  />
);

export const EmptyInbox: React.FC = () => (
  <EmptyState type="inbox" />
);

export const NoData: React.FC = () => (
  <EmptyState type="data" />
);

// New exports for more specific use cases
export const EmptyClients: FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState
    type="clients"
    action={{ label: 'Adicionar Cliente', onClick: onAdd }}
  />
);

export const EmptySales: FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState
    type="sales"
    action={{ label: 'Nova Venda', onClick: onAdd }}
  />
);

export const EmptySearch: FC<{ onClear: () => void }> = ({ onClear }) => (
  <EmptyState
    type="search"
    action={{ label: 'Limpar Filtros', onClick: onClear, variant: 'outline' }}
  />
);

export const EmptyActivities: FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <EmptyState
    type="activities"
    action={{ label: 'Registrar Atividade', onClick: onAdd }}
  />
);

export const EmptyNotifications: FC = () => (
  <EmptyState type="notifications" size="sm" />
);

export const EmptyTasks: FC = () => (
  <EmptyState type="tasks" />
);
