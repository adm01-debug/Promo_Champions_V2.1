import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox, Search, FileX, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-14 h-14',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-20 h-20',
    title: 'text-xl',
    description: 'text-base',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  animated = true,
}) => {
  const sizes = sizeClasses[size];
  const Wrapper = animated ? motion.div : 'div';

  return (
    <Wrapper
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
      {...(animated && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      })}
    >
      <motion.div
        className={cn(
          'rounded-full bg-muted p-4 mb-4',
          sizes.icon
        )}
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Icon className="w-full h-full text-muted-foreground" />
      </motion.div>

      <h3 className={cn('font-semibold text-foreground mb-1', sizes.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn('text-muted-foreground max-w-sm mb-4', sizes.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex gap-2 mt-2">
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </Wrapper>
  );
};

// Preset empty states
export const NoResultsEmpty: React.FC<{
  searchTerm?: string;
  onClear?: () => void;
}> = ({ searchTerm, onClear }) => (
  <EmptyState
    icon={Search}
    title="Nenhum resultado encontrado"
    description={
      searchTerm
        ? `Não encontramos resultados para "${searchTerm}"`
        : 'Tente ajustar os filtros de busca'
    }
    action={onClear ? { label: 'Limpar busca', onClick: onClear, variant: 'outline' } : undefined}
  />
);

export const NoDataEmpty: React.FC<{
  entityName?: string;
  onCreate?: () => void;
}> = ({ entityName = 'itens', onCreate }) => (
  <EmptyState
    icon={FileX}
    title={`Nenhum ${entityName} ainda`}
    description={`Comece criando seu primeiro ${entityName}`}
    action={onCreate ? { label: `Criar ${entityName}`, onClick: onCreate } : undefined}
  />
);

export const NoUsersEmpty: React.FC<{
  onInvite?: () => void;
}> = ({ onInvite }) => (
  <EmptyState
    icon={Users}
    title="Nenhum usuário encontrado"
    description="Convide membros para sua equipe"
    action={onInvite ? { label: 'Convidar usuário', onClick: onInvite } : undefined}
  />
);

export const NoProductsEmpty: React.FC<{
  onCreate?: () => void;
}> = ({ onCreate }) => (
  <EmptyState
    icon={Package}
    title="Nenhum produto cadastrado"
    description="Adicione produtos ao seu catálogo"
    action={onCreate ? { label: 'Adicionar produto', onClick: onCreate } : undefined}
  />
);
