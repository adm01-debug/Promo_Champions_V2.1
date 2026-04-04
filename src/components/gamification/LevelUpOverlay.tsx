import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export { StreakMilestoneOverlay } from "./StreakMilestoneOverlay";

interface LevelUpOverlayProps {
  isVisible: boolean;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  salespersonName: string;
  onComplete?: () => void;
}

export function LevelUpOverlay({
  isVisible, level, levelTitle, levelEmoji, salespersonName, onComplete,
}: LevelUpOverlayProps) {
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
      const timer = setTimeout(() => onComplete(), 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-xp via-coins to-xp opacity-30 blur-2xl animate-pulse" />
            
            <div className={cn("relative glass-card p-8 rounded-2xl text-center", "border-2 border-xp/50 shadow-glow-xp", "min-w-[300px]")}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute -top-4 -left-4">
                <Star className="h-8 w-8 text-coins animate-bounce" fill="currentColor" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="absolute -top-4 -right-4">
                <Star className="h-6 w-6 text-xp animate-bounce" fill="currentColor" style={{ animationDelay: '0.2s' }} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </motion.div>

              <AnimatePresence>
                {showContent && (
                  <>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 text-xp mb-2">
                      <Zap className="h-5 w-5" /><span className="font-display font-bold uppercase tracking-wider">Level Up!</span><Zap className="h-5 w-5" />
                    </motion.div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", bounce: 0.5 }} className="text-6xl mb-2">{levelEmoji}</motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                      <div className="text-4xl font-display font-bold gradient-text mb-1">Nível {level}</div>
                      <div className="text-lg text-muted-foreground font-medium">{levelTitle}</div>
                    </motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 pt-4 border-t border-border/30">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4 text-coins" /><span>{salespersonName}</span>
                      </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-xs text-muted-foreground mt-4">Clique para continuar</motion.p>
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
