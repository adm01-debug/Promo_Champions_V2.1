import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelUpOverlayProps {
  isVisible: boolean;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  salespersonName: string;
  onComplete?: () => void;
}

export const LevelUpOverlay = forwardRef<HTMLDivElement, LevelUpOverlayProps>(function LevelUpOverlay({
  isVisible,
  level,
  levelTitle,
  levelEmoji,
  salespersonName,
  onComplete,
}, ref) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="relative"
          >
            {/* Glow ring effect */}
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-xp via-coins to-xp opacity-30 blur-2xl animate-pulse" />
            
            {/* Main content */}
            <div className={cn(
              "relative glass-card p-8 rounded-2xl text-center",
              "border-2 border-xp/50 shadow-glow-xp",
              "min-w-[300px]"
            )}>
              {/* Floating stars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -left-4"
              >
                <Star className="h-8 w-8 text-coins animate-bounce" fill="currentColor" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -top-4 -right-4"
              >
                <Star className="h-6 w-6 text-xp animate-bounce" fill="currentColor" style={{ animationDelay: '0.2s' }} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2"
              >
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </motion.div>

              {/* Level up text */}
              <AnimatePresence>
                {showContent && (
                  <>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center gap-2 text-xp mb-2"
                    >
                      <Zap className="h-5 w-5" />
                      <span className="font-display font-bold uppercase tracking-wider">Level Up!</span>
                      <Zap className="h-5 w-5" />
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                      className="text-6xl mb-2"
                    >
                      {levelEmoji}
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="text-4xl font-display font-bold gradient-text mb-1">
                        Nível {level}
                      </div>
                      <div className="text-lg text-muted-foreground font-medium">
                        {levelTitle}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-4 pt-4 border-t border-border/30"
                    >
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4 text-coins" />
                        <span>{salespersonName}</span>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-xs text-muted-foreground mt-4"
                    >
                      Clique para continuar
                    </motion.p>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
LevelUpOverlay.displayName = "LevelUpOverlay";

// Streak milestone overlay
interface StreakMilestoneOverlayProps {
  isVisible: boolean;
  streakDays: number;
  salespersonName: string;
  milestoneTitle?: string;
  milestoneIcon?: string;
  xpReward?: number;
  onComplete?: () => void;
}

export const StreakMilestoneOverlay = forwardRef<HTMLDivElement, StreakMilestoneOverlayProps>(function StreakMilestoneOverlay({
  isVisible,
  streakDays,
  salespersonName,
  milestoneTitle = 'Sequência Incrível!',
  milestoneIcon = '🔥',
  xpReward = 0,
  onComplete,
}, _ref) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onComplete}
        >
          {/* Animated fire particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: '100vh', 
                  x: `${Math.random() * 100}vw`,
                  scale: Math.random() * 0.5 + 0.5 
                }}
                animate={{ 
                  y: '-20vh',
                  x: `${Math.random() * 100}vw`,
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute text-2xl"
                style={{ filter: 'blur(1px)' }}
              >
                {['🔥', '✨', '⭐', '💫'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.5 }}
            className="relative"
          >
            {/* Multi-layer glow effect */}
            <div className="absolute inset-0 -m-16 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 opacity-40 blur-3xl animate-pulse" />
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-300 opacity-30 blur-2xl" />
            
            <div className={cn(
              "relative glass-card p-10 rounded-3xl text-center",
              "border-2 border-orange-500/50 shadow-2xl",
              "min-w-[320px] bg-gradient-to-b from-background/95 to-background/80"
            )}>
              {/* Floating fire emojis */}
              <motion.div
                animate={{ y: [-5, 5, -5], rotate: [-5, 5, -5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-6 -left-6 text-4xl"
              >
                🔥
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5], rotate: [5, -5, 5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="absolute -top-6 -right-6 text-4xl"
              >
                🔥
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-3xl"
              >
                ⭐
              </motion.div>

              <AnimatePresence>
                {showContent && (
                  <>
                    {/* Main icon with pulsing effect */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: [1, 1.15, 1],
                        rotate: 0
                      }}
                      transition={{ 
                        scale: { duration: 0.8, repeat: Infinity, repeatDelay: 0.5 },
                        rotate: { duration: 0.5, type: "spring" }
                      }}
                      className="text-7xl mb-4 drop-shadow-lg"
                    >
                      {milestoneIcon}
                    </motion.div>

                    {/* Title */}
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-3"
                    >
                      <span className="text-2xl font-display font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 bg-clip-text text-transparent uppercase tracking-wider">
                        {milestoneTitle}
                      </span>
                    </motion.div>

                    {/* Streak count with animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                      className="relative mb-2"
                    >
                      <span className="text-6xl font-display font-bold bg-gradient-to-b from-orange-400 to-red-500 bg-clip-text text-transparent">
                        {streakDays}
                      </span>
                      <span className="text-2xl font-bold text-orange-400 ml-2">dias</span>
                    </motion.div>

                    {/* XP reward badge */}
                    {xpReward > 0 && (
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-3"
                      >
                        <Zap className="h-5 w-5 text-amber-400" />
                        <span className="text-lg font-bold text-amber-400">+{xpReward} XP</span>
                      </motion.div>
                    )}

                    {/* Salesperson name */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-center gap-2 text-muted-foreground mt-3"
                    >
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{salespersonName}</span>
                    </motion.div>

                    {/* Continue hint */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 1] }}
                      transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                      className="text-xs text-muted-foreground mt-5"
                    >
                      Clique para continuar
                    </motion.p>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
