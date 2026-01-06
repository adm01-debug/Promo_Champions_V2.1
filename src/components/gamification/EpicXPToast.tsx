import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Flame, Star, Crown, Trophy } from 'lucide-react';
import { useState, useEffect, createContext, useContext, useCallback, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';

interface XPNotification {
  id: string;
  amount: number;
  reason: string;
  type: 'xp' | 'streak' | 'level_up' | 'achievement' | 'bonus';
  multiplier?: number;
}

interface EpicXPToastContextType {
  showXP: (amount: number, reason: string, type?: XPNotification['type'], multiplier?: number) => void;
  showLevelUp: (newLevel: number) => void;
  showStreak: (days: number, xp: number) => void;
  showAchievement: (title: string, xp: number) => void;
}

const EpicXPToastContext = createContext<EpicXPToastContextType | undefined>(undefined);

export function useEpicXPToast() {
  const context = useContext(EpicXPToastContext);
  if (!context) {
    throw new Error('useEpicXPToast must be used within EpicXPToastProvider');
  }
  return context;
}

export function EpicXPToastProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);
  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; level: number } | null>(null);

  const showXP = useCallback((
    amount: number, 
    reason: string, 
    type: XPNotification['type'] = 'xp',
    multiplier?: number
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, amount, reason, type, multiplier }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const showLevelUp = useCallback((newLevel: number) => {
    setLevelUpModal({ show: true, level: newLevel });
    
    // Epic confetti burst
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setTimeout(() => setLevelUpModal(null), 5000);
  }, []);

  const showStreak = useCallback((days: number, xp: number) => {
    showXP(xp, `🔥 ${days} dias de streak!`, 'streak');
  }, [showXP]);

  const showAchievement = useCallback((title: string, xp: number) => {
    showXP(xp, title, 'achievement');
    
    // Achievement confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [showXP]);

  return (
    <EpicXPToastContext.Provider value={{ showXP, showLevelUp, showStreak, showAchievement }}>
      {children}
      <EpicXPToastContainer notifications={notifications} />
      <AnimatePresence>
        {levelUpModal?.show && (
          <LevelUpCelebration level={levelUpModal.level} onClose={() => setLevelUpModal(null)} />
        )}
      </AnimatePresence>
    </EpicXPToastContext.Provider>
  );
}

function EpicXPToastContainer({ notifications }: { notifications: XPNotification[] }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <EpicXPToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function EpicXPToastItem({ notification }: { notification: XPNotification }) {
  const { amount, reason, type, multiplier } = notification;
  const [displayAmount, setDisplayAmount] = useState(0);
  const finalAmount = multiplier ? amount * multiplier : amount;

  // Animate counting
  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = finalAmount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalAmount) {
        setDisplayAmount(finalAmount);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [finalAmount]);

  const configs = {
    xp: {
      gradient: 'from-primary/95 via-primary/85 to-primary/70',
      icon: Sparkles,
      glow: 'shadow-primary/30'
    },
    streak: {
      gradient: 'from-orange-500/95 via-red-500/90 to-amber-500/85',
      icon: Flame,
      glow: 'shadow-orange-500/30'
    },
    level_up: {
      gradient: 'from-yellow-400/95 via-amber-500/90 to-orange-500/85',
      icon: Crown,
      glow: 'shadow-yellow-500/30'
    },
    achievement: {
      gradient: 'from-purple-500/95 via-pink-500/90 to-rose-500/85',
      icon: Trophy,
      glow: 'shadow-purple-500/30'
    },
    bonus: {
      gradient: 'from-emerald-500/95 via-green-500/90 to-teal-500/85',
      icon: Star,
      glow: 'shadow-emerald-500/30'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 120, scale: 0.6, rotateY: -30 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, x: 120, scale: 0.6, rotateY: 30 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative bg-gradient-to-r ${config.gradient} backdrop-blur-xl rounded-xl shadow-2xl ${config.glow} px-5 py-4 min-w-[240px] pointer-events-auto overflow-hidden`}
    >
      {/* Animated background shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
      />

      <div className="relative flex items-center gap-4">
        {/* Animated icon */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
          className="relative"
        >
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-white/40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        <div className="flex-1">
          {/* XP amount with counting animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-3xl font-black text-white tracking-tight">
              +{displayAmount}
            </span>
            <span className="text-sm font-bold text-white/80">XP</span>
            {multiplier && multiplier > 1 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-xs font-bold text-yellow-200 bg-yellow-500/30 px-2 py-0.5 rounded-full"
              >
                x{multiplier}
              </motion.span>
            )}
          </motion.div>
          
          {/* Reason */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/75 truncate max-w-[180px] font-medium"
          >
            {reason}
          </motion.p>
        </div>
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: '50%', 
              y: '50%', 
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              x: `${Math.random() * 120 - 10}%`, 
              y: `${Math.random() * 120 - 10}%`,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 1,
              delay: 0.1 + i * 0.06,
              ease: 'easeOut'
            }}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
          />
        ))}
      </div>

      {/* Streak flames for streak type */}
      {type === 'streak' && (
        <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scaleY: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 0.5,
                delay: i * 0.1,
                repeat: Infinity
              }}
              className="w-3 h-6 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LevelUpCelebration({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-3xl blur-3xl opacity-50 scale-150" />
        
        <div className="relative bg-gradient-to-br from-yellow-400/90 via-amber-500/90 to-orange-500/90 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl">
          {/* Crown */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Crown className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
          </motion.div>

          {/* Level up text */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <h2 className="text-xl font-bold text-white/90 mb-2">PARABÉNS!</h2>
            <p className="text-5xl font-black text-white mb-2">NÍVEL {level}</p>
            <p className="text-white/80 font-medium">Você subiu de nível! 🎉</p>
          </motion.div>

          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.5 + i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Star className="w-4 h-4 text-white fill-white" />
              </motion.div>
            ))}
          </div>

          {/* Close button hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-sm text-white/60"
          >
            Clique para continuar
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
