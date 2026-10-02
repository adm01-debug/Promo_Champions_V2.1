import { motion, AnimatePresence } from 'framer-motion';

interface DustBurst {
  id: string;
  x: number;
  y: number;
}

interface SectorBadge {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface TrackPoint {
  x: number;
  y: number;
}

interface RaceTrackEffectsProps {
  leaderPos: TrackPoint | null;
  noFx: boolean;
  dustBursts: DustBurst[];
  sectorBadges: SectorBadge[];
}

export function RaceTrackEffects({
  leaderPos,
  noFx,
  dustBursts,
  sectorBadges,
}: RaceTrackEffectsProps) {
  return (
    <>
      {leaderPos && !noFx && (
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

      <AnimatePresence>
        {dustBursts.map(burst => (
          <g
            key={burst.id}
            transform={`translate(${burst.x} ${burst.y})`}
            pointerEvents="none"
          >
            {[0, 1, 2, 3].map(i => {
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

      <AnimatePresence>
        {sectorBadges.map(b => (
          <motion.g
            key={b.id}
            transform={`translate(${b.x} ${b.y})`}
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: -10 }}
            exit={{ opacity: 0, scale: 0.95, y: -22 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            pointerEvents="none"
          >
            <rect
              x={-22}
              y={-12}
              width={44}
              height={18}
              rx={4}
              fill="hsl(142 76% 38%)"
              stroke="hsl(0 0% 100%)"
              strokeWidth={1.2}
            />
            <text
              y={1}
              textAnchor="middle"
              fontSize={10}
              fontWeight={900}
              fill="hsl(0 0% 100%)"
              style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em' }}
            >
              {b.name} ✓
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
    </>
  );
}
