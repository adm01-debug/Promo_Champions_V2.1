import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Action button with loading state
interface ActionButtonProps {
  onClick: () => void | Promise<void>;
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'sm',
  loading = false,
  disabled = false,
  className,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    const result = onClick();
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const actualLoading = loading || isLoading;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant={variant}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={handleClick}
        disabled={disabled || actualLoading}
        className={cn('gap-2', className)}
      >
        {actualLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {label}
      </Button>
    </motion.div>
  );
};

// Copy button with success feedback
interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copiar',
  successLabel = 'Copiado!',
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn('gap-2', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          {successLabel}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
};

// Quick actions dropdown
interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  trigger?: React.ReactNode;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  trigger,
  className,
}) => {
  const defaultActions = actions.filter((a) => a.variant !== 'destructive');
  const destructiveActions = actions.filter((a) => a.variant === 'destructive');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {defaultActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className="gap-2"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
        {destructiveActions.length > 0 && defaultActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className="gap-2 text-red-500 focus:text-red-500"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Common action presets
export const EditAction = (onClick: () => void): QuickAction => ({
  label: 'Editar',
  icon: Pencil,
  onClick,
});

export const DeleteAction = (onClick: () => void): QuickAction => ({
  label: 'Excluir',
  icon: Trash2,
  onClick,
  variant: 'destructive',
});

export const CopyAction = (text: string): QuickAction => ({
  label: 'Copiar',
  icon: Copy,
  onClick: () => navigator.clipboard.writeText(text),
});

export const OpenAction = (url: string): QuickAction => ({
  label: 'Abrir',
  icon: ExternalLink,
  onClick: () => window.open(url, '_blank'),
});
