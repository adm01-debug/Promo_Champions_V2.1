import { motion } from 'framer-motion';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Bandeira quadriculada SVG procedural com leve ondulação.
 * Usada na cerimônia de premiação do campeão da Race Arena.
 */
export function CheckeredFlag({ width = 220, height = 140, className }: Props) {
  const cols = 8;
  const rows = 5;
  const cellW = width / cols;
  const cellH = height / rows;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height + 20}`}
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      aria-hidden
    >
      {/* mastro */}
      <line x1="2" y1="0" x2="2" y2={height + 20} stroke="hsl(var(--foreground))" strokeWidth="3" />

      <motion.g
        animate={{ skewY: [-2, 2, -2] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '4px 50%' }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isBlack = (r + c) % 2 === 0;
            return (
              <rect
                key={`${r}-${c}`}
                x={4 + c * cellW}
                y={r * cellH}
                width={cellW}
                height={cellH}
                fill={isBlack ? '#0a0a0a' : '#fafafa'}
              />
            );
          })
        )}
        {/* borda */}
        <rect x="4" y="0" width={width} height={height} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  );
}
