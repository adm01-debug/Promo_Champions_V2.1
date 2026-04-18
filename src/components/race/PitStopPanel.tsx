import { FC, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wrench, Lightbulb, Target, TrendingUp, ArrowRight, Timer } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { fmtCurrency } from './raceFormatters';
import type { PitStopAnalysis } from '@/hooks/race/usePitStopAnalysis';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PitStopAnalysis;
  onPlaySound?: () => void;
}

const PIT_STOP_SECONDS = 30;

/**
 * Tactical pause panel. Opens as a right-side Sheet, plays the `pitstop` sound,
 * shows a 30s visual timer (symbolic), and breaks down current standing,
 * the immediate rival, pace check and a contextual recommendation.
 */
export const PitStopPanel: FC<Props> = ({ open, onOpenChange, analysis, onPlaySound }) => {
  const reduceMotion = useReducedMotion();
  const [secondsLeft, setSecondsLeft] = useState(PIT_STOP_SECONDS);

  useEffect(() => {
    if (!open) {
      setSecondsLeft(PIT_STOP_SECONDS);
      return;
    }
    onPlaySound?.();
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { myStats, nextRival, pace, recommendation, hasData } = analysis;
  const timerPct = ((PIT_STOP_SECONDS - secondsLeft) / PIT_STOP_SECONDS) * 100;
  const paceRatio = pace && pace.requiredPerDay > 0
    ? Math.min(150, (pace.currentPerDay / pace.requiredPerDay) * 100)
    : 100;

  const stagger = reduceMotion ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="flex items-center gap-2 font-display">
              <Wrench className="w-5 h-5 text-primary" />
              Pit Stop Estratégico
            </SheetTitle>
            <Badge variant="outline" className="gap-1.5">
              <Timer className="w-3 h-3" />
              <span className="tabular-nums">{secondsLeft}s</span>
            </Badge>
          </div>
          <SheetDescription>
            Pausa tática para revisar performance e planejar a próxima jogada.
          </SheetDescription>
          <Progress value={timerPct} className="h-1 mt-2" aria-label="Tempo de pit stop" />
        </SheetHeader>

        {!hasData ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {recommendation}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Status atual */}
            <motion.section
              {...stagger}
              transition={{ duration: 0.3, delay: 0 }}
              className="rounded-lg border bg-card p-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Status atual
              </h3>
              <div className="flex items-center gap-4">
                <ProgressRing value={myStats?.progress ?? 0} size={72} variant="primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold font-display tabular-nums">
                    P{myStats?.rank}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {fmtCurrency(myStats?.totalSales ?? 0)} · {myStats?.dealsCount} deal(s)
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Próximo alvo */}
            {nextRival && (
              <motion.section
                {...stagger}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="rounded-lg border bg-card p-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Próximo alvo
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    {nextRival.avatarUrl && <AvatarImage src={nextRival.avatarUrl} alt={nextRival.name} />}
                    <AvatarFallback>{nextRival.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{nextRival.name}</div>
                    <div className="text-xs text-muted-foreground">P{nextRival.rank} · à frente</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums">{fmtCurrency(nextRival.gap)}</div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">gap</div>
                  </div>
                </div>
                {nextRival.salesNeeded > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Estimativa: <strong className="text-foreground">{nextRival.salesNeeded} deal(s)</strong> no seu ticket médio.
                  </div>
                )}
              </motion.section>
            )}

            {/* Pace check */}
            {pace && (
              <motion.section
                {...stagger}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-lg border bg-card p-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Pace check
                </h3>
                <Progress value={Math.min(100, paceRatio)} className="h-2" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Atual: <strong className="text-foreground tabular-nums">{fmtCurrency(pace.currentPerDay)}/dia</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Necessário: <strong className="text-foreground tabular-nums">{fmtCurrency(pace.requiredPerDay)}/dia</strong>
                  </span>
                </div>
                <div className="mt-2 text-xs">
                  <Badge variant={pace.onTrack ? 'default' : 'destructive'}>
                    {pace.onTrack ? 'No ritmo' : 'Abaixo do ritmo'}
                  </Badge>
                  <span className="ml-2 text-muted-foreground">
                    {pace.daysRemaining}d restantes
                  </span>
                </div>
              </motion.section>
            )}

            {/* Recomendação tática */}
            <motion.section
              {...stagger}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-lg border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                    Recomendação tática
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
                </div>
              </div>
            </motion.section>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
            Voltar à pista
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
