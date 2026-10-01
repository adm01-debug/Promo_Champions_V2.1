import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCarsLayer } from './RaceCarsLayer';
import { RaceTrackEffects } from './RaceTrackEffects';
import { RaceLiveTiming } from './RaceLiveTiming';
import { RaceLapBadge } from './RaceLapBadge';
import { RaceArenaOverlays } from './RaceArenaOverlays';
import { RaceMiniMap } from './RaceMiniMap';
import { CommentaryBubble } from './CommentaryBubble';

import { ReplayButton } from './ReplayButton';
import { StartLights } from './StartLights';
import { Fireworks } from './Fireworks';
import { RaceControlPanel, type RaceFlag } from './RaceControlPanel';
import { SpeedHUD } from './SpeedHUD';
import { NextCornerHUD } from './NextCornerHUD';
import { TrackTireMarks } from './track/TrackTireMarks';
import { TrackDustParticles } from './track/TrackDustParticles';
import { LeaderGapIndicator } from './LeaderGapIndicator';
import { SlipstreamLines } from './SlipstreamLines';
import { RaceCountdownBadge } from './RaceCountdownBadge';
import { RaceEventTicker } from './RaceEventTicker';
import { DRSZoneOverlay } from './DRSZoneOverlay';
import { LeaderNeonTrail } from './LeaderNeonTrail';
import { LapCounterBadge } from './LapCounterBadge';
import { BroadcastOverlay } from './BroadcastOverlay';
import { MyTelemetryPanel } from './MyTelemetryPanel';
import { PitLane } from './PitLane';
import { RaceMuteToggle } from './RaceMuteToggle';
import { RaceReplayButton } from './RaceReplayButton';
import { RaceEasterEggs } from './RaceEasterEggs';

import { useScreenShake } from '@/hooks/race/useScreenShake';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useRaceReplay } from '@/hooks/race/useRaceReplay';
import { useRaceDisplayEvents } from '@/hooks/race/useRaceDisplayEvents';
import { useRaceCommentaryLogic } from '@/hooks/race/useRaceCommentaryLogic';
import { useRaceDetection } from '@/hooks/race/useRaceDetection';
import { useRaceReactions } from '@/hooks/race/useRaceReactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRaceViewMode } from '@/hooks/race/useRaceViewMode';
import { useRaceCalm } from '@/contexts/RaceCalmContext';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

import {
  getPositionOnTrack,
  isInDRSZone,
  computeLapInfo,
  makeCommentaryLine,
  getNextCornerInfo,
  TRACK_VIEWBOX,
} from './raceTrackHelpers';

interface RaceArenaProps {
  cars: RaceLeaderboardEntry[];
  boostingIds?: Set<string>;
  currentUserSalespersonId?: string;
  overlayChildren?: React.ReactNode;
  weatherOverlay?: React.ReactNode;
  /** Habilita padrões SVG nos carros para usuários daltônicos. */
  colorblindMode?: boolean;
  /** Season ativa para escopo de reactions em tempo real. */
  seasonId?: string | null;
  /** ISO start da season (Race Control). */
  seasonStartedAt?: string | null;
  /** ISO término previsto da season (Race Control). */
  seasonEndsAt?: string | null;
  /** Telemetria opcional do piloto logado (mostra MyTelemetryPanel se fornecido). */
  telemetry?: {
    avgDealsPerDay: number;
    bestLap: number;
    ghostDeltaPp: number;
    tireFatigue: number;
    nextGoalLabel?: string;
    nextGoalPercent?: number;
  };
}

