import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FileQuestion, 
  Inbox, 
  Users, 
  ShoppingCart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 'search' | 'data' | 'inbox' | 'users' | 'cart' | 'chart' | 'calendar' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const typeIcons = {
  search: Search,
  data: FileQuestion,
  inbox: Inbox,
  users: Users,
  cart: ShoppingCart,
  chart: BarChart3,
  calendar: Calendar,
  custom: FileQuestion
};

const typeColors = {
  search: 'from-blue-500/20 to-cyan-500/20',
  data: 'from-purple-500/20 to-pink-500/20',
  inbox: 'from-green-500/20 to-emerald-500/20',
  users: 'from-orange-500/20 to-red-500/20',
  cart: 'from-amber-500/20 to-yellow-500/20',
  chart: 'from-indigo-500/20 to-blue-500/20',
  calendar: 'from-rose-500/20 to-pink-500/20',
  custom: 'from-gray-500/20 to-gray-400/20'
};

export const EmptyState: FC<EmptyStateProps> = ({
  type = 'data',
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'md',
  className
}) => {
  const Icon = typeIcons[type];

  const sizeClasses = {
    sm: { container: 'py-8', icon: 'w-12 h-12', iconInner: 'h-6 w-6', title: 'text-base', desc: 'text-xs' },
    md: { container: 'py-12', icon: 'w-20 h-20', iconInner: 'h-10 w-10', title: 'text-lg', desc: 'text-sm' },
    lg: { container: 'py-16', icon: 'w-28 h-28', iconInner: 'h-14 w-14', title: 'text-xl', desc: 'text-base' }
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration || (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={cn(
            "rounded-full flex items-center justify-center mb-6 bg-gradient-to-br",
            typeColors[type],
            sizes.icon
          )}
        >
          <motion.div
            animate={{ 
              y: [0, -4, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Icon className={cn("text-muted-foreground", sizes.iconInner)} />
          </motion.div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn("font-semibold text-foreground mb-2", sizes.title)}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn("text-muted-foreground max-w-sm mb-6", sizes.desc)}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
