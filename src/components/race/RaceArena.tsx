import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCar } from './RaceCar';
import { ReactionFloater } from './ReactionFloater';
import { ReactionBar } from './ReactionBar';
import { RaceMiniMap } from './RaceMiniMap';
import { CommentaryBubble, type CommentaryLine } from './CommentaryBubble';
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
import { CarExhaust } from './CarExhaust';
import { RaceCountdownBadge } from './RaceCountdownBadge';
import { RaceEventTicker, type RaceTickerEvent } from './RaceEventTicker';
import { DRSZoneOverlay } from './DRSZoneOverlay';
import { LeaderNeonTrail } from './LeaderNeonTrail';
import { LapCounterBadge } from './LapCounterBadge';
import { BroadcastOverlay, type BroadcastEvent } from './BroadcastOverlay';
import { MyTelemetryPanel } from './MyTelemetryPanel';
import { PitLane } from './PitLane';
import { RaceMuteToggle } from './RaceMuteToggle';
import { RaceReplayButton } from './RaceReplayButton';
import { RaceEasterEggs } from './RaceEasterEggs';
import { useScreenShake } from '@/hooks/race/useScreenShake';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useRaceReplay } from '@/hooks/race/useRaceReplay';
import {
  getPositionOnTrack, detectOvertakes, CHECKPOINTS, TRACK_VIEWBOX,
  SECTOR_BOUNDARIES, isInDRSZone, computeLapInfo, makeCommentaryLine,
  getNextCornerInfo,
} from './raceTrackHelpers';
import { useRaceReactions } from '@/hooks/race/useRaceReactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRaceViewMode } from '@/hooks/race/useRaceViewMode';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

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

const PATTERN_BY_NUMBER = ['stripes', 'dots', 'checker'] as const;

