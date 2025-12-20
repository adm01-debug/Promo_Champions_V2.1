import { motion } from "framer-motion";
import { Zap, TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalespersonGamification } from "@/hooks/useGamificationData";
import { getLevelInfo, calculateLevelFromXP } from "@/hooks/useSalespersonXP";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface XPMiniWidgetProps {
  salespersonId?: string;
  collapsed?: boolean;
  className?: string;
}

export function XPMiniWidget({ salespersonId, collapsed = false, className }: XPMiniWidgetProps) {
  const { data: gamificationData, isLoading } = useSalespersonGamification(salespersonId || null);

  if (isLoading || !gamificationData) {
    return null;
  }

  const levelInfo = getLevelInfo(gamificationData.level);
  const levelProgress = calculateLevelFromXP(gamificationData.totalXP);
  const progressPercent = levelProgress.xpToNext > 0 
    ? Math.round((levelProgress.xpInLevel / levelProgress.xpToNext) * 100)
    : 100;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer",
              "bg-gradient-to-br from-xp/10 to-xp/5 border border-xp/20",
              "hover:from-xp/20 hover:to-xp/10 transition-colors",
              className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-lg">{levelInfo.emoji}</div>
            <span className="text-[10px] font-bold text-xp">{gamificationData.level}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelInfo.emoji}</span>
              <div>
                <p className="font-semibold">{levelInfo.title}</p>
                <p className="text-xs text-muted-foreground">Nível {gamificationData.level}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{gamificationData.totalXP.toLocaleString()} XP</span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
            {gamificationData.currentStreak > 0 && (
              <div className="flex items-center gap-1 text-xs text-streak">
                <Flame className="h-3 w-3" />
                <span>{gamificationData.currentStreak} dias de streak</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      className={cn(
        "rounded-xl p-3 border",
        "bg-gradient-to-br from-xp/10 via-background to-primary/5",
        "border-xp/20",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Level and XP */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${levelInfo.color}20` }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {levelInfo.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">{levelInfo.title}</span>
            <span className="text-xs text-muted-foreground">Lv.{gamificationData.level}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-xp" />
            <span className="font-medium text-xp">{gamificationData.totalXP.toLocaleString()}</span>
            <span>XP</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Próximo nível</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(var(--xp)), hsl(var(--primary)))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {levelProgress.xpInLevel} / {levelProgress.xpToNext} XP
        </p>
      </div>

      {/* Streak indicator */}
      {gamificationData.currentStreak > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-streak" />
            <span className="text-sm font-bold text-streak">{gamificationData.currentStreak}</span>
          </div>
          <span className="text-xs text-muted-foreground">dias de streak</span>
          {gamificationData.currentStreak >= gamificationData.bestStreak && gamificationData.currentStreak > 1 && (
            <motion.div
              className="ml-auto flex items-center gap-1 text-[10px] text-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <TrendingUp className="h-3 w-3" />
              <span>Recorde!</span>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
