import { motion } from 'framer-motion';
import { RaceTrack } from './RaceTrack';
import { RaceCar } from './RaceCar';
import { getPositionOnTrack } from './raceTrackHelpers';
import type { RaceLeaderboardEntry } from '@/hooks/race/useRaceLeaderboard';

interface RaceArenaProps {
  cars: RaceLeaderboardEntry[];
  boostingIds?: Set<string>;
  overlayChildren?: React.ReactNode;
  weatherOverlay?: React.ReactNode;
}

export function RaceArena({ cars, boostingIds, overlayChildren, weatherOverlay }: RaceArenaProps) {
  const sorted = [...cars].sort((a, b) => Number(b.progress) - Number(a.progress));

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-border shadow-lg" style={{ backgroundColor: '#5fa358' }}>
      <RaceTrack>
        {sorted.map((car, idx) => {
          // Espalha levemente as raias para evitar sobreposição
          const lane = (idx - sorted.length / 2) * 8;
          const pos = getPositionOnTrack(Number(car.progress), lane);
          return (
            <motion.g
              key={car.car_id}
              initial={false}
              animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
              transition={{ type: 'spring', stiffness: 70, damping: 18, duration: 0.8 }}
            >
              <RaceCar
                number={car.car_number}
                primaryColor={car.primary_color}
                secondaryColor={car.secondary_color}
                style={car.car_style}
                showTrail={boostingIds?.has(car.salesperson_id) ?? false}
              />
              {/* nome do piloto */}
              <text
                y={-26}
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
