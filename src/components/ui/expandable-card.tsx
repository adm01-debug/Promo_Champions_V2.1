import { FC, ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  preview?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'info';
  actions?: ReactNode;
  className?: string;
}

const variantStyles = {
  default: {
    border: 'border-border',
    accent: 'bg-primary',
    bg: 'bg-card',
  },
  success: {
    border: 'border-success/30',
    accent: 'bg-success',
    bg: 'bg-success/5',
  },
  warning: {
    border: 'border-warning/30',
    accent: 'bg-warning',
    bg: 'bg-warning/5',
  },
  info: {
    border: 'border-info/30',
    accent: 'bg-info',
    bg: 'bg-info/5',
  },
};

/**
 * ExpandableCard - Card with expandable content area
 */
export const ExpandableCard: FC<ExpandableCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  preview,
  children,
  defaultExpanded = false,
  variant = 'default',
  actions,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const styles = variantStyles[variant];

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        styles.border,
        styles.bg,
        isExpanded && "shadow-md",
        className
      )}
    >
      {/* Accent bar */}
      <div className={cn("h-1", styles.accent)} />

      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={cn(
          "w-full p-4 flex items-center gap-3 text-left",
          "transition-colors hover:bg-muted/50"
        )}
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Preview (collapsed state) */}
        {!isExpanded && preview && (
          <div className="hidden sm:block flex-shrink-0">
            {preview}
          </div>
        )}

        {/* Expand indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 p-1"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 border-t border-border/50">
              <div className="pt-4">
                {children}
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Quick action variant
interface QuickActionCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  onAction: () => void;
  onDismiss?: () => void;
  actionLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export const QuickActionCard: FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onAction,
  onDismiss,
  actionLabel = 'Executar',
  variant = 'default',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "relative rounded-xl border p-4 overflow-hidden",
        styles.border,
        styles.bg,
        className
      )}
    >
      {/* Accent */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.accent)} />

      <div className="flex items-start gap-3 pl-2">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onAction}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium",
                "bg-primary text-primary-foreground",
                "transition-all hover:bg-primary/90 active:scale-95"
              )}
            >
              {actionLabel}
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Dispensar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
