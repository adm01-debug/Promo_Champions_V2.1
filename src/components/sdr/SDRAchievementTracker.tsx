import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useAllSalespeopleXP,
  calculateLevelFromXP,
  getLevelInfo,
} from '@/hooks/gamification/useSalespersonXP';
import { useSalespersonStreak } from '@/hooks/gamification/useAchievements';

export const SDRAchievementTracker = () => {
  const { data: xpRows } = useAllSalespeopleXP();
  const topSdr = (xpRows ?? []).find(row =>
    ['sdr', 'hybrid'].includes(
      (row as { salespeople?: { role?: string } }).salespeople?.role ?? ''
    )
  );
  const { data: streak } = useSalespersonStreak(topSdr?.salesperson_id);

  if (!topSdr) {
    return (
      <Card className="glass border-primary/20 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Trophy className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              Sem dados de gamificação ainda
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Quando o time de SDR acumular XP em `salesperson_xp`, o destaque do período
              aparece aqui com nível, progresso e streak reais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const salesperson = (topSdr as { salespeople?: { name?: string } }).salespeople;
  const { level, xpInLevel, xpToNext, progress } = calculateLevelFromXP(topSdr.total_xp);
  const xpRemaining = Math.max(0, xpToNext - xpInLevel);
  const levelInfo = getLevelInfo(level);

  return (
    <Card className="glass border-primary/20 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
          <span className="text-xs font-bold text-primary">
            Streak: {streak?.current ?? 0} Dias
          </span>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Level Hexagon */}
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/30 relative z-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nível
                </p>
                <p className="text-3xl font-black text-primary leading-none">{level}</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-125"
            />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section-title flex items-center gap-2">
                  {salesperson?.name ?? 'SDR'} — {levelInfo?.title || 'Prospector'}
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  Faltam {xpRemaining.toLocaleString('pt-BR')} XP para o Nível {level + 1}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-primary/5" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium">
                  {topSdr.total_xp.toLocaleString('pt-BR')} XP
                </span>
              </div>
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-medium">
                  Maior streak: {streak?.best ?? 0}d
                </span>
              </div>
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <Star className="h-4 w-4 text-green-500" />
                <span className="text-[10px] font-medium">
                  {levelInfo?.title || `Nível ${level}`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-primary italic">
                  PRÓXIMO: Nível {level + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