export function RaceArena({
  cars,
  boostingIds,
  currentUserSalespersonId,
  overlayChildren,
  weatherOverlay,
  colorblindMode = false,
  seasonId = null,
  seasonStartedAt = null,
  seasonEndsAt = null,
  telemetry,
}: RaceArenaProps) {
  const sorted = [...cars].sort((a, b) => Number(b.progress) - Number(a.progress));
  const reducedMotion = useReducedMotion();
  const viewMode = useRaceViewMode();
  const { calm } = useRaceCalm();
  const noFx = reducedMotion || calm;
  const carIds = sorted.map(c => c.car_id);
  const { data: reactionsData = [], liveBurst } = useRaceReactions(carIds, seasonId);
  const allReactions = [...liveBurst, ...reactionsData];

  const { commentary, pushCommentary } = useRaceCommentaryLogic();
  const { tickerEvents, pushTickerEvent, broadcastEvents, pushBroadcast } =
    useRaceDisplayEvents();
  const { shaking, trigger: triggerShake } = useScreenShake(280);
  const { muted, toggleMute, play } = useRaceSounds();
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const {
    flashingCars,
    dustBursts,
    sectorBadges,
    overtakesTotal,
    yellowFlagUntil,
    flashSectorIdx,
    fastestCarId,
    cinematicFocus,
    waveTrigger,
  } = useRaceDetection({
    sortedCars: sorted,
    reducedMotion,
    triggerShake,
    playOvertakeSound: () => playRef.current('overtake'),
    playLeaderTakeoverSound: () => playRef.current('leader_takeover'),
    pushCommentary,
    pushTickerEvent,
    pushBroadcast,
  });

  const [replayOverlay, setReplayOverlay] = useState(false);
  const lastOvertakeRef = useRef<{
    attacker: string;
    defender: string;
    at: number;
  } | null>(null);
  const [finaleShown, setFinaleShown] = useState(false);
  const [showFinaleFlag, setShowFinaleFlag] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [startLightsTrigger, setStartLightsTrigger] = useState(0);
  const pitTrackRef = useRef<Map<string, { lastProgress: number; stalledSince: number }>>(
    new Map()
  );
  const [pitStopCars, setPitStopCars] = useState<Set<string>>(new Set());
  const [leaderSpeed, setLeaderSpeed] = useState(0);
  const lastLeaderProgressRef = useRef<{ progress: number; at: number } | null>(null);

  const replay = useRaceReplay();
  useEffect(() => {
    if (cars.length > 0) replay.recordSnapshot(cars);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [cars.map(c => `${c.car_id}:${Math.floor(Number(c.progress) * 100)}`).join('|')]);

  const wearTrackRef = useRef<Map<string, { lastProgress: number; smoothDelta: number }>>(
    new Map()
  );
  const tireWearByCar = useMemo(() => {
    const map = new Map<string, number>();
    sorted.forEach(c => {
      const prev = wearTrackRef.current.get(c.car_id);
      const p = Number(c.progress);
      if (!prev) {
        wearTrackRef.current.set(c.car_id, { lastProgress: p, smoothDelta: 0.001 });
        map.set(c.car_id, 1);
        return;
      }
      const delta = Math.max(0, p - prev.lastProgress);
      const smooth = prev.smoothDelta * 0.85 + delta * 0.15;
      wearTrackRef.current.set(c.car_id, { lastProgress: p, smoothDelta: smooth });
      const avg =
        sorted.reduce((acc, x) => acc + Number(x.progress), 0) /
        Math.max(1, sorted.length);
      const lag = Math.max(0, avg - p);
      const wear = Math.max(0.15, Math.min(1, 1 - lag * 1.4));
      map.set(c.car_id, wear);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [sorted.map(c => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')]);

  const leader = sorted[0];
  const leaderPos = useMemo(
    () => (leader ? getPositionOnTrack(Number(leader.progress), 0) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
    [leader?.car_id, leader?.progress]
  );

  const lapInfo = computeLapInfo(Number(leader?.progress ?? 0), 10);

  useEffect(() => {
    if (!leader) return;
    const now = Date.now();
    const p = Number(leader.progress);
    const prev = lastLeaderProgressRef.current;
    if (prev) {
      const dt = (now - prev.at) / 1000;
      const dp = Math.max(0, p - prev.progress);
      if (dt > 0.05) {
        const kmh = (dp / dt) * 22000;
        setLeaderSpeed(s => s * 0.7 + Math.min(360, kmh) * 0.3);
        lastLeaderProgressRef.current = { progress: p, at: now };
      }
    } else {
      lastLeaderProgressRef.current = { progress: p, at: now };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [leader?.car_id, leader?.progress]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeaderSpeed(s => (s > 1 ? s * 0.92 : 0));
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  const currentFlag: RaceFlag = useMemo(() => {
    if (showFinaleFlag) return 'checkered';
    if (Date.now() < yellowFlagUntil) return 'yellow';
    return 'green';
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [showFinaleFlag, yellowFlagUntil, leaderSpeed]);

  const tireMarkCars = useMemo(
    () => sorted.map(c => ({ id: c.car_id, progress: Number(c.progress) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
    [sorted.map(c => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')]
  );

  const drsActiveByCar = useMemo(() => {
    const map = new Map<string, boolean>();
    sorted.forEach((c, idx) => {
      if (idx === 0) {
        map.set(c.car_id, false);
        return;
      }
      const ahead = sorted[idx - 1];
      const gap = Number(ahead.progress) - Number(c.progress);
      map.set(c.car_id, isInDRSZone(Number(c.progress)) && gap > 0 && gap < 0.06);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [sorted.map(c => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')]);

  const timingCount = viewMode.isFocus || viewMode.isImmersive ? 3 : 5;
  const top5 = sorted.slice(0, timingCount);
  const leaderProgress = Number(top5[0]?.progress ?? 0);

  const second = sorted[1];
  const gapToSecond =
    leader && second ? Number(leader.progress) - Number(second.progress) : null;
  const showGapLine = gapToSecond !== null && gapToSecond > 0 && gapToSecond < 0.05;

  const _gapMidPos = useMemo(() => {
    if (!showGapLine || !leader || !second) return null;
    const midProgress = (Number(leader.progress) + Number(second.progress)) / 2;
    return getPositionOnTrack(midProgress, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [showGapLine, leader?.progress, second?.progress]);

  const leaderPosForLine = useMemo(
    () => (leader ? getPositionOnTrack(Number(leader.progress), 0) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
    [leader?.car_id, leader?.progress]
  );

  const secondPos = useMemo(
    () => (second ? getPositionOnTrack(Number(second.progress), 0) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
    [second?.car_id, second?.progress]
  );

  const closeBattle =
    sorted.length >= 2
      ? Number(sorted[0].progress) - Number(sorted[1].progress) < 0.03
      : false;
  const [zoomActive, setZoomActive] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    if (closeBattle && !zoomActive) {
      setZoomActive(true);
      const t = window.setTimeout(() => setZoomActive(false), 2000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [closeBattle, reducedMotion, zoomActive]);

  const currentUserCar = useMemo(
    () => sorted.find(c => c.salesperson_id === currentUserSalespersonId),
    [sorted, currentUserSalespersonId]
  );
  const nextCornerInfo = useMemo(
    () => (currentUserCar ? getNextCornerInfo(Number(currentUserCar.progress)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
    [currentUserCar?.car_id, currentUserCar?.progress]
  );

  const aeroTurbByCar = useMemo(() => {
    const map = new Map<string, boolean>();
    sorted.forEach((c, idx) => {
      map.set(c.car_id, idx < 3 && (drsActiveByCar.get(c.car_id) ?? false));
    });
    return map;
  }, [sorted, drsActiveByCar]);

  useEffect(() => {
    if (finaleShown || reducedMotion) return;
    if (leaderProgress >= 0.95) {
      setFinaleShown(true);
      setShowFinaleFlag(true);
      setShowFireworks(true);
      const lname = sorted[0]?.salesperson_name;
      pushCommentary(makeCommentaryLine({ type: 'finale', leader: lname }));
      playRef.current('season_end');
      if (lname) {
        pushBroadcast({
          kind: 'finale',
          title: `${lname.split(' ')[0]} CRUZA A LINHA`,
          detail: 'Bandeirada final — corrida encerrada',
        });
      }
      const t1 = window.setTimeout(() => setShowFinaleFlag(false), 2200);
      const t2 = window.setTimeout(() => setShowFireworks(false), 2600);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    return undefined;
  }, [leaderProgress, finaleShown, reducedMotion, sorted, pushCommentary, pushBroadcast]);

  const gapBroadcastLastRef = useRef<number>(0);
  useEffect(() => {
    if (!leader || !second || gapToSecond === null) return;
    if (gapToSecond > 0 && gapToSecond < 0.01) {
      const now = Date.now();
      if (now - gapBroadcastLastRef.current > 15_000) {
        gapBroadcastLastRef.current = now;
        const a = leader.salesperson_name?.split(' ')[0];
        const b = second.salesperson_name?.split(' ')[0];
        if (a && b) {
          pushBroadcast({
            kind: 'gap',
            title: `${a} vs ${b}`,
            detail: `Gap ${(gapToSecond * 100).toFixed(2)}% · disputa ao vivo`,
          });
        }
      }
    }
  }, [leader, second, gapToSecond, pushBroadcast]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setTimeout(() => setStartLightsTrigger(1), 600);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const now = Date.now();
    const next = new Set(pitStopCars);
    let mutated = false;
    sorted.forEach(c => {
      const prev = pitTrackRef.current.get(c.car_id);
      const p = Number(c.progress);
      if (!prev) {
        pitTrackRef.current.set(c.car_id, { lastProgress: p, stalledSince: now });
        return;
      }
      const moved = Math.abs(p - prev.lastProgress) > 0.0005;
      if (moved) {
        pitTrackRef.current.set(c.car_id, { lastProgress: p, stalledSince: now });
        if (next.has(c.car_id)) {
          next.delete(c.car_id);
          mutated = true;
        }
      } else {
        const stalledFor = now - prev.stalledSince;
        if (stalledFor > 3000 && !next.has(c.car_id) && p > 0.02 && p < 0.98) {
          next.add(c.car_id);
          mutated = true;
          window.setTimeout(() => {
            setPitStopCars(s => {
              const n = new Set(s);
              n.delete(c.car_id);
              return n;
            });
            const cur = pitTrackRef.current.get(c.car_id);
            if (cur)
              pitTrackRef.current.set(c.car_id, { ...cur, stalledSince: Date.now() });
          }, 1500);
        }
      }
    });
    if (mutated) setPitStopCars(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias intencionais (comportamento pre-existente verificado)
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chave de comparacao rasa intencional (comportamento pre-existente verificado)
    sorted.map(c => `${c.car_id}:${Math.floor(Number(c.progress) * 500)}`).join('|'),
    reducedMotion,
  ]);

  const handleReplay = useCallback(() => {
    setReplayOverlay(true);
    pushCommentary('REPLAY: melhor momento da pista');
    window.setTimeout(() => setReplayOverlay(false), 3200);
  }, [pushCommentary]);

  const transition = reducedMotion
    ? { duration: 0, type: 'tween' as const }
    : { type: 'spring' as const, stiffness: 70, damping: 18, duration: 0.8 };

  return (
    <div
      className={`relative w-full h-full rounded-3xl overflow-hidden border border-border/60 bg-[hsl(var(--race-grass))] ${shaking && !reducedMotion ? 'race-screen-shake' : ''}`}
      style={{
        boxShadow:
          '0 24px 60px -20px hsl(var(--race-grass-shadow) / 0.55), inset 0 0 0 1px hsl(var(--race-asphalt-edge) / 0.08)',
        filter: 'saturate(1.08) contrast(1.02)',
      }}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          scale:
            (zoomActive || cinematicFocus) && !reducedMotion
              ? cinematicFocus
                ? 1.04
                : 1.12
              : 1,
        }}
        transition={{ duration: cinematicFocus ? 1.8 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: leaderPos
            ? `${(leaderPos.x / TRACK_VIEWBOX.width) * 100}% ${(leaderPos.y / TRACK_VIEWBOX.height) * 100}%`
            : '50% 50%',
          animation: reducedMotion
            ? undefined
            : 'race-cinematic-intro 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
          boxShadow:
            cinematicFocus && !reducedMotion
              ? 'inset 0 0 120px 30px hsl(0 0% 0% / 0.45)'
              : undefined,
        }}
      >
        <RaceTrack
          yellowFlag={currentFlag === 'yellow'}
          waveTrigger={waveTrigger}
          leaderName={leader?.salesperson_name}
          leaderGap={
            gapToSecond !== null && gapToSecond > 0
              ? `+${(gapToSecond * 100).toFixed(2)}%`
              : undefined
          }
        >
          <TrackTireMarks cars={tireMarkCars} />
          <TrackDustParticles cars={tireMarkCars} />
          <DRSZoneOverlay />
          {leader && !reducedMotion && (
            <LeaderNeonTrail
              leaderId={leader.car_id}
              leaderProgress={Number(leader.progress)}
              color={leader.primary_color}
            />
          )}

          <RaceCarsLayer
            sorted={sorted}
            boostingIds={boostingIds}
            currentUserSalespersonId={currentUserSalespersonId}
            allReactions={allReactions}
            colorblindMode={colorblindMode}
            flashingCars={flashingCars}
            tireWearByCar={tireWearByCar}
            drsActiveByCar={drsActiveByCar}
            pitStopCars={pitStopCars}
            fastestCarId={fastestCarId}
            aeroTurbByCar={aeroTurbByCar}
            seasonId={seasonId}
            reducedMotion={reducedMotion}
            transition={transition}
          />

          <RaceTrackEffects
            leaderPos={leaderPos}
            noFx={noFx}
            dustBursts={dustBursts}
            sectorBadges={sectorBadges}
          />

          {showGapLine && leaderPosForLine && secondPos && (
            <g pointerEvents="none">
              <line
                x1={leaderPosForLine.x}
                y1={leaderPosForLine.y}
                x2={secondPos.x}
                y2={secondPos.y}
                stroke="hsl(45 95% 55%)"
                strokeWidth={2}
                strokeDasharray="6 5"
                opacity={0.85}
              />
            </g>
          )}

          {leader && second && !reducedMotion && (
            <SlipstreamLines
              leaderProgress={Number(leader.progress)}
              chaserProgress={Number(second.progress)}
            />
          )}

          {leader && second && (
            <LeaderGapIndicator
              leaderProgress={Number(leader.progress)}
              secondProgress={Number(second.progress)}
            />
          )}

          {overlayChildren}
        </RaceTrack>
        {weatherOverlay}
      </motion.div>

      <RaceArenaOverlays
        yellowFlag={currentFlag === 'yellow' && !reducedMotion}
        replayOverlay={replayOverlay}
        showFinaleFlag={showFinaleFlag}
      />

      <RaceLapBadge
        current={lapInfo.current}
        total={lapInfo.total}
        isFocus={viewMode.isFocus}
      />

      <RaceControlPanel
        flag={currentFlag}
        startedAt={seasonStartedAt}
        endsAt={seasonEndsAt}
        overtakesTotal={overtakesTotal}
      />

      {!viewMode.isFocus && <NextCornerHUD info={nextCornerInfo} />}

      {flashSectorIdx !== null && !reducedMotion && (
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 z-20 rounded-md px-2 py-0.5 border border-border/50"
          style={{
            background: 'hsl(271 91% 55%)',
            animation: 'race-fastest-sector-flash 0.5s ease-in-out infinite',
          }}
          aria-label={`Setor ${flashSectorIdx + 1} mais rápido`}
        >
          <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white">
            Fastest S{flashSectorIdx + 1}
          </span>
        </div>
      )}

      {!viewMode.isFocus && (
        <SpeedHUD
          speedKmh={leaderSpeed}
          leaderName={leader?.salesperson_name?.split(' ')[0]}
        />
      )}

      <RaceMiniMap cars={sorted} currentUserSalespersonId={currentUserSalespersonId} />

      {!viewMode.isFocus && (
        <LapCounterBadge current={lapInfo.current} total={lapInfo.total} />
      )}

      {viewMode.showTicker && <RaceEventTicker events={tickerEvents} />}

      <RaceLiveTiming entries={top5} leaderProgress={leaderProgress} />

      {viewMode.showCommentary && <CommentaryBubble line={commentary} />}

      <ReplayButton
        onClick={handleReplay}
        disabled={!lastOvertakeRef.current}
        isPlaying={replayOverlay}
      />

      <StartLights trigger={startLightsTrigger} />

      <Fireworks active={showFireworks && !calm} />

      <RaceCountdownBadge endsAt={seasonEndsAt} />

      <RaceMuteToggle muted={muted} onToggle={toggleMute} />

      <RaceReplayButton
        onClick={replay.startReplay}
        disabled={!replay.hasReplay}
        isPlaying={replay.isPlaying}
      />

      {pitStopCars.size > 0 &&
        (() => {
          const firstId = Array.from(pitStopCars)[0];
          const pilot = sorted.find(c => c.car_id === firstId);
          return (
            <PitLane
              count={pitStopCars.size}
              pilotName={pilot?.salesperson_name?.split(' ')[0]}
            />
          );
        })()}

      {telemetry && viewMode.showFullTelemetry && (
        <MyTelemetryPanel
          avgDealsPerDay={telemetry.avgDealsPerDay}
          bestLap={telemetry.bestLap}
          ghostDeltaPp={telemetry.ghostDeltaPp}
          tireFatigue={telemetry.tireFatigue}
          nextGoalLabel={telemetry.nextGoalLabel}
          nextGoalPercent={telemetry.nextGoalPercent}
        />
      )}

      {viewMode.showBroadcast && (
        <BroadcastOverlay events={broadcastEvents} flag={currentFlag} />
      )}

      <RaceEasterEggs showFireworks={showFireworks} />
    </div>
  );
}
