import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Star,
  Zap,
  Crown,
  Flame,
  Target,
  Medal,
  Sparkles,
  PartyPopper,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CelebrationType = 
  | "level-up"
  | "achievement"
  | "streak"
  | "goal-completed"
  | "sale-closed"
  | "rank-up"
  | "challenge-completed"
  | "milestone";

interface EnhancedCelebrationProps {
  type: CelebrationType;
  title: string;
  subtitle?: string;
  value?: string | number;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const celebrationConfigs: Record<CelebrationType, {
  icon: typeof Trophy;
  gradient: string;
  glowColor: string;
  confettiColors: string[];
  sound?: string;
}> = {
  "level-up": {
    icon: Zap,
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    glowColor: "shadow-amber-500/50",
    confettiColors: ["#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"],
  },
  "achievement": {
    icon: Trophy,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glowColor: "shadow-purple-500/50",
    confettiColors: ["#8b5cf6", "#a855f7", "#c084fc", "#e879f9"],
  },
  "streak": {
    icon: Flame,
    gradient: "from-orange-500 via-red-500 to-rose-500",
    glowColor: "shadow-red-500/50",
    confettiColors: ["#f97316", "#ef4444", "#f43f5e", "#fb7185"],
  },
  "goal-completed": {
    icon: Target,
    gradient: "from-emerald-400 via-green-500 to-teal-500",
    glowColor: "shadow-green-500/50",
    confettiColors: ["#10b981", "#22c55e", "#14b8a6", "#6ee7b7"],
  },
  "sale-closed": {
    icon: PartyPopper,
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    glowColor: "shadow-emerald-500/50",
    confettiColors: ["#10b981", "#34d399", "#5eead4", "#a7f3d0"],
  },
  "rank-up": {
    icon: Crown,
    gradient: "from-yellow-300 via-amber-400 to-yellow-500",
    glowColor: "shadow-yellow-500/50",
    confettiColors: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef08a"],
  },
  "challenge-completed": {
    icon: Star,
    gradient: "from-blue-400 via-indigo-500 to-purple-500",
    glowColor: "shadow-indigo-500/50",
    confettiColors: ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa"],
  },
  "milestone": {
    icon: Rocket,
    gradient: "from-pink-400 via-rose-500 to-red-500",
    glowColor: "shadow-rose-500/50",
    confettiColors: ["#ec4899", "#f43f5e", "#fb7185", "#fda4af"],
  },
};

export function EnhancedCelebration({
  type,
  title,
  subtitle,
  value,
  isOpen,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000,
}: EnhancedCelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const config = celebrationConfigs[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: config.confettiColors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: config.confettiColors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Big burst at start
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: config.confettiColors,
      });

      // Delay content animation
      setTimeout(() => setShowContent(true), 200);

      // Auto close
      if (autoClose) {
        const timer = setTimeout(onClose, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setShowContent(false);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, config.confettiColors]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect behind */}
            <div 
              className={cn(
                "absolute inset-0 rounded-3xl blur-3xl opacity-50",
                `bg-gradient-to-r ${config.gradient}`
              )} 
            />

            {/* Main card */}
            <div className={cn(
              "relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 text-center",
              "border border-white/10 shadow-2xl",
              config.glowColor
            )}>
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                  "mx-auto mb-6 h-24 w-24 rounded-full flex items-center justify-center",
                  `bg-gradient-to-br ${config.gradient}`,
                  "shadow-lg"
                )}
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>

              {/* Sparkles around icon */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-8 left-1/2 -translate-x-1/2"
              >
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -left-16 animate-pulse" />
                <Sparkles className="h-4 w-4 text-yellow-300 absolute top-0 -right-14 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-4 right-8 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </motion.div>

              {/* Title with gradient */}
              <AnimatePresence>
                {showContent && (
                  <>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={cn(
                        "text-3xl font-bold mb-2 bg-clip-text text-transparent",
                        `bg-gradient-to-r ${config.gradient}`
                      )}
                    >
                      {title}
                    </motion.h2>

                    {subtitle && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-muted-foreground mb-4"
                      >
                        {subtitle}
                      </motion.p>
                    )}

                    {value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className={cn(
                          "inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6",
                          `bg-gradient-to-r ${config.gradient}`,
                          "text-white font-bold text-2xl shadow-lg"
                        )}
                      >
                        {type === "level-up" && <Zap className="h-6 w-6" />}
                        {type === "streak" && <Flame className="h-6 w-6" />}
                        {type === "goal-completed" && <Target className="h-6 w-6" />}
                        {value}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={onClose}
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Continuar
                      </Button>
                    </motion.div>
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

// Hook for triggering celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    type: CelebrationType;
    title: string;
    subtitle?: string;
    value?: string | number;
  } | null>(null);

  const celebrate = (
    type: CelebrationType,
    title: string,
    options?: { subtitle?: string; value?: string | number }
  ) => {
    setCelebration({
      type,
      title,
      subtitle: options?.subtitle,
      value: options?.value,
    });
  };

  const closeCelebration = () => {
    setCelebration(null);
  };

  return {
    celebration,
    celebrate,
    closeCelebration,
    isOpen: celebration !== null,
  };
}
