import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  side?: 'left' | 'right';
}

export const SlideOverPanel: FC<SlideOverPanelProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  width = 'md',
  side = 'right'
}) => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 flex flex-col w-full bg-background border-border shadow-xl',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              widths[width]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon" aria-label="Fechar"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Collapsible sidebar variant
interface CollapsibleSidebarProps {
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  collapsedContent?: ReactNode;
  width?: number;
  collapsedWidth?: number;
  side?: 'left' | 'right';
  className?: string;
}

export const CollapsibleSidebar: FC<CollapsibleSidebarProps> = ({
  expanded,
  onToggle,
  children,
  collapsedContent,
  width = 280,
  collapsedWidth = 64,
  side = 'left',
  className
}) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? width : collapsedWidth }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        'relative flex flex-col border-border bg-card overflow-hidden',
        side === 'left' ? 'border-r' : 'border-l',
        className
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={expanded ? "Fechar painel" : "Abrir painel"}
        className={cn(
          'absolute top-3 z-10 h-6 w-6',
          side === 'left' ? 'right-2' : 'left-2'
        )}
      >
        <motion.span
          animate={{ rotate: expanded ? (side === 'left' ? 180 : 0) : (side === 'left' ? 0 : 180) }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.span>
      </Button>

      {/* Content */}
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center pt-12"
          >
            {collapsedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
