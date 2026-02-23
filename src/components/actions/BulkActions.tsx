// @ts-nocheck
import { FC, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Archive, Tag, Share2, Download, 
  MoreHorizontal, X, CheckSquare, Square,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BulkAction {
  id: string;
  label: string;
  icon: FC<{ className?: string }>;
  variant?: 'default' | 'destructive';
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

interface BulkActionsProps {
  selectedIds: string[];
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAction: (actionId: string, selectedIds: string[]) => Promise<void>;
  actions?: BulkAction[];
  className?: string;
}

const defaultActions: BulkAction[] = [
  { id: 'delete', label: 'Excluir', icon: Trash2, variant: 'destructive', requireConfirmation: true },
  { id: 'archive', label: 'Arquivar', icon: Archive },
  { id: 'tag', label: 'Adicionar tag', icon: Tag },
  { id: 'share', label: 'Compartilhar', icon: Share2 },
  { id: 'export', label: 'Exportar', icon: Download },
];

export const BulkActions: FC<BulkActionsProps> = ({
  selectedIds,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onAction,
  actions = defaultActions,
  className,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  const hasSelection = selectedIds.length > 0;
  const isAllSelected = selectedIds.length === totalItems && totalItems > 0;
  const isPartiallySelected = hasSelection && !isAllSelected;

  const handleAction = useCallback(async (action: BulkAction) => {
    if (action.requireConfirmation && confirmingAction !== action.id) {
      setConfirmingAction(action.id);
      return;
    }

    setLoadingAction(action.id);
    setConfirmingAction(null);

    try {
      await onAction(action.id, selectedIds);
    } finally {
      setLoadingAction(null);
    }
  }, [selectedIds, onAction, confirmingAction]);

  const cancelConfirmation = useCallback(() => {
    setConfirmingAction(null);
  }, []);

  const primaryActions = useMemo(() => actions.slice(0, 3), [actions]);
  const moreActions = useMemo(() => actions.slice(3), [actions]);

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'bg-background border rounded-xl shadow-2xl',
            'flex items-center gap-2 p-3',
            className
          )}
        >
          {/* Selection toggle */}
          <div className="flex items-center gap-2 pr-3 border-r">
            <Button
              variant="ghost"
              size="sm"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="h-8 gap-2"
            >
              {isAllSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : isPartiallySelected ? (
                <div className="h-4 w-4 rounded border-2 border-primary bg-primary/30" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="font-medium">
                {selectedIds.length} de {totalItems}
              </span>
            </Button>
          </div>

          {/* Primary actions */}
          <div className="flex items-center gap-1">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              const isLoading = loadingAction === action.id;
              const isConfirming = confirmingAction === action.id;

              if (isConfirming) {
                return (
                  <motion.div
                    key={action.id}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(action)}
                      className="h-8"
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelConfirmation}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              }

              return (
                <Button
                  key={action.id}
                  variant={action.variant === 'destructive' ? 'ghost' : 'ghost'}
                  size="sm"
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className={cn(
                    'h-8 gap-2',
                    action.variant === 'destructive' && 'text-destructive hover:text-destructive hover:bg-destructive/10'
                  )}
                >
                  {isLoading ? (
                    <motion.div
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              );
            })}
          </div>

          {/* More actions dropdown */}
          {moreActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {moreActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.id}>
                      {index === 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => handleAction(action)}
                        className={cn(
                          action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                        )}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeselectAll}
            className="h-8 w-8 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
