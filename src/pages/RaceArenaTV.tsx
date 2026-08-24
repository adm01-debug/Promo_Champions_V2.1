import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceArena as Arena, RaceCommentaryPanel } from '@/components/race';
import { useRaceSeasonByRole, type RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceEvents } from '@/hooks/race/useRaceEvents';
import { useRaceCommentary } from '@/hooks/race/useRaceCommentary';
import { useRaceViewTelemetry } from '@/hooks/race/useRaceViewTelemetry';
import { differenceInSeconds, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, Flag } from 'lucide-react';

const ROTATION_MS = 30_000;

function TvPista({ roleType }: { roleType: RoleType }) {
  const { data: season } = useRaceSeasonByRole(roleType);
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const { data: events = [] } = useRaceEvents(season?.id);
  const secondsToEnd = useMemo(() => {
    if (!season?.end_date) return undefined;
    const s = differenceInSeconds(new Date(season.end_date), new Date());
    return s >= 0 ? s : undefined;
  }, [season?.end_date]);

  const commentary = useRaceCommentary({
    seasonId: season?.id,
    seasonName: season?.name,
    roleType,
    leaderboard,
    recentEvents: events,
    secondsToEnd,
    enabled: !!season,
  });

  const top5 = leaderboard.slice(0, 5);

  return (
    <motion.div
      key={roleType}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 grid grid-cols-12 gap-6 p-8"
    >
      {/* Header lateral */}
      <div className="col-span-3 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
            {roleType === 'closer' ? 'Pista' : 'Pista'}
          </p>
          <h1 className="text-5xl font-display font-black uppercase tracking-tight leading-none mt-2">
            {roleType === 'closer' ? 'Closers' : 'SDRs'}
          </h1>
          {season && (
            <p className="text-sm text-muted-foreground mt-2">{season.name}</p>
          )}
        </div>

        {/* Top 5 podium */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Top 5
          </p>
          {top5.map((c, i) => (
            <div
              key={c.car_id}
              className="flex items-center gap-3 p-2 rounded-lg bg-card/60 backdrop-blur border border-border"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-black"
                style={{ backgroundColor: c.primary_color, color: c.secondary_color }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{c.salesperson_name}</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {(Number(c.progress) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Commentary */}
        <RaceCommentaryPanel
          items={commentary.items}
          isGenerating={commentary.isGenerating}
          onRegenerate={commentary.regenerate}
        />
      </div>

      {/* Pista grande */}
      <div className="col-span-9 relative">
        <Arena cars={leaderboard} />
        {season && (
          <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border flex items-center gap-2">
            <Flag className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold tabular-nums">
              {format(new Date(season.end_date), 'dd MMM', { locale: ptBR })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function RaceArenaTV() {
  const [current, setCurrent] = useState<RoleType>('closer');
  useRaceViewTelemetry('/race-arena/tv', true);

  useEffect(() => {
    const t = window.setInterval(() => {
      setCurrent((p) => (p === 'closer' ? 'sdr' : 'closer'));
    }, ROTATION_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <>
      <Helmet>
        <title>Race Arena TV — Modo Big Screen</title>
        <meta name="description" content="Modo TV da Race Arena: alterna entre pista de Closers e SDRs em tela cheia, ideal para projeção no escritório." />
      </Helmet>
      <div className="fixed inset-0 bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          <TvPista key={current} roleType={current} />
        </AnimatePresence>
        {/* Indicador de rotação */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border">
          <span className={`w-2 h-2 rounded-full transition-colors ${current === 'closer' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
          <span className="text-xs font-bold uppercase tracking-wider">{current === 'closer' ? 'Closers' : 'SDRs'}</span>
          <span className={`w-2 h-2 rounded-full transition-colors ${current === 'sdr' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
        </div>
      </div>
    </>
  );
}
