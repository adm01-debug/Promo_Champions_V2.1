import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Zap, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  previousLevel: number;
  newLevel: number;
  rewards?: {
    xp?: number;
    coins?: number;
    title?: string;
    badge?: string;
  };
}

export const LevelUpCelebration: FC<LevelUpCelebrationProps> = ({
  isOpen,
  onClose,
  previousLevel,
  newLevel,
  rewards,
}) => {
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
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] max-w-sm rounded-2xl border border-rank-gold/30 bg-gradient-to-b from-background via-background to-rank-gold/5 p-8 shadow-2xl text-center overflow-hidden"
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rank-gold/20 rounded-full blur-3xl pointer-events-none" />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-rank-gold to-yellow-500 flex items-center justify-center shadow-lg"
            >
              <Crown className="h-10 w-10 text-black" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black mb-1"
            >
              Level Up! 🎉
            </motion.h2>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm mb-6"
            >
              Nível {previousLevel} → <span className="text-rank-gold font-bold">Nível {newLevel}</span>
            </motion.p>

            {/* Rewards */}
            {rewards && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 mb-6"
              >
                {rewards.xp && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-info" />
                    <span>+{rewards.xp} XP</span>
                  </div>
                )}
                {rewards.coins && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-warning" />
                    <span>+{rewards.coins} Moedas</span>
                  </div>
                )}
                {rewards.title && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>Título: {rewards.title}</span>
                  </div>
                )}
                {rewards.badge && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-lg">{rewards.badge}</span>
                  </div>
                )}
              </motion.div>
            )}

            <Button onClick={onClose} className="w-full bg-gradient-to-r from-rank-gold to-yellow-500 text-black font-bold hover:from-rank-gold hover:to-yellow-600">
              Continuar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
