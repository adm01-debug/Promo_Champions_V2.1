import { motion, useReducedMotion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, TrendingDown, Minus, Trophy, Sparkles } from 'lucide-react';
import type { DailyCheckinResult } from '@/hooks/race/useDailyRaceCheckin';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: DailyCheckinResult | null;
}

function DeltaBadge({ value, suffix = '', invertColors = false }: { value: number; suffix?: string; invertColors?: boolean }) {
  const positive = invertColors ? value < 0 : value > 0;
  const negative = invertColors ? value > 0 : value < 0;
  const color = positive ? 'text-success' : negative ? 'text-destructive' : 'text-muted-foreground';
  const Icon = value === 0 ? Minus : (positive ? TrendingUp : TrendingDown);
  const sign = value > 0 ? '+' : '';
  return (
    <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${color}`}>
      <Icon className="w-4 h-4" />
      {sign}{value.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

export function DailyCheckinModal({ open, onOpenChange, data }: Props) {
  const reduce = useReducedMotion();
  if (!data) return null;

  const hasComparison = !!data.delta && !!data.previous;
  const streakKept = data.streak_days > data.previous_streak && data.previous_streak > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <DialogHeader className="text-center space-y-3">
            <motion.div
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-2xl shadow-primary/40"
              animate={reduce ? {} : { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="text-2xl font-display font-black uppercase tracking-tight">
              Bom dia, piloto!
            </DialogTitle>
            <DialogDescription className="text-base">
              Aqui está seu status na pista hoje.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Streak */}
            <motion.div
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-warning/15 to-warning/5 border border-warning/30"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={reduce ? {} : { rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.6, repeat: streakKept ? 2 : 0 }}
                >
                  <Flame className={`w-7 h-7 ${data.streak_days >= 3 ? 'text-warning' : 'text-muted-foreground'}`} />
                </motion.div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Streak</p>
                  <p className="text-2xl font-display font-black tabular-nums">
                    {data.streak_days} {data.streak_days === 1 ? 'dia' : 'dias'}
                  </p>
                </div>
              </div>
              {streakKept && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold"
                >
                  <Sparkles className="w-3 h-3" />
                  +1!
                </motion.div>
              )}
            </motion.div>

            {/* Deltas */}
            {hasComparison ? (
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Posição</p>
                  <p className="text-lg font-display font-black">P{data.today?.rank ?? '-'}</p>
                  <DeltaBadge value={data.delta?.rank ?? 0} />
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Progresso</p>
                  <p className="text-lg font-display font-black tabular-nums">
                    {((data.today?.progress ?? 0) * 100).toFixed(1)}%
                  </p>
                  <DeltaBadge value={Number(((data.delta?.progress ?? 0) * 100).toFixed(1))} suffix="%" />
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendas</p>
                  <p className="text-lg font-display font-black tabular-nums">
                    R$ {(data.today?.total_sales ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                  <DeltaBadge value={Math.round(data.delta?.total_sales ?? 0)} suffix="" />
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Deals</p>
                  <p className="text-lg font-display font-black tabular-nums">{data.today?.deals_count ?? 0}</p>
                  <DeltaBadge value={data.delta?.deals_count ?? 0} />
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground text-center italic">
                Primeiro check-in da temporada — comparações aparecem amanhã!
              </p>
            )}

            <Button onClick={() => onOpenChange(false)} className="w-full font-display font-black uppercase tracking-wider" size="lg">
              Bora correr! 🏁
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
