import { motion } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCar } from './RaceCar';
import { getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface RaceArenaProps {
  cars: RaceLeaderboardEntry[];
  boostingIds?: Set<string>;
  currentUserSalespersonId?: string;
  overlayChildren?: React.ReactNode;
  weatherOverlay?: React.ReactNode;
}

export function RaceArena({ cars, boostingIds, currentUserSalespersonId, overlayChildren, weatherOverlay }: RaceArenaProps) {
  const sorted = [...cars].sort((a, b) => Number(b.progress) - Number(a.progress));

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-border shadow-lg bg-[hsl(var(--race-grass))]">
      <RaceTrack>
        {sorted.map((car, idx) => {
          // Espalha levemente as raias para evitar sobreposição
          const lane = (idx - sorted.length / 2) * 8;
          const pos = getPositionOnTrack(Number(car.progress), lane);
          const isMe = currentUserSalespersonId && car.salesperson_id === currentUserSalespersonId;
          return (
            <motion.g
              key={car.car_id}
              initial={false}
              animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
              transition={{ type: 'spring', stiffness: 70, damping: 18, duration: 0.8 }}
            >
              {/* Halo pulsante para o usuário logado */}
              {isMe && (
                <>
                  <motion.circle
                    r={38}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    opacity={0.85}
                    animate={{ r: [34, 46, 34], opacity: [0.9, 0.25, 0.9] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    r={28}
                    fill="hsl(var(--primary))"
                    opacity={0.18}
                    animate={{ opacity: [0.25, 0.08, 0.25] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}
              <RaceCar
                number={car.car_number}
                primaryColor={car.primary_color}
                secondaryColor={car.secondary_color}
                style={car.car_style}
                showTrail={boostingIds?.has(car.salesperson_id) ?? false}
              />
              {/* Label "VOCÊ" sticky */}
              {isMe && (
                <g transform="translate(0, -42)">
                  <rect
                    x={-18} y={-9}
                    width={36} height={14}
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
                    style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}
                  >
                    VOCÊ
                  </text>
                </g>
              )}
              {/* nome do piloto */}
              <text
                y={isMe ? -52 : -26}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="hsl(var(--foreground))"
                stroke="hsl(var(--background))"
                strokeWidth={3}
                paintOrder="stroke"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {car.salesperson_name?.split(' ')[0]}
              </text>
            </motion.g>
          );
        })}
        {overlayChildren}
      </RaceTrack>
      {weatherOverlay}
    </div>
  );
}
