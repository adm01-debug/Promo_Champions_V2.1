import React from 'react';
import { Flame, Zap } from 'lucide-react';
import { useSalesStreaks } from '@/hooks/useSalesStreaks';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function StreakIndicator() {
  const { salesperson } = useAuth();
  const { data: streaks, isLoading } = useSalesStreaks();

  const myStreak = streaks?.find(s => s.salesperson_id === salesperson?.id);

  if (isLoading || !myStreak || myStreak.current_streak === 0) return null;

  const streak = myStreak.current_streak;
  const isHot = streak >= 5;
  const isLegendary = streak >= 10;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-all duration-500 cursor-default group",
              isLegendary 
                ? "bg-destructive/10 border-destructive/30 text-destructive animate-pulse" 
                : isHot 
                  ? "bg-streak/10 border-streak/30 text-streak" 
                  : "bg-orange-500/10 border-orange-500/30 text-orange-600"
            )}
          >
            <div className="relative">
              <Flame className={cn(
                "h-4 w-4 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12",
                isHot && "animate-bounce"
              )} />
              {isLegendary && (
                <div className="absolute inset-0 bg-destructive blur-sm opacity-50 animate-pulse rounded-full" />
              )}
            </div>
            
            <span className="text-sm font-black italic tracking-tighter">
              {streak}
            </span>

            {myStreak.xp_multiplier > 1 && (
              <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-current/20">
                <Zap className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold">{myStreak.xp_multiplier}x</span>
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] text-center">
          <p className="font-bold">Streak de {streak} dias! 🔥</p>
          <p className="text-xs text-muted-foreground mt-1">
            Você está ganhando <span className="text-primary font-bold">{myStreak.xp_multiplier}x mais XP</span> por cada atividade!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
