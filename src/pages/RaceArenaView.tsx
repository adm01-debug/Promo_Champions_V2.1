import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings2, Rocket, Wrench } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  RaceArena as Arena,
  RaceLeaderboardSidebar,
  FloatingEventFeed,
  CarCustomizer,
  RaceSoundToggle,
  VictoryLapOverlay,
  MonthlyChampionOverlay,
  PowerUpIcon,
  RaceCountdown,
  ScoreBreakdownCard,
  RaceArenaHeader,
  RaceArenaSkeleton,
  RaceEmptyState,
  StartSeasonDialog,
  OvertakeHighlight,
  LeaderTakeoverCelebration,
  RaceAudioPreferences,
  PitStopPanel,
  TrackConditionsBadge,
  TrackWeatherOverlay,
  GhostCar,
  GhostStatusBadge,
  RaceCommentaryPanel,
  DailyCheckinModal,
  RaceViewModeToggle,
  RaceOnboardingChecklist,
  RaceHighlightsTimeline,
} from '@/components/race';
import { getPositionOnTrack } from '@/components/race/raceTrackHelpers';
import { useRaceSeasonByRole, type RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceEvents } from '@/hooks/race/useRaceEvents';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { useRacePowerups, collectRacePowerup } from '@/hooks/race/useRacePowerups';
import { useRaceScoringRules } from '@/hooks/race/useRaceScoringRules';
import { useOvertakeDetector } from '@/hooks/race/useOvertakeDetector';
import { useLeaderTakeoverDetector } from '@/hooks/race/useLeaderTakeoverDetector';
import { useRaceAudioEngine } from '@/hooks/race/useRaceAudioEngine';
import { usePitStopAnalysis } from '@/hooks/race/usePitStopAnalysis';
import { useTrackConditions } from '@/hooks/race/useTrackConditions';
import { useGhostCar } from '@/hooks/race/useGhostCar';
import { useRaceCommentary } from '@/hooks/race/useRaceCommentary';
import { useDailyRaceCheckin } from '@/hooks/race/useDailyRaceCheckin';
import { useRaceViewMode } from '@/hooks/race/useRaceViewMode';
import { useRaceViewTelemetry } from '@/hooks/race/useRaceViewTelemetry';
import { format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const COUNTDOWN_SEEN_KEY = 'race_countdown_seen_seasons';

const ROLE_META: Record<RoleType, { title: string; emoji: string; subtitle: string }> = {
  closer: { title: 'Pista dos Closers', emoji: '🎯', subtitle: 'Corrida de fechamento de vendas' },
  sdr: { title: 'Pista dos SDRs', emoji: '📞', subtitle: 'Corrida de prospecção e qualificação' },
};

interface Props { roleType: RoleType }

export default function RaceArenaView({ roleType }: Props) {
  const meta = ROLE_META[roleType];
  const { muted, toggleMute, play } = useRaceSounds();
  const { isAdmin } = useUserRoles();
  const { data: season, isLoading: loadingSeason } = useRaceSeasonByRole(roleType);
  const { data: leaderboard = [], isLoading: loadingLb } = useRaceLeaderboard(season?.id);
  const isInitialLoading = loadingSeason || (!!season && loadingLb && leaderboard.length === 0);
  const { data: events = [] } = useRaceEvents(season?.id);
  const { data: rules = [] } = useRaceScoringRules(season?.id);
  const { data: myCar } = useMyRaceCar();
  const { data: myPowerups = [] } = useRacePowerups(season?.id, myCar?.salesperson_id);
  const qc = useQueryClient();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [startSeasonOpen, setStartSeasonOpen] = useState(false);
  const [pitStopOpen, setPitStopOpen] = useState(false);
  const [countdownTrigger, setCountdownTrigger] = useState(0);
  const [boostingIds, setBoostingIds] = useState<Set<string>>(new Set());
  const lastEventIdRef = useRef<string | null>(null);
  const { recentOvertakes, dismissOvertake } = useOvertakeDetector(leaderboard);
  const { takeover, clear: clearTakeover } = useLeaderTakeoverDetector(leaderboard, myCar?.salesperson_id);
  const viewMode = useRaceViewMode();
  useRaceViewTelemetry(`/race-arena/${roleType}`, !isInitialLoading);

  const secondsToEnd = useMemo(() => {
    if (!season?.end_date) return undefined;
    const s = differenceInSeconds(new Date(season.end_date), new Date());
    return s >= 0 ? s : undefined;
  }, [season?.end_date]);

  useRaceAudioEngine({
    leaderboard,
    mySalespersonId: myCar?.salesperson_id,
    secondsToEnd,
    play,
    muted,
  });

  const pitStopAnalysis = usePitStopAnalysis({
    leaderboard,
    mySalespersonId: myCar?.salesperson_id,
    season,
  });

  const trackConditions = useTrackConditions({
    events,
    leaderboard,
    seasonStart: season?.start_date,
  });

  const ghost = useGhostCar({
    mySalespersonId: myCar?.salesperson_id,
    currentSeason: season,
    leaderboard,
  });

  const commentary = useRaceCommentary({
    seasonId: season?.id,
    seasonName: season?.name,
    roleType,
    leaderboard,
    recentEvents: events,
    secondsToEnd,
    enabled: !!season,
  });

  const dailyCheckin = useDailyRaceCheckin({
    seasonId: season?.id,
    salespersonId: myCar?.salesperson_id,
    enabled: !!season && !!myCar?.salesperson_id,
  });

  useEffect(() => {
    if (recentOvertakes.length > 0) play('overtake');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentOvertakes.length]);

  useEffect(() => {
    if (events.length === 0) return;
    const newest = events[0];
    if (lastEventIdRef.current && lastEventIdRef.current !== newest.id) {
      const soundMap: Record<string, Parameters<typeof play>[0]> = {
        boost: 'boost', overtake: 'overtake', checkpoint: 'checkpoint',
        victory: 'victory', powerup: 'powerup', pitstop: 'pitstop',
      };
      const s = soundMap[newest.event_type];
      if (s) play(s);
      if (newest.event_type === 'boost' || newest.event_type === 'overtake') {
        setBoostingIds((prev) => new Set(prev).add(newest.salesperson_id));
        setTimeout(() => {
          setBoostingIds((prev) => { const n = new Set(prev); n.delete(newest.salesperson_id); return n; });
        }, 1500);
      }
    }
    lastEventIdRef.current = newest.id;
  }, [events, play]);

  useEffect(() => {
    if (!season) return;
    try {
      const seen = JSON.parse(localStorage.getItem(COUNTDOWN_SEEN_KEY) || '[]') as string[];
      if (seen.includes(season.id)) return;
      const ageSec = differenceInSeconds(new Date(), new Date(season.start_date));
      if (ageSec < 10 && ageSec > -86400) {
        setCountdownTrigger((t) => t + 1);
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      } else if (ageSec >= 10) {
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      }
    } catch { /* noop */ }
  }, [season]);

  const myEntry = leaderboard.find((e) => e.salesperson_id === myCar?.salesperson_id);
  const myProgress = Number(myEntry?.progress ?? 0);
  const visiblePowerups = useMemo(() => myPowerups
    .filter((p) => !p.used_at)
    .map((p) => {
      const pos = getPositionOnTrack(p.position_pct, 0);
      return { ...p, x: pos.x, y: pos.y, reachable: myProgress >= p.position_pct };
    }), [myPowerups, myProgress]);

  const handleCollectPowerup = async (id: string, reachable: boolean) => {
    if (!reachable) { toast.info('Você ainda não chegou neste power-up — venda mais!'); return; }
    try {
      const res = await collectRacePowerup(id) as { powerup_type?: string; badge_unlocked?: boolean };
      play('powerup');
      toast.success(`⚡ Power-up coletado: ${res?.powerup_type ?? ''}`);
      if (res?.badge_unlocked) toast.success('🏆 Badge desbloqueado: Powerup Collector!');
      qc.invalidateQueries({ queryKey: ['race-powerups'] });
      qc.invalidateQueries({ queryKey: ['race-events'] });
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>{meta.title} — Race Arena</title>
        <meta name="description" content={`${meta.title}: ${meta.subtitle}. Acompanhe o ranking em tempo real.`} />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4">
        <RaceArenaHeader
          title={meta.title}
          subtitle={meta.subtitle}
          emoji={meta.emoji}
          breadcrumbCurrent={roleType === 'closer' ? 'Pista Closers' : 'Pista SDRs'}
          hasActiveSeason={!!season}
          seasonName={season?.name}
          topEntries={leaderboard.slice(0, 3)}
          actions={
            <>
              <RaceViewModeToggle mode={viewMode.mode} onChange={viewMode.setMode} />
              {season && <TrackConditionsBadge conditions={trackConditions} />}
              {season && <GhostStatusBadge ghost={ghost} />}
              <Button onClick={() => setPitStopOpen(true)} variant="outline" disabled={!season}>
                <Wrench className="w-4 h-4 mr-2" /> Pit Stop
              </Button>
              <RaceSoundToggle muted={muted} onToggle={toggleMute} />
              <RaceAudioPreferences />
              <Button onClick={() => setCountdownTrigger((t) => t + 1)} variant="outline">
                <Rocket className="w-4 h-4 mr-2" /> Largada!
              </Button>
              {isAdmin && (
                <Button asChild variant="outline">
                  <Link to="/admin/race-arena">⚙️ Admin Race</Link>
                </Button>
              )}
              <Button onClick={() => setCustomizerOpen(true)} variant="default">
                <Settings2 className="w-4 h-4 mr-2" /> Meu Carro
              </Button>
            </>
          }
        />

        {isInitialLoading ? (
          <RaceArenaSkeleton />
        ) : !season ? (
          <RaceEmptyState
            roleType={roleType}
            isAdmin={isAdmin}
            onStartSeason={() => setStartSeasonOpen(true)}
          />
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">{season.name}</strong> ·{' '}
              {format(new Date(season.start_date), 'dd MMM', { locale: ptBR })} →{' '}
              {format(new Date(season.end_date), 'dd MMM', { locale: ptBR })} ·{' '}
              Meta {Number(season.goal_amount).toLocaleString('pt-BR')} pts
            </div>

            <div className="grid grid-cols-12 gap-4" style={{ minHeight: '85vh' }}>
              <div className={`col-span-12 ${viewMode.isImmersive ? 'lg:col-span-2' : 'lg:col-span-3'} order-2 lg:order-1 space-y-3`}>
                {viewMode.showCommentary && (
                  <RaceCommentaryPanel
                    items={commentary.items}
                    isGenerating={commentary.isGenerating}
                    onRegenerate={commentary.regenerate}
                  />
                )}
                <RaceLeaderboardSidebar
                  entries={leaderboard}
                  goalAmount={Number(season.goal_amount)}
                  currentUserSalespersonId={myCar?.salesperson_id}
                  currentUserCarId={myCar?.id}
                  seasonId={season.id}
                  seasonStart={season.start_date}
                  seasonEnd={season.end_date}
                />
                {viewMode.showScoreBreakdown && myEntry && rules.length > 0 && (
                  <ScoreBreakdownCard entry={myEntry} rules={rules} />
                )}
                {viewMode.showScoreBreakdown && (
                  <RaceHighlightsTimeline events={events} cars={leaderboard} />
                )}
              </div>
              <div className={`col-span-12 ${viewMode.isImmersive ? 'lg:col-span-10' : 'lg:col-span-9'} order-1 lg:order-2`}>
                <Arena
                  cars={leaderboard}
                  boostingIds={boostingIds}
                  currentUserSalespersonId={myCar?.salesperson_id}
                  overlayChildren={
                    <>
                      <GhostCar ghost={ghost} />
                      <AnimatePresence>
                        {visiblePowerups.map((p) => (
                          <PowerUpIcon key={p.id} type={p.powerup_type} x={p.x} y={p.y} onClick={() => handleCollectPowerup(p.id, p.reachable)} />
                        ))}
                      </AnimatePresence>
                    </>
                  }
                  
                />
              </div>
            </div>

            {viewMode.showFeed && <FloatingEventFeed events={events} cars={leaderboard} />}
            <VictoryLapOverlay events={events} cars={leaderboard} onPlaySound={() => play('victory')} />
          </>
        )}

        <MonthlyChampionOverlay roleType={roleType} onPlaySound={() => play('victory')} />
        <OvertakeHighlight
          overtakes={recentOvertakes}
          onDismiss={dismissOvertake}
          currentUserSalespersonId={myCar?.salesperson_id}
        />
        <LeaderTakeoverCelebration takeover={takeover} onClear={clearTakeover} onPlaySound={() => play('victory')} />

        <CarCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
        <PitStopPanel
          open={pitStopOpen}
          onOpenChange={setPitStopOpen}
          analysis={pitStopAnalysis}
          onPlaySound={() => play('pitstop')}
        />
        <RaceCountdown trigger={countdownTrigger} onTick={() => play('countdown')} />
        <DailyCheckinModal open={dailyCheckin.open} onOpenChange={dailyCheckin.setOpen} data={dailyCheckin.data} />
        {season && (
          <RaceOnboardingChecklist
            items={[
              { id: 'car', label: 'Personalize seu carro', done: !!myCar?.car_style, action: () => setCustomizerOpen(true) },
              { id: 'leaderboard', label: 'Veja o leaderboard', done: leaderboard.length > 0 },
              { id: 'powerup', label: 'Colete um power-up', done: visiblePowerups.some((p) => p.reachable === false ? false : myPowerups.some((mp) => mp.used_at)) },
              { id: 'pitstop', label: 'Visite o Pit Stop', done: false, action: () => setPitStopOpen(true) },
              { id: 'view-mode', label: 'Experimente os modos de visualização', done: viewMode.mode !== 'competitive' },
            ]}
          />
        )}
        {isAdmin && (
          <StartSeasonDialog open={startSeasonOpen} onOpenChange={setStartSeasonOpen} />
        )}
      </div>
    </>
  );
}
