import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCar } from './RaceCar';
import { ReactionFloater } from './ReactionFloater';
import { ReactionBar } from './ReactionBar';
import { getPositionOnTrack, detectOvertakes, CHECKPOINTS, TRACK_VIEWBOX } from './raceTrackHelpers';
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

  // ----- Timing tower (top 3 com gaps) -----
  const top3 = sorted.slice(0, 3);
  const leaderProgress = Number(top3[0]?.progress ?? 0);

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

        {overlayChildren}
      </RaceTrack>
      {weatherOverlay}

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
    </div>
  );
}