export function RaceArena({
  cars, boostingIds, currentUserSalespersonId, overlayChildren, weatherOverlay,
  colorblindMode = false, seasonId = null, seasonStartedAt = null, seasonEndsAt = null,
  telemetry,
}: RaceArenaProps) {
  const sorted = [...cars].sort((a, b) => Number(b.progress) - Number(a.progress));
  const reducedMotion = useReducedMotion();
  // Frente A — modo de visualização (default 'focus' = decluttered).
  const viewMode = useRaceViewMode();
  const carIds = sorted.map((c) => c.car_id);
  const { data: reactionsData = [], liveBurst } = useRaceReactions(carIds, seasonId);
  const allReactions = [...liveBurst, ...reactionsData];
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);

  // ----- Detecção de ultrapassagens (flash + dust) -----
  const prevSnapshotRef = useRef<Array<{ id: string; progress: number }>>([]);
  const [flashingCars, setFlashingCars] = useState<Set<string>>(new Set());
  const [dustBursts, setDustBursts] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [sectorBadges, setSectorBadges] = useState<Array<{ id: string; name: string; x: number; y: number }>>([]);
  const [commentary, setCommentary] = useState<CommentaryLine | null>(null);
  const commentaryTimerRef = useRef<number | null>(null);
  const [replayOverlay, setReplayOverlay] = useState(false);
  const lastOvertakeRef = useRef<{ attacker: string; defender: string; at: number } | null>(null);
  const [finaleShown, setFinaleShown] = useState(false);
  const [showFinaleFlag, setShowFinaleFlag] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [startLightsTrigger, setStartLightsTrigger] = useState(0);
  const prevLeaderIdRef = useRef<string | null>(null);
  // Pit-stop tracking: timestamp do último progresso para cada carro
  const pitTrackRef = useRef<Map<string, { lastProgress: number; stalledSince: number }>>(new Map());
  const [pitStopCars, setPitStopCars] = useState<Set<string>>(new Set());

  // Race Control: contador de overtakes + bandeira atual
  const [overtakesTotal, setOvertakesTotal] = useState(0);
  const [yellowFlagUntil, setYellowFlagUntil] = useState<number>(0);
  // Velocidade simulada do líder (km/h)
  const [leaderSpeed, setLeaderSpeed] = useState(0);
  const lastLeaderProgressRef = useRef<{ progress: number; at: number } | null>(null);

  // Ticker de eventos ao vivo (top 3, expira após 12s — gerenciado pelo componente)
  const [tickerEvents, setTickerEvents] = useState<RaceTickerEvent[]>([]);
  const pushTickerEvent = useCallback((text: string, icon?: string) => {
    setTickerEvents((prev) =>
      [{ id: `${Date.now()}-${Math.random()}`, text, icon, at: Date.now() }, ...prev].slice(0, 8),
    );
  }, []);

  // Screen shake em ultrapassagens top-3
  const { shaking, trigger: triggerShake } = useScreenShake(280);

  // Sons sintéticos da corrida (mute persistido em localStorage)
  const { muted, toggleMute, play } = useRaceSounds();
  const playRef = useRef(play);
  useEffect(() => { playRef.current = play; }, [play]);

  // Replay 4s das últimas posições
  const replay = useRaceReplay();
  // Grava snapshot a cada update de leaderboard
  useEffect(() => {
    if (cars.length > 0) replay.recordSnapshot(cars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.map((c) => `${c.car_id}:${Math.floor(Number(c.progress) * 100)}`).join('|')]);

  // Eventos de broadcast (rotativos)
  const [broadcastEvents, setBroadcastEvents] = useState<BroadcastEvent[]>([]);
  const pushBroadcast = useCallback((evt: Omit<BroadcastEvent, 'id'>) => {
    setBroadcastEvents((prev) => {
      const id = `${Date.now()}-${Math.random()}`;
      return [{ id, ...evt }, ...prev].slice(0, 5);
    });
  }, []);
  // Auto-cleanup eventos > 60s
  useEffect(() => {
    const id = window.setInterval(() => {
      const cutoff = Date.now() - 60_000;
      setBroadcastEvents((prev) =>
        prev.filter((e) => Number(e.id.split('-')[0]) > cutoff),
      );
    }, 8_000);
    return () => window.clearInterval(id);
  }, []);

  // Ciclo 47-52: la-ola, fastest sector, cinematic camera
  const [waveTrigger, setWaveTrigger] = useState(0);
  const lastLapCompletedRef = useRef<number>(0);
  const [fastestCarId, setFastestCarId] = useState<string | null>(null);
  const fastestTimerRef = useRef<number | null>(null);
  // Tempo do líder ao entrar em cada setor (ms) — para detectar setor mais rápido
  const sectorEnterRef = useRef<Map<number, { carId: string; at: number }>>(new Map());
  const bestSectorTimeRef = useRef<Map<number, number>>(new Map());
  const [flashSectorIdx, setFlashSectorIdx] = useState<number | null>(null);
  const [cinematicFocus, setCinematicFocus] = useState(false);
  const cinematicTimerRef = useRef<number | null>(null);
  const lastCinematicAtRef = useRef<number>(0);

  const pushCommentary = useCallback((text: string) => {
    if (!text) return;
    const line: CommentaryLine = { id: `${Date.now()}-${Math.random()}`, text, createdAt: Date.now() };
    setCommentary(line);
    if (commentaryTimerRef.current) window.clearTimeout(commentaryTimerRef.current);
    commentaryTimerRef.current = window.setTimeout(() => {
      setCommentary((cur) => (cur?.id === line.id ? null : cur));
    }, 3000);
  }, []);

  const wearTrackRef = useRef<Map<string, { lastProgress: number; smoothDelta: number }>>(new Map());
  const tireWearByCar = useMemo(() => {
    const map = new Map<string, number>();
    sorted.forEach((c) => {
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
      // wear: 1 quando consistente; degrada conforme distância da média
      const avg = sorted.reduce((acc, x) => acc + Number(x.progress), 0) / Math.max(1, sorted.length);
      const lag = Math.max(0, avg - p);
      const wear = Math.max(0.15, Math.min(1, 1 - lag * 1.4));
      map.set(c.car_id, wear);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted.map((c) => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')]);

  useEffect(() => {
    const curr = sorted.map((c) => ({ id: c.car_id, progress: Number(c.progress) }));
    const prev = prevSnapshotRef.current;
    if (prev.length > 0 && !reducedMotion) {
      const overtakes = detectOvertakes(prev, curr);
      if (overtakes.length > 0) {
        // Race Control: incrementa contador + dispara bandeira amarela 3s
        setOvertakesTotal((n) => n + overtakes.length);
        setYellowFlagUntil(Date.now() + 3000);
        const newFlash = new Set(flashingCars);
        overtakes.forEach((o) => newFlash.add(o.overtaker));
        setFlashingCars(newFlash);
        setTimeout(() => {
          setFlashingCars((s) => {
            const next = new Set(s);
            overtakes.forEach((o) => next.delete(o.overtaker));
            return next;
          });
        }, 700);
        // narração + grava último overtake p/ replay + ticker + screen shake top-3
        const o = overtakes[0];
        const attackerName = sorted.find((c) => c.car_id === o.overtaker)?.salesperson_name;
        const defenderName = sorted.find((c) => c.car_id === o.overtaken)?.salesperson_name;
        const inDRS = isInDRSZone(curr.find((x) => x.id === o.overtaker)?.progress ?? 0);
        pushCommentary(makeCommentaryLine({
          type: inDRS ? 'drs' : 'overtake',
          attacker: attackerName,
          defender: defenderName,
        }));
        // Ticker resumido
        if (attackerName && defenderName) {
          pushTickerEvent(
            `${attackerName.split(' ')[0]} ultrapassou ${defenderName.split(' ')[0]}`,
            inDRS ? '⚡' : '🏁',
          );
        }
        // Screen shake apenas se overtake afeta posições top-3
        const sortedCurr = [...curr].sort((a, b) => b.progress - a.progress);
        const overtakerNewRank = sortedCurr.findIndex((x) => x.id === o.overtaker);
        if (overtakerNewRank >= 0 && overtakerNewRank < 3 && !reducedMotion) {
          triggerShake();
          // Sound: overtake top-3
          playRef.current('overtake');
          // Broadcast event
          if (attackerName && defenderName) {
            pushBroadcast({
              kind: 'overtake',
              title: `${attackerName.split(' ')[0]} ULTRAPASSOU ${defenderName.split(' ')[0]}`,
              detail: inDRS ? `Zona DRS · P${overtakerNewRank + 1}` : `Manobra limpa · P${overtakerNewRank + 1}`,
            });
          }
        }
        lastOvertakeRef.current = { attacker: o.overtaker, defender: o.overtaken, at: Date.now() };
      }
      // dust quando carro cruza um checkpoint (curva)
      const newDust: Array<{ id: string; x: number; y: number }> = [];
      curr.forEach((c) => {
        const p = prev.find((x) => x.id === c.id);
        if (!p) return;
        for (const cp of CHECKPOINTS) {
          if (p.progress < cp && c.progress >= cp) {
            const pos = getPositionOnTrack(cp, 0);
            newDust.push({ id: `${c.id}-${cp}-${Date.now()}`, x: pos.x, y: pos.y });
          }
        }
      });
      if (newDust.length > 0) {
        setDustBursts((d) => [...d, ...newDust]);
        setTimeout(() => {
          setDustBursts((d) => d.filter((b) => !newDust.find((nb) => nb.id === b.id)));
        }, 1200);
      }

      // ----- Setores cronometrados (apenas líder dispara badge) -----
      const leaderCurr = curr[0];
      const leaderPrev = prev.find((x) => x.id === leaderCurr?.id);
      if (leaderCurr && leaderPrev) {
        SECTOR_BOUNDARIES.forEach((b, i) => {
          if (leaderPrev.progress < b && leaderCurr.progress >= b) {
            const pos = getPositionOnTrack(b, 0);
            const name = `S${i + 1}`;
            const badgeId = `${leaderCurr.id}-${name}-${Date.now()}`;
            setSectorBadges((arr) => [...arr, { id: badgeId, name, x: pos.x, y: pos.y }]);
            setTimeout(() => {
              setSectorBadges((arr) => arr.filter((bd) => bd.id !== badgeId));
            }, 900);
            const lname = sorted.find((c) => c.car_id === leaderCurr.id)?.salesperson_name;
            pushCommentary(makeCommentaryLine({ type: 'sector', leader: lname, sector: name }));

            // ===== FASTEST SECTOR detection =====
            const now = Date.now();
            const prevEnter = sectorEnterRef.current.get(i);
            if (prevEnter && prevEnter.carId === leaderCurr.id) {
              const sectorTime = now - prevEnter.at;
              const best = bestSectorTimeRef.current.get(i);
              if (sectorTime > 200 && (best === undefined || sectorTime < best)) {
                bestSectorTimeRef.current.set(i, sectorTime);
                // flash setor + badge FASTEST
                setFlashSectorIdx(i);
                setFastestCarId(leaderCurr.id);
                if (fastestTimerRef.current) window.clearTimeout(fastestTimerRef.current);
                fastestTimerRef.current = window.setTimeout(() => {
                  setFlashSectorIdx(null);
                  setFastestCarId(null);
                }, 2000);
              }
            }
            sectorEnterRef.current.set(i, { carId: leaderCurr.id, at: now });

            // ===== CINEMATIC FOCUS no setor 3 (final da volta, i==2) =====
            if (i === 2 && now - lastCinematicAtRef.current > 8000) {
              lastCinematicAtRef.current = now;
              setCinematicFocus(true);
              if (cinematicTimerRef.current) window.clearTimeout(cinematicTimerRef.current);
              cinematicTimerRef.current = window.setTimeout(() => setCinematicFocus(false), 1800);
            }
          }
        });

        // ===== LA OLA: dispara quando líder completa uma volta (cruza 0) =====
        if (leaderCurr.progress > 1 && Math.floor(leaderCurr.progress) > lastLapCompletedRef.current) {
          lastLapCompletedRef.current = Math.floor(leaderCurr.progress);
          setWaveTrigger((n) => n + 1);
        }
      }
      // ----- Mudança de líder -----
      const newLeaderId = leaderCurr?.id ?? null;
      if (newLeaderId && prevLeaderIdRef.current && newLeaderId !== prevLeaderIdRef.current) {
        const lname = sorted.find((c) => c.car_id === newLeaderId)?.salesperson_name;
        pushCommentary(makeCommentaryLine({ type: 'leader', leader: lname }));
        if (lname) pushTickerEvent(`${lname.split(' ')[0]} assumiu P1`, '👑');
        // Sound + broadcast: leader takeover
        playRef.current('leader_takeover');
        if (lname) {
          pushBroadcast({
            kind: 'leader',
            title: `${lname.split(' ')[0]} ASSUMIU A LIDERANÇA`,
            detail: 'Tomada de P1 ao vivo',
          });
        }
      }
      if (newLeaderId) prevLeaderIdRef.current = newLeaderId;
    }
    prevSnapshotRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted.map((c) => `${c.car_id}:${c.progress}`).join('|'), reducedMotion]);

  // ----- Spotlight do líder -----
  const leader = sorted[0];
  const leaderPos = useMemo(
    () => (leader ? getPositionOnTrack(Number(leader.progress), 0) : null),
    [leader?.car_id, leader?.progress],
  );

  // ----- Lap info -----
  const lapInfo = computeLapInfo(Number(leader?.progress ?? 0), 10);

  // ----- Velocidade simulada do líder (delta progresso × 1000 → km/h) -----
  useEffect(() => {
    if (!leader) return;
    const now = Date.now();
    const p = Number(leader.progress);
    const prev = lastLeaderProgressRef.current;
    if (prev) {
      const dt = (now - prev.at) / 1000; // segundos
      const dp = Math.max(0, p - prev.progress);
      if (dt > 0.05) {
        // Conversão arbitrária: 1% de progresso em 1s ≈ 220 km/h.
        const kmh = (dp / dt) * 22000;
        // suavização exponencial
        setLeaderSpeed((s) => s * 0.7 + Math.min(360, kmh) * 0.3);
        lastLeaderProgressRef.current = { progress: p, at: now };
      }
    } else {
      lastLeaderProgressRef.current = { progress: p, at: now };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leader?.car_id, leader?.progress]);

  // Decay quando ninguém atualiza
  useEffect(() => {
    const id = window.setInterval(() => {
      setLeaderSpeed((s) => (s > 1 ? s * 0.92 : 0));
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  // ----- Bandeira atual da corrida -----
  const currentFlag: RaceFlag = useMemo(() => {
    if (showFinaleFlag) return 'checkered';
    if (Date.now() < yellowFlagUntil) return 'yellow';
    return 'green';
  }, [showFinaleFlag, yellowFlagUntil, /* re-render trigger: */ leaderSpeed]);

  // Snapshot atual de carros para tire marks
  const tireMarkCars = useMemo(
    () => sorted.map((c) => ({ id: c.car_id, progress: Number(c.progress) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted.map((c) => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')],
  );

  // ----- DRS: ativo quando carro está em zona DRS e tem alguém < 0.06 à frente -----
  const drsActiveByCar = useMemo(() => {
    const map = new Map<string, boolean>();
    sorted.forEach((c, idx) => {
      if (idx === 0) { map.set(c.car_id, false); return; }
      const ahead = sorted[idx - 1];
      const gap = Number(ahead.progress) - Number(c.progress);
      map.set(c.car_id, isInDRSZone(Number(c.progress)) && gap > 0 && gap < 0.06);
    });
    return map;
  }, [sorted.map((c) => `${c.car_id}:${Math.floor(Number(c.progress) * 200)}`).join('|')]);

  // ----- Timing tower: 3 em focus/immersive, 5 em competitive/analysis -----
  const timingCount = viewMode.isFocus || viewMode.isImmersive ? 3 : 5;
  const top5 = sorted.slice(0, timingCount);
  const leaderProgress = Number(top5[0]?.progress ?? 0);

  // ----- Gap line líder→2º (apenas se gap < 0.05) -----
  const second = sorted[1];
  const gapToSecond = leader && second ? Number(leader.progress) - Number(second.progress) : null;
  const showGapLine = gapToSecond !== null && gapToSecond > 0 && gapToSecond < 0.05;
  const gapMidPos = useMemo(() => {
    if (!showGapLine || !leader || !second) return null;
    const midProgress = (Number(leader.progress) + Number(second.progress)) / 2;
    return getPositionOnTrack(midProgress, 0);
  }, [showGapLine, leader?.progress, second?.progress]);
  const leaderPosForLine = useMemo(
    () => (leader ? getPositionOnTrack(Number(leader.progress), 0) : null),
    [leader?.car_id, leader?.progress],
  );
  const secondPos = useMemo(
    () => (second ? getPositionOnTrack(Number(second.progress), 0) : null),
    [second?.car_id, second?.progress],
  );

  // ----- Câmera dinâmica (zoom no líder em disputa apertada) -----
  const closeBattle = sorted.length >= 2
    ? (Number(sorted[0].progress) - Number(sorted[1].progress)) < 0.03
    : false;
  const [zoomActive, setZoomActive] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    if (closeBattle && !zoomActive) {
      setZoomActive(true);
      const t = window.setTimeout(() => setZoomActive(false), 2000);
      return () => window.clearTimeout(t);
    }
  }, [closeBattle, reducedMotion, zoomActive]);

  // ----- Cinematic focus quando líder abre gap >5% -----
  useEffect(() => {
    if (reducedMotion || !gapToSecond) return;
    const now = Date.now();
    if (gapToSecond > 0.05 && now - lastCinematicAtRef.current > 8000) {
      lastCinematicAtRef.current = now;
      setCinematicFocus(true);
      if (cinematicTimerRef.current) window.clearTimeout(cinematicTimerRef.current);
      cinematicTimerRef.current = window.setTimeout(() => setCinematicFocus(false), 1800);
    }
  }, [gapToSecond, reducedMotion]);

  // ----- Próxima curva para o usuário logado -----
  const currentUserCar = useMemo(
    () => sorted.find((c) => c.salesperson_id === currentUserSalespersonId),
    [sorted, currentUserSalespersonId],
  );
  const nextCornerInfo = useMemo(
    () => (currentUserCar ? getNextCornerInfo(Number(currentUserCar.progress)) : null),
    [currentUserCar?.car_id, currentUserCar?.progress],
  );

  // ----- Aero turbulence: top 3 + DRS ativo -----
  const aeroTurbByCar = useMemo(() => {
    const map = new Map<string, boolean>();
    sorted.forEach((c, idx) => {
      map.set(c.car_id, idx < 3 && (drsActiveByCar.get(c.car_id) ?? false));
    });
    return map;
  }, [sorted, drsActiveByCar]);

  // ----- Bandeira de chegada (líder >= 0.95) -----
  useEffect(() => {
    if (finaleShown || reducedMotion) return;
    if (leaderProgress >= 0.95) {
      setFinaleShown(true);
      setShowFinaleFlag(true);
      setShowFireworks(true);
      const lname = sorted[0]?.salesperson_name;
      pushCommentary(makeCommentaryLine({ type: 'finale', leader: lname }));
      // Sound + broadcast: season end
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
      return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    }
  }, [leaderProgress, finaleShown, reducedMotion, sorted, pushCommentary, pushBroadcast]);

  // Gap apertado (< 1%) → broadcast event "BATTLE"
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

  // ----- Start lights: dispara 1x ao montar -----
  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setTimeout(() => setStartLightsTrigger(1), 600);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  // ----- Pit-stop detector: carro estagnado >3s vai pra "pit" 1.5s -----
  useEffect(() => {
    if (reducedMotion) return;
    const now = Date.now();
    const next = new Set(pitStopCars);
    let mutated = false;
    sorted.forEach((c) => {
      const prev = pitTrackRef.current.get(c.car_id);
      const p = Number(c.progress);
      if (!prev) {
        pitTrackRef.current.set(c.car_id, { lastProgress: p, stalledSince: now });
        return;
      }
      const moved = Math.abs(p - prev.lastProgress) > 0.0005;
      if (moved) {
        pitTrackRef.current.set(c.car_id, { lastProgress: p, stalledSince: now });
        if (next.has(c.car_id)) { next.delete(c.car_id); mutated = true; }
      } else {
        const stalledFor = now - prev.stalledSince;
        if (stalledFor > 3000 && !next.has(c.car_id) && p > 0.02 && p < 0.98) {
          next.add(c.car_id);
          mutated = true;
          // limpa após 1.5s
          window.setTimeout(() => {
            setPitStopCars((s) => {
              const n = new Set(s);
              n.delete(c.car_id);
              return n;
            });
            // reset stall timer p/ não disparar imediatamente
            const cur = pitTrackRef.current.get(c.car_id);
            if (cur) pitTrackRef.current.set(c.car_id, { ...cur, stalledSince: Date.now() });
          }, 1500);
        }
      }
    });
    if (mutated) setPitStopCars(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted.map((c) => `${c.car_id}:${Math.floor(Number(c.progress) * 500)}`).join('|'), reducedMotion]);

  // ----- Replay -----
  const handleReplay = useCallback(() => {
    if (!lastOvertakeRef.current) return;
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
        animate={{ scale: (zoomActive || cinematicFocus) && !reducedMotion ? (cinematicFocus ? 1.04 : 1.12) : 1 }}
        transition={{ duration: cinematicFocus ? 1.8 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: leaderPos
            ? `${(leaderPos.x / TRACK_VIEWBOX.width) * 100}% ${(leaderPos.y / TRACK_VIEWBOX.height) * 100}%`
            : '50% 50%',
          animation: reducedMotion
            ? undefined
            : 'race-cinematic-intro 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
          boxShadow: cinematicFocus && !reducedMotion ? 'inset 0 0 120px 30px hsl(0 0% 0% / 0.45)' : undefined,
        }}
      >
      <RaceTrack
        yellowFlag={currentFlag === 'yellow'}
        waveTrigger={waveTrigger}
        leaderName={leader?.salesperson_name}
        leaderGap={gapToSecond !== null && gapToSecond > 0 ? `+${(gapToSecond * 100).toFixed(2)}%` : undefined}
      >
        {/* Tire marks (rastros de pneu nas curvas) — abaixo dos carros */}
        <TrackTireMarks cars={tireMarkCars} />
        {/* Poeira/fumaça nas curvas — sobre os rastros, abaixo dos carros */}
        <TrackDustParticles cars={tireMarkCars} />
        {/* DRS Zone overlay translúcido + label */}
        <DRSZoneOverlay />
        {/* Ghost trail neon do líder */}
        {leader && !reducedMotion && (
          <LeaderNeonTrail
            leaderId={leader.car_id}
            leaderProgress={Number(leader.progress)}
            color={leader.primary_color}
          />
        )}
        {sorted.map((car, idx) => {
          const lane = (idx - sorted.length / 2) * 8;
          const pos = getPositionOnTrack(Number(car.progress), lane);
          const isMe = currentUserSalespersonId && car.salesperson_id === currentUserSalespersonId;
          const carReactions = allReactions.filter((r) => r.target_car_id === car.car_id);
          const pattern = colorblindMode ? PATTERN_BY_NUMBER[car.car_number % PATTERN_BY_NUMBER.length] : null;
          return (
            <motion.g
              key={car.car_id}
              initial={false}
              animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
              transition={transition}
              onMouseEnter={() => setHoveredCar(car.car_id)}
              onMouseLeave={() => setHoveredCar((c) => (c === car.car_id ? null : c))}
              style={{ cursor: 'pointer' }}
            >
              {isMe && (
                <>
                  <motion.circle
                    r={38}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    opacity={0.85}
                    animate={reducedMotion ? undefined : { r: [34, 46, 34], opacity: [0.9, 0.25, 0.9] }}
                    transition={reducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    r={28}
                    fill="hsl(var(--primary))"
                    opacity={0.18}
                    animate={reducedMotion ? undefined : { opacity: [0.25, 0.08, 0.25] }}
                    transition={reducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}
              {/* Sombra sob o carro — elipse escura translúcida para ancorar no asfalto */}
              <ellipse
                cx={1.5}
                cy={4}
                rx={15}
                ry={4.5}
                fill="hsl(0 0% 0%)"
                opacity={0.28}
                style={{ filter: 'blur(1.5px)' }}
                pointerEvents="none"
              />
              {/* Exhaust trail + chama (intensidade aumenta com posição/velocidade) */}
              <CarExhaust
                intensity={Math.max(0.4, 1 - idx * 0.08)}
                hidden={pitStopCars.has(car.car_id)}
              />
              <RaceCar
                number={car.car_number}
                primaryColor={car.primary_color}
                secondaryColor={car.secondary_color}
                style={car.car_style}
                showTrail={boostingIds?.has(car.salesperson_id) ?? false}
                pattern={pattern}
                overtakeFlash={flashingCars.has(car.car_id)}
                tireWear={tireWearByCar.get(car.car_id) ?? 1}
                drsActive={drsActiveByCar.get(car.car_id) ?? false}
                rank={idx + 1}
                pitStop={pitStopCars.has(car.car_id)}
                fastestSector={fastestCarId === car.car_id}
                aeroTurbulence={aeroTurbByCar.get(car.car_id) ?? false}
              />
              {/* contador de reactions recentes */}
              {carReactions.length > 0 && (
                <g transform="translate(20, -32)">
                  <rect x={-10} y={-8} width={20} height={14} rx={7} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />
                  <text y={2} textAnchor="middle" fontSize={9} fontWeight={800} fill="hsl(var(--foreground))" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {carReactions.length}
                  </text>
                </g>
              )}
              <ReactionFloater reactions={carReactions} />
              {isMe && (
                <g transform={`rotate(${-pos.rotation}) translate(0, -42)`}>
                  <rect x={-18} y={-9} width={36} height={14} rx={7}
                    fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={1.5} />
                  <text y={1} textAnchor="middle" fontSize={9} fontWeight={900}
                    fill="hsl(var(--primary-foreground))"
                    style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}>
                    VOCÊ
                  </text>
                </g>
              )}
              {/* Label do piloto: counter-rotate para sempre ficar horizontal, com chip de fundo */}
              <g transform={`rotate(${-pos.rotation})`}>
                {(() => {
                  const name = car.salesperson_name?.split(' ')[0] ?? '';
                  const chipW = Math.max(38, name.length * 7 + 12);
                  const yBase = isMe ? -52 : -28;
                  return (
                    <>
                      <rect
                        x={-chipW / 2}
                        y={yBase - 9}
                        width={chipW}
                        height={14}
                        rx={7}
                        fill="hsl(var(--background) / 0.85)"
                        stroke="hsl(var(--border))"
                        strokeWidth={0.8}
                      />
                      <text
                        y={yBase + 1}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={700}
                        fill="hsl(var(--foreground))"
                        style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.02em' }}
                      >
                        {name}
                      </text>
                    </>
                  );
                })()}
              </g>

              {/* HTML overlay para barra de reactions */}
              <foreignObject x={-50} y={20} width={100} height={36} style={{ overflow: 'visible' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ReactionBar carId={car.car_id} seasonId={seasonId} visible={hoveredCar === car.car_id} />
                </div>
              </foreignObject>
            </motion.g>
          );
        })}

        {/* Spotlight cinematográfico que segue o líder */}
        {leaderPos && !reducedMotion && (
          <motion.circle
            cx={leaderPos.x}
            cy={leaderPos.y}
            r={120}
            fill="url(#leaderSpotlight)"
            initial={false}
            animate={{ cx: leaderPos.x, cy: leaderPos.y }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            pointerEvents="none"
          />
        )}

        {/* Dust particles nos checkpoints (curvas) */}
        <AnimatePresence>
          {dustBursts.map((burst) => (
            <g key={burst.id} transform={`translate(${burst.x} ${burst.y})`} pointerEvents="none">
              {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2;
                const dx = Math.cos(angle) * 18;
                const dy = Math.sin(angle) * 12 - 8;
                return (
                  <motion.circle
                    key={i}
                    r={3 + i * 0.5}
                    fill="hsl(var(--race-runoff))"
                    filter="url(#dustBlur)"
                    initial={{ x: 0, y: 0, opacity: 0.7 }}
                    animate={{ x: dx, y: dy, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.04 }}
                  />
                );
              })}
            </g>
          ))}
        </AnimatePresence>

        {/* Sector badges (S1/S2/S3 ✓) — flutuam rapidamente quando o líder cruza */}
        <AnimatePresence>
          {sectorBadges.map((b) => (
            <motion.g
              key={b.id}
              transform={`translate(${b.x} ${b.y})`}
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: -10 }}
              exit={{ opacity: 0, scale: 0.95, y: -22 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              pointerEvents="none"
            >
              <rect x={-22} y={-12} width={44} height={18} rx={4}
                fill="hsl(142 76% 38%)" stroke="hsl(0 0% 100%)" strokeWidth={1.2} />
              <text y={1} textAnchor="middle" fontSize={10} fontWeight={900}
                fill="hsl(0 0% 100%)"
                style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em' }}>
                {b.name} ✓
              </text>
            </motion.g>
          ))}
        </AnimatePresence>

        {/* ===== Gap line líder→2º (apenas em disputa apertada) ===== */}
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

        {/* ===== Slipstream: linhas de vento atrás do líder quando 2º está colado ===== */}
        {leader && second && !reducedMotion && (
          <SlipstreamLines
            leaderProgress={Number(leader.progress)}
            chaserProgress={Number(second.progress)}
          />
        )}

        {/* ===== Badge "+X.Xs" entre 1º e 2º quando gap < 5% ===== */}
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

      {/* ===== Sombra dinâmica do sol (gradiente radial canto superior direito) ===== */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] rounded-3xl"
        style={{
          background:
            'radial-gradient(circle at 92% 8%, hsl(48 100% 75% / 0.22) 0%, hsl(45 95% 65% / 0.08) 30%, transparent 65%)',
          mixBlendMode: 'screen',
        }}
        aria-hidden
      />

      {/* ===== Overlay amarelo translúcido durante bandeira amarela ===== */}
      {currentFlag === 'yellow' && !reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-[6] rounded-3xl"
          style={{
            background: 'hsl(45 95% 55% / 0.15)',
            animation: 'race-track-yellow-overlay 0.7s ease-in-out infinite',
          }}
          aria-hidden
        />
      )}

      {/* ===== LAP counter HUD (topo central) — título dominante em focus ===== */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-border/50 backdrop-blur-md shadow-lg"
        style={{
          background: 'hsl(var(--background) / 0.78)',
          padding: viewMode.isFocus ? '6px 14px' : '6px 12px',
        }}
        aria-label={`Volta ${lapInfo.current} de ${lapInfo.total}`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Lap
          </span>
          <span
            className={`tabular-nums text-foreground ${viewMode.isFocus ? 'text-[18px] font-black' : 'text-[15px] font-black'}`}
            style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.02em' }}
          >
            {lapInfo.current}
            <span className="text-muted-foreground/70 font-normal">/{lapInfo.total}</span>
          </span>
        </div>
      </div>

      {/* ===== Race Control panel (lateral esquerda) ===== */}
      <RaceControlPanel
        flag={currentFlag}
        startedAt={seasonStartedAt}
        endsAt={seasonEndsAt}
        overtakesTotal={overtakesTotal}
      />

      {/* ===== Próxima curva HUD — gateado em modo focus ===== */}
      {!viewMode.isFocus && <NextCornerHUD info={nextCornerInfo} />}

      {/* ===== Indicador "FASTEST SECTOR" piscando (topo central abaixo do Lap) ===== */}
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


      {/* ===== Speed HUD — gateado em modo focus ===== */}
      {!viewMode.isFocus && (
        <SpeedHUD speedKmh={leaderSpeed} leaderName={leader?.salesperson_name?.split(' ')[0]} />
      )}

      {/* ===== Mini-mapa do circuito ===== */}
      <RaceMiniMap cars={sorted} currentUserSalespersonId={currentUserSalespersonId} />

      {/* ===== Lap counter LED-style — gateado em focus (já existe LAP HUD top-center) ===== */}
      {!viewMode.isFocus && <LapCounterBadge current={lapInfo.current} total={lapInfo.total} />}

      {/* ===== Ticker de eventos ao vivo — gateado por viewMode ===== */}
      {viewMode.showTicker && <RaceEventTicker events={tickerEvents} />}

      {/* ===== Timing tower expandido (top 5 com gaps + delta colorido) ===== */}
      {top5.length > 0 && (
        <div
          className="absolute top-3 right-3 z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-2 shadow-lg"
          style={{
            background: 'hsl(var(--background) / 0.78)',
            minWidth: 210,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              Live Timing
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
          </div>
          <div className="space-y-1">
            {top5.map((c, i) => {
              const gap = i === 0 ? null : leaderProgress - Number(c.progress);
              const gapStr = gap === null ? 'LEADER' : `+${(gap * 100).toFixed(2)}%`;
              const prevPos = prevSnapshotRef.current
                .slice()
                .sort((a, b) => b.progress - a.progress)
                .findIndex((x) => x.id === c.car_id);
              const delta = prevPos >= 0 ? prevPos - i : 0;
              const deltaColor = delta > 0
                ? 'text-emerald-500'
                : delta < 0
                ? 'text-destructive'
                : 'text-muted-foreground/40';
              const deltaIcon = delta > 0 ? '▲' : delta < 0 ? '▼' : '–';
              return (
                <div key={c.car_id} className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-black tabular-nums"
                    style={{
                      backgroundColor: c.primary_color,
                      color: c.secondary_color,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-[11px] font-bold text-foreground">
                    {c.salesperson_name?.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] font-mono font-bold w-3 text-center ${deltaColor}`}>
                    {deltaIcon}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold tabular-nums w-12 text-right ${
                      i === 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {gapStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Comentarista IA — gateado por viewMode ===== */}
      {viewMode.showCommentary && <CommentaryBubble line={commentary} />}

      {/* ===== Replay button ===== */}
      <ReplayButton
        onClick={handleReplay}
        disabled={!lastOvertakeRef.current}
        isPlaying={replayOverlay}
      />

      {/* ===== Replay overlay (borda cinematográfica + slow-mo via filter visual) ===== */}
      <AnimatePresence>
        {replayOverlay && (
          <motion.div
            key="replay-overlay"
            className="pointer-events-none absolute inset-0 z-30 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: 'inset 0 0 0 4px hsl(var(--destructive) / 0.85), inset 0 0 60px hsl(0 0% 0% / 0.45)',
              animation: 'race-replay-pulse 1.4s ease-in-out infinite',
            }}
          >
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1 shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-background" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-background">
                Replay
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Bandeira de chegada (xadrez gigante) ===== */}
      <AnimatePresence>
        {showFinaleFlag && (
          <motion.div
            key="finale-flag"
            className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[34%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage:
                'repeating-conic-gradient(hsl(0 0% 8%) 0% 25%, hsl(0 0% 100%) 0% 50%)',
              backgroundSize: '36px 36px',
              boxShadow: '-30px 0 60px -10px hsl(0 0% 0% / 0.5)',
              animation: 'race-checkered-flag 2.2s cubic-bezier(0.22, 1, 0.36, 1) both',
              transformOrigin: 'right center',
            }}
            aria-label="Bandeira de chegada"
          />
        )}
      </AnimatePresence>

      {/* ===== Start Lights (countdown F1 5x luzes) ===== */}
      <StartLights trigger={startLightsTrigger} />

      {/* ===== Fogos de artifício (bandeirada final) ===== */}
      <Fireworks active={showFireworks} />

      {/* ===== Countdown badge (canto inferior direito) ===== */}
      <RaceCountdownBadge endsAt={seasonEndsAt} />

      {/* ===== Mute toggle (ao lado do countdown) ===== */}
      <RaceMuteToggle muted={muted} onToggle={toggleMute} />

      {/* ===== Replay button 4s ===== */}
      <RaceReplayButton
        onClick={replay.startReplay}
        disabled={!replay.hasReplay}
        isPlaying={replay.isPlaying}
      />

      {/* ===== Pit lane visual (quando há carros parados) ===== */}
      {pitStopCars.size > 0 && (() => {
        const firstId = Array.from(pitStopCars)[0];
        const pilot = sorted.find((c) => c.car_id === firstId);
        return <PitLane count={pitStopCars.size} pilotName={pilot?.salesperson_name?.split(' ')[0]} />;
      })()}

      {/* ===== Telemetria do piloto logado — só fora do focus ===== */}
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

      {/* ===== Lower-third broadcast TV — gateado por viewMode ===== */}
      {viewMode.showBroadcast && <BroadcastOverlay events={broadcastEvents} flag={currentFlag} />}

      {/* ===== Easter eggs (konami + fogos overlay quando finale) ===== */}
      <RaceEasterEggs showFireworks={showFireworks} />
    </div>
  );
}
