import { motion, useReducedMotion } from 'framer-motion';
import { RaceCar } from './RaceCar';
import { getPositionOnTrack } from './raceTrackHelpers';
import type { GhostCarResult } from '@/hooks/race/useGhostCar';

interface Props {
  ghost: GhostCarResult;
}

/**
 * Carro fantasma representando o PR pessoal — semi-transparente, sem cores vibrantes.
 */
export function GhostCar({ ghost }: Props) {
  const prefersReducedMotion = useReducedMotion();
  if (ghost.status === 'no-data') return null;

  // Lane dedicada (offset diferente para não sobrepor)
  const pos = getPositionOnTrack(ghost.ghostProgress, -22);

  return (
    <motion.g
      initial={false}
      animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
      transition={prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 50, damping: 20, duration: 1.2 }}
      style={{ opacity: 0.4, filter: 'grayscale(1)' }}
      aria-label="Ghost car (seu PR pessoal)"
    >
      <g style={{ filter: 'drop-shadow(0 0 4px hsl(var(--muted-foreground) / 0.5))' }}>
        <RaceCar
          primaryColor="hsl(var(--muted-foreground))"
          secondaryColor="hsl(var(--muted))"
          style="f1"
        />
      </g>
      <text
        y={-28}
        textAnchor="middle"
        fontSize={14}
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        👻
      </text>
      <text
        y={32}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="hsl(var(--muted-foreground))"
        stroke="hsl(var(--background))"
        strokeWidth={2.5}
        paintOrder="stroke"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        PR
      </text>
    </motion.g>
  );
}
