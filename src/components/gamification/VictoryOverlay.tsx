import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, PartyPopper, Zap, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';

interface VictoryOverlayProps {
  isVisible: boolean;
  title: string;
  description: string;
  eventType: 'sale' | 'achievement' | 'streak' | 'level_up';
  value?: number;
  salespersonName: string;
  onComplete?: () => void;
}

export function VictoryOverlay({
  isVisible, title, description, eventType, value, salespersonName, onComplete,
}: VictoryOverlayProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 300);
      
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500'],
      });

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(() => onComplete(), 6000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const icons: Record<string, any> = {
    sale: Trophy,
    achievement: Star,
    streak: PartyPopper,
    level_up: Zap,
  };

  const Icon = icons[eventType] || Trophy;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
          >
            <div className="absolute inset-0 -m-12 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 blur-3xl animate-pulse" />
            
            <div className={cn(
              "relative glass p-8 rounded-[2.5rem] text-center border-2 border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.3)]",
              "min-w-[320px] max-w-sm overflow-hidden"
            )}>
              {/* Decorative elements */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute top-4 left-4">
                <Sparkles className="h-6 w-6 text-rank-gold animate-pulse" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="absolute bottom-4 right-4">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </motion.div>

              <AnimatePresence>
                {showContent && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                      className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 border-2 border-primary/30 shadow-2xl"
                    >
                      <Icon className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter gradient-text leading-tight mb-2">
                        {title}
                      </h2>
                      <p className="text-base font-medium text-foreground">
                        Excelente, {salespersonName}!
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 px-4 leading-relaxed">
                        {description}
                      </p>
                    </motion.div>

                    {value && value > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}
                        className="inline-block px-5 py-2 rounded-2xl bg-status-success/10 border border-status-success/30 text-status-success font-black italic shadow-lg"
                      >
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                      </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="pt-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Clique para fechar</p>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
