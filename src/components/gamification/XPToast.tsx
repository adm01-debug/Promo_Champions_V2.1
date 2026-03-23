import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface XPNotification {
  id: string;
  amount: number;
  reason: string;
  type?: 'xp' | 'streak' | 'level_up';
}

interface XPToastContextType {
  showXP: (amount: number, reason: string, type?: 'xp' | 'streak' | 'level_up') => void;
}

const XPToastContext = createContext<XPToastContextType | undefined>(undefined);

export function useXPToast() {
  const context = useContext(XPToastContext);
  if (!context) {
    throw new Error('useXPToast must be used within XPToastProvider');
  }
  return context;
}

export function XPToastProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const showXP = useCallback((amount: number, reason: string, type: 'xp' | 'streak' | 'level_up' = 'xp') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, amount, reason, type }]);

    // Auto-remove after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  return (
    <XPToastContext.Provider value={{ showXP }}>
      {children}
      <XPToastContainer notifications={notifications} />
    </XPToastContext.Provider>
  );
}

function XPToastContainer({ notifications }: { notifications: XPNotification[] }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <XPToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XPToastItem({ notification }: { notification: XPNotification }) {
  const { amount, reason, type } = notification;

  const bgColor = type === 'level_up' 
    ? 'from-yellow-500/90 to-amber-600/90' 
    : type === 'streak' 
      ? 'from-orange-500/90 to-red-500/90'
      : 'from-primary/90 to-primary/70';

  const Icon = type === 'level_up' ? TrendingUp : type === 'streak' ? Zap : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`bg-gradient-to-r ${bgColor} backdrop-blur-md rounded-lg shadow-lg px-4 py-3 min-w-[200px] pointer-events-auto`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-2xl font-bold text-white">+{amount}</span>
            <span className="text-sm font-medium text-white/80">XP</span>
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-white/70 truncate max-w-[150px]"
          >
            {reason}
          </motion.p>
        </div>

        {/* Sparkle particles */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: '50%', 
                y: '50%', 
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 0.8,
                delay: 0.1 + i * 0.05,
                ease: 'easeOut'
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
