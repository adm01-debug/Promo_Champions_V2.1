import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCar } from './RaceCar';
import { ReactionFloater } from './ReactionFloater';
import { ReactionBar } from './ReactionBar';
import { MiniMap } from './MiniMap';
import { CommentaryBubble, type CommentaryLine } from './CommentaryBubble';
import { ReplayButton } from './ReplayButton';
import { StartLights } from './StartLights';
import { Fireworks } from './Fireworks';
import {
  getPositionOnTrack, detectOvertakes, CHECKPOINTS, TRACK_VIEWBOX,
  SECTOR_BOUNDARIES, isInDRSZone, computeLapInfo, makeCommentaryLine,
} from './raceTrackHelpers';
import { useRaceReactions } from '@/hooks/race/useRaceReactions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
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
}

const PATTERN_BY_NUMBER = ['stripes', 'dots', 'checker'] as const;

export function RaceArena({
  cars, boostingIds, currentUserSalespersonId, overlayChildren, weatherOverlay,
  colorblindMode = false, seasonId = null,
}: RaceArenaProps) {
  const sorted = [...cars].sort((a, b) => Number(b.progress) - Number(a.progress));
  const reducedMotion = useReducedMotion();
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
        // narração + grava último overtake p/ replay
        const o = overtakes[0];
        const attackerName = sorted.find((c) => c.car_id === o.overtaker)?.salesperson_name;
        const defenderName = sorted.find((c) => c.car_id === o.overtaken)?.salesperson_name;
        const inDRS = isInDRSZone(curr.find((x) => x.id === o.overtaker)?.progress ?? 0);
        pushCommentary(makeCommentaryLine({
          type: inDRS ? 'drs' : 'overtake',
          attacker: attackerName,
          defender: defenderName,
        }));
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
          }
        });
      }
      // ----- Mudança de líder -----
      const newLeaderId = leaderCurr?.id ?? null;
      if (newLeaderId && prevLeaderIdRef.current && newLeaderId !== prevLeaderIdRef.current) {
        const lname = sorted.find((c) => c.car_id === newLeaderId)?.salesperson_name;
        pushCommentary(makeCommentaryLine({ type: 'leader', leader: lname }));
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

  // ----- Timing tower (top 5 com gaps) -----
  const top5 = sorted.slice(0, 5);
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

  // ----- Bandeira de chegada (líder >= 0.95) -----
  useEffect(() => {
    if (finaleShown || reducedMotion) return;
    if (leaderProgress >= 0.95) {
      setFinaleShown(true);
      setShowFinaleFlag(true);
      setShowFireworks(true);
      const lname = sorted[0]?.salesperson_name;
      pushCommentary(makeCommentaryLine({ type: 'finale', leader: lname }));
      const t1 = window.setTimeout(() => setShowFinaleFlag(false), 2200);
      const t2 = window.setTimeout(() => setShowFireworks(false), 2600);
      return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    }
  }, [leaderProgress, finaleShown, reducedMotion, sorted, pushCommentary]);

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
      className="relative w-full h-full rounded-3xl overflow-hidden border border-border/60 bg-[hsl(var(--race-grass))]"
      style={{
        boxShadow:
          '0 24px 60px -20px hsl(var(--race-grass-shadow) / 0.55), inset 0 0 0 1px hsl(var(--race-asphalt-edge) / 0.08)',
        filter: 'saturate(1.08) contrast(1.02)',
      }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ scale: zoomActive && !reducedMotion ? 1.12 : 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: leaderPos
            ? `${(leaderPos.x / TRACK_VIEWBOX.width) * 100}% ${(leaderPos.y / TRACK_VIEWBOX.height) * 100}%`
            : '50% 50%',
          animation: reducedMotion
            ? undefined
            : 'race-cinematic-intro 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
      <RaceTrack>
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

        {overlayChildren}
      </RaceTrack>
      {weatherOverlay}
      </motion.div>

      {/* ===== LAP counter HUD (topo central) ===== */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-1.5 shadow-lg"
        style={{ background: 'hsl(var(--background) / 0.72)' }}
        aria-label={`Volta ${lapInfo.current} de ${lapInfo.total}`}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
            Lap
          </span>
          <span className="text-[15px] font-black tabular-nums text-foreground" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {lapInfo.current}
            <span className="text-muted-foreground font-bold">/{lapInfo.total}</span>
          </span>
        </div>
      </div>

      {/* ===== Mini-mapa do circuito ===== */}
      <MiniMap cars={sorted} currentUserSalespersonId={currentUserSalespersonId} />

      {/* ===== Timing tower (top 3 com gaps, estilo F1) ===== */}
      {top3.length > 0 && (
        <div
          className="absolute top-3 right-3 z-20 rounded-xl border border-border/50 backdrop-blur-md px-3 py-2 shadow-lg"
          style={{
            background: 'hsl(var(--background) / 0.72)',
            minWidth: 168,
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
            {top3.map((c, i) => {
              const gap = i === 0 ? null : leaderProgress - Number(c.progress);
              const gapStr = gap === null ? 'LEADER' : `+${(gap * 100).toFixed(2)}%`;
              return (
                <div key={c.car_id} className="flex items-center gap-2">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-black tabular-nums"
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
                  <span
                    className={`text-[9px] font-mono font-bold tabular-nums ${
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

      {/* ===== Comentarista IA (broadcast subtitle) ===== */}
      <CommentaryBubble line={commentary} />

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
    </div>
  );
}
