import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Zap, Trophy, Flame, Crown } from 'lucide-react';

// ============= Confetti Effects =============

export function triggerConfetti(type: 'deal' | 'levelUp' | 'achievement' | 'streak' = 'deal') {
  const configs: Record<string, confetti.Options> = {
    deal: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00B37E', '#10B981', '#059669', '#047857'],
    },
    levelUp: {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#8B5CF6', '#A855F7', '#C084FC', '#E879F9'],
      shapes: ['star'],
      scalar: 1.2,
    },
    achievement: {
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
    },
    streak: {
      particleCount: 50,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#EF4444', '#F97316', '#FB923C'],
    },
  };

  confetti(configs[type] || configs.deal);
}

export function triggerFireworks() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

// ============= XP Particle Burst =============

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

export function XPParticleBurst({ 
  isActive, 
  x = 0, 
  y = 0,
  amount = 50,
  onComplete 
}: { 
  isActive: boolean;
  x?: number;
  y?: number;
  amount?: number;
  onComplete?: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const colors = ['#8B5CF6', '#A855F7', '#10B981', '#00B37E', '#F59E0B'];
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x,
      y,
      angle: (i / 20) * Math.PI * 2,
      speed: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isActive, x, y, onComplete]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            x: particle.x + Math.cos(particle.angle) * 100 * particle.speed,
            y: particle.y + Math.sin(particle.angle) * 100 * particle.speed,
            scale: 0,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="fixed pointer-events-none z-50"
          style={{ 
            width: particle.size, 
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
          }}
        />
      ))}
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed pointer-events-none z-50 flex items-center justify-center"
          style={{ left: x - 20, top: y - 20, width: 40, height: 40 }}
        >
          <span className="text-2xl font-bold text-primary">+{amount}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= Level Up Animation =============

export function LevelUpOverlay({ 
  isVisible, 
  newLevel, 
  onClose 
}: { 
  isVisible: boolean;
  newLevel: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      triggerConfetti('levelUp');
      triggerFireworks();
      
      const timeout = setTimeout(onClose, 4000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary via-purple-500 to-primary animate-pulse" />
            
            {/* Main content */}
            <div className="relative glass p-8 rounded-3xl border border-primary/50 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Crown className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              </motion.div>
              
              <h2 className="text-4xl font-display font-bold gradient-text mb-2">
                Level Up!
              </h2>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-6xl font-display font-black text-primary">
                  {newLevel}
                </span>
              </div>
              
              <p className="text-muted-foreground">
                Parabéns! Você alcançou um novo nível!
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 px-6 py-2 rounded-full gradient-primary text-white font-medium"
                onClick={onClose}
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= Streak Fire Animation =============

export function StreakFireBadge({ streakCount }: { streakCount: number }) {
  if (streakCount < 3) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <Flame className="w-4 h-4" />
      </motion.div>
      <span>{streakCount} dias</span>
      
      {/* Fire particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{ left: `${20 + i * 30}%`, bottom: '100%' }}
          animate={{
            y: [-5, -20],
            opacity: [1, 0],
            scale: [1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}

// ============= Achievement Unlock Animation =============

export function AchievementUnlock({ 
  isVisible, 
  achievement,
  onClose 
}: { 
  isVisible: boolean;
  achievement: { title: string; description: string; icon?: string };
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      triggerConfetti('achievement');
      const timeout = setTimeout(onClose, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className="glass p-4 rounded-2xl border border-yellow-500/50 shadow-lg shadow-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-yellow-500 font-medium">Nova Conquista!</p>
                <h4 className="font-display font-bold">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= Floating XP Indicator =============

export function FloatingXP({ 
  amount, 
  x, 
  y,
  onComplete 
}: { 
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.5 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="fixed pointer-events-none z-50 flex items-center gap-1"
      style={{ left: x, top: y }}
    >
      <Zap className="w-4 h-4 text-primary" />
      <span className="font-display font-bold text-primary">+{amount} XP</span>
    </motion.div>
  );
}
