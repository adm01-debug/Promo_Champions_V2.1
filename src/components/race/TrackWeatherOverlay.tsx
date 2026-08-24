import { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { TrackCondition } from '@/hooks/race/useTrackConditions';

interface Props {
  condition: TrackCondition;
}

/**
 * Overlay visual sobre a pista. Opacity total ≤ 0.15 para não atrapalhar leitura.
 * Usa pointer-events-none e respeita useReducedMotion (versão estática para rainy/storm).
 */
export const TrackWeatherOverlay: FC<Props> = ({ condition }) => {
  const reduce = useReducedMotion();

  if (condition === 'sunny') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            'radial-gradient(ellipse at top, hsl(var(--warning) / 0.10) 0%, transparent 60%)',
        }}
      />
    );
  }

  if (condition === 'cloudy') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            'linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.06), transparent 50%)',
        }}
      />
    );
  }

  // rainy / storm — linhas diagonais SVG
  const density = condition === 'storm' ? 28 : 16;
  const speed = condition === 'storm' ? 0.6 : 1.1;
  const lineOpacity = condition === 'storm' ? 0.18 : 0.12;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern
            id={`rain-${condition}`}
            x="0"
            y="0"
            width={100 / density}
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(18)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="14"
              stroke="hsl(var(--info))"
              strokeWidth="0.4"
              strokeLinecap="round"
              opacity={lineOpacity}
            />
          </pattern>
        </defs>
        {reduce ? (
          <rect width="100" height="100" fill={`url(#rain-${condition})`} />
        ) : (
          <motion.rect
            width="100"
            height="100"
            fill={`url(#rain-${condition})`}
            animate={{ y: [-8, 0] }}
            transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </svg>

      {condition === 'storm' && !reduce && (
        <motion.div
          className="absolute inset-0"
          style={{ background: 'hsl(var(--foreground) / 0.08)' }}
          animate={{ opacity: [0, 0.6, 0, 0, 0.4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </div>
  );
};
