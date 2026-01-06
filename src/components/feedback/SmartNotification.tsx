import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Sparkles,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'milestone';

interface SmartNotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  show: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
  className?: string;
}

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-green-500/10 border-green-500/30',
    iconClass: 'text-green-500',
    glowClass: 'shadow-green-500/20'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-red-500/10 border-red-500/30',
    iconClass: 'text-red-500',
    glowClass: 'shadow-red-500/20'
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-500/10 border-amber-500/30',
    iconClass: 'text-amber-500',
    glowClass: 'shadow-amber-500/20'
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    iconClass: 'text-blue-500',
    glowClass: 'shadow-blue-500/20'
  },
  achievement: {
    icon: Trophy,
    bgClass: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30',
    iconClass: 'text-amber-500',
    glowClass: 'shadow-amber-500/30'
  },
  milestone: {
    icon: TrendingUp,
    bgClass: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30',
    iconClass: 'text-purple-500',
    glowClass: 'shadow-purple-500/30'
  }
};

export const SmartNotification: FC<SmartNotificationProps> = ({
  type,
  title,
  message,
  show,
  onClose,
  action,
  autoClose = 5000,
  className
}) => {
  const config = notificationConfig[type];
  const Icon = config.icon;

  // Auto close
  if (show && autoClose > 0) {
    setTimeout(onClose, autoClose);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg",
            config.bgClass,
            config.glowClass,
            className
          )}
        >
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
            className={cn("flex-shrink-0 mt-0.5", config.iconClass)}
          >
            <Icon className="h-5 w-5" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="font-semibold text-foreground"
            >
              {title}
            </motion.h4>
            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground mt-0.5"
              >
                {message}
              </motion.p>
            )}
            {action && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                {action.label}
              </motion.button>
            )}
          </div>

          {/* Sparkles for special types */}
          {(type === 'achievement' || type === 'milestone') && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
            </motion.div>
          )}

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </motion.button>

          {/* Progress bar for auto-close */}
          {autoClose > 0 && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoClose / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-30 origin-left rounded-b-xl"
              style={{ color: config.iconClass.replace('text-', '') }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
