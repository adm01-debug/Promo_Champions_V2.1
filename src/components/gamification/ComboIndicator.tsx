import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTodayCombo, setTierUpCallback, COMBO_TIERS } from "@/hooks/useCombo";
import { comboService } from "@/services/comboService";
import { ComboExplosion } from "@/components/effects/ComboExplosion";
import { cn } from "@/lib/utils";

interface ComboIndicatorProps {
  salespersonId: string;
  variant?: "compact" | "full";
}

export function ComboIndicator({ salespersonId, variant = "compact" }: ComboIndicatorProps) {
  const { data: combo, isLoading } = useTodayCombo(salespersonId);
  const [explosionTrigger, setExplosionTrigger] = useState(false);
  const [explosionTier, setExplosionTier] = useState(0);

  const handleTierUp = useCallback((tier: number) => {
    setExplosionTier(tier);
    setExplosionTrigger(true);
  }, []);

  useEffect(() => {
    setTierUpCallback(handleTierUp);
    return () => setTierUpCallback(null);
  }, [handleTierUp]);

  const handleExplosionComplete = () => {
    setExplosionTrigger(false);
  };

  if (isLoading || !combo) return null;

  const currentTier = comboService.getComboTier(combo.actions_count);
  const currentTierIndex = comboService.getComboTierIndex(combo.actions_count);
  const nextTier = comboService.getNextTier(combo.actions_count);

  const progressToNext = nextTier
    ? ((combo.actions_count - currentTier.minActions) / (nextTier.minActions - currentTier.minActions)) * 100
    : 100;

  const isOnFire = combo.current_multiplier >= 2.0;

  const glowStyles: Record<number, string> = {
    0: "",
    1: "shadow-[0_0_10px_rgba(59,130,246,0.4)]",
    2: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    3: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
    4: "shadow-[0_0_25px_rgba(245,158,11,0.6)]",
  };

  if (variant === "compact") {
    return (
      <>
        <ComboExplosion trigger={explosionTrigger} tier={explosionTier} onComplete={handleExplosionComplete} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
            glowStyles[currentTierIndex] || "",
            currentTierIndex >= 2 ? "border-orange-500/30" : "border-border/50"
          )}
          style={{ borderColor: `${currentTier.color}40` }}
        >
          <motion.span
            animate={isOnFire ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {currentTier.emoji}
          </motion.span>
          <span style={{ color: currentTier.color }}>
            {currentTier.multiplier}x
          </span>
          <span className="text-muted-foreground">{currentTier.label}</span>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <ComboExplosion trigger={explosionTrigger} tier={explosionTier} onComplete={handleExplosionComplete} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass rounded-xl p-4 border overflow-hidden relative",
          glowStyles[currentTierIndex] || ""
        )}
        style={{ borderColor: `${currentTier.color}30` }}
      >
        {/* Animated background */}
        {isOnFire && (
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${currentTier.color}20, transparent)` }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={isOnFire ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {currentTier.emoji}
              </motion.span>
              <div>
                <p className="font-bold text-sm" style={{ color: currentTier.color }}>
                  {currentTier.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {combo.actions_count} ações hoje
                </p>
              </div>
            </div>
            <Badge
              className="text-lg font-black border-0"
              style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
            >
              {currentTier.multiplier}x
            </Badge>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Próximo: {nextTier.emoji} {nextTier.label}</span>
                <span>{nextTier.minActions - combo.actions_count} ações restantes</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: currentTier.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Max tier reached */}
          {!nextTier && (
            <div className="flex items-center gap-1 text-xs font-medium" style={{ color: currentTier.color }}>
              <TrendingUp className="h-3 w-3" />
              Nível máximo alcançado!
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
