import { useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { RaceCar } from './RaceCar';
import { ReactionFloater } from './ReactionFloater';
import { ReactionBar } from './ReactionBar';
import { getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';
import type { RaceReaction } from '@/hooks/race/useRaceReactions';

const PATTERN_BY_NUMBER = ['stripes', 'dots', 'checker'] as const;

interface RaceCarsLayerProps {
  sorted: RaceLeaderboardEntry[];
  boostingIds?: Set<string>;
  currentUserSalespersonId?: string;
  allReactions: RaceReaction[];
  colorblindMode: boolean;
  flashingCars: Set<string>;
  tireWearByCar: Map<string, number>;
  drsActiveByCar: Map<string, boolean>;
  pitStopCars: Set<string>;
  fastestCarId: string | null;
  aeroTurbByCar: Map<string, boolean>;
  seasonId: string | null;
  reducedMotion: boolean;
  transition: Transition;
}

export function RaceCarsLayer({
  sorted,
  boostingIds,
  currentUserSalespersonId,
  allReactions,
  colorblindMode,
  flashingCars,
  tireWearByCar,
  drsActiveByCar,
  pitStopCars,
  fastestCarId,
  aeroTurbByCar,
  seasonId,
  reducedMotion,
  transition,
}: RaceCarsLayerProps) {
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);

  return (
    <>
      {sorted.map((car, idx) => {
        const lane = (idx - sorted.length / 2) * 8;
        const pos = getPositionOnTrack(Number(car.progress), lane);
        const isMe =
          currentUserSalespersonId && car.salesperson_id === currentUserSalespersonId;
        const carReactions = allReactions.filter(r => r.target_car_id === car.car_id);
        const pattern = colorblindMode
          ? PATTERN_BY_NUMBER[car.car_number % PATTERN_BY_NUMBER.length]
          : null;
        return (
          <motion.g
            key={car.car_id}
            initial={false}
            animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
            transition={transition}
            onMouseEnter={() => setHoveredCar(car.car_id)}
            onMouseLeave={() => setHoveredCar(c => (c === car.car_id ? null : c))}
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
                  animate={
                    reducedMotion
                      ? undefined
                      : { r: [34, 46, 34], opacity: [0.9, 0.25, 0.9] }
                  }
                  transition={
                    reducedMotion
                      ? undefined
                      : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                  }
                />
                <motion.circle
                  r={28}
                  fill="hsl(var(--primary))"
                  opacity={0.18}
                  animate={
                    reducedMotion ? undefined : { opacity: [0.25, 0.08, 0.25] }
                  }
                  transition={
                    reducedMotion
                      ? undefined
                      : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                  }
                />
              </>
            )}
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
            <RaceCar
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
            {carReactions.length > 0 && (
              <g transform="translate(20, -32)">
                <rect
                  x={-10}
                  y={-8}
                  width={20}
                  height={14}
                  rx={7}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />
                <text
                  y={2}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={800}
                  fill="hsl(var(--foreground))"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {carReactions.length}
                </text>
              </g>
            )}
            <ReactionFloater reactions={carReactions} />
            {isMe && (
              <g transform={`rotate(${-pos.rotation}) translate(0, -42)`}>
                <rect
                  x={-18}
                  y={-9}
                  width={36}
                  height={14}
                  rx={7}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={1.5}
                />
                <text
                  y={1}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={900}
                  fill="hsl(var(--primary-foreground))"
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  VOCÊ
                </text>
              </g>
            )}
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
                      style={{
                        fontFamily: 'system-ui, sans-serif',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {name}
                    </text>
                  </>
                );
              })()}
            </g>

            <foreignObject
              x={-50}
              y={20}
              width={100}
              height={36}
              style={{ overflow: 'visible' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ReactionBar
                  carId={car.car_id}
                  seasonId={seasonId}
                  visible={hoveredCar === car.car_id}
                />
              </div>
            </foreignObject>
          </motion.g>
        );
      })}
    </>
  );
}
