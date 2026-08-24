import { motion, AnimatePresence } from 'framer-motion';
import { getPositionOnTrack } from './raceTrackHelpers';

interface LeaderGapIndicatorProps {
  /** Progresso do líder (0..1+). */
  leaderProgress: number;
  /** Progresso do 2º colocado. */
  secondProgress: number;
  /** Limite máximo (em fração) para exibir o badge — padrão 5%. */
  threshold?: number;
}

/**
 * Badge flutuante "+X.Xs" entre 1º e 2º quando o gap está apertado.
 * Conversão arbitrária consistente com SpeedHUD: 1% de progresso ≈ 0.45s
 * (assumindo ~220 km/h em circuito de ~3 km/volta).
 */
const PROGRESS_TO_SECONDS = 45; // 1.0 (volta inteira) ≈ 45s

export function LeaderGapIndicator({
  leaderProgress,
  secondProgress,
  threshold = 0.05,
}: LeaderGapIndicatorProps) {
  const gap = leaderProgress - secondProgress;
  const visible = gap > 0 && gap < threshold;
  if (!visible) return null;

  const midProgress = (leaderProgress + secondProgress) / 2;
  const pos = getPositionOnTrack(midProgress, -38);
  const seconds = (gap * PROGRESS_TO_SECONDS).toFixed(2);
  // urgência cresce conforme o gap diminui
  const urgency = 1 - Math.min(1, gap / threshold);
  const hue = 45 - urgency * 45; // amarelo → vermelho

  return (
    <AnimatePresence>
      <motion.g
        key="leader-gap-badge"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        transform={`translate(${pos.x} ${pos.y})`}
        pointerEvents="none"
        aria-hidden
      >
        <motion.rect
          x={-22}
          y={-9}
          width={44}
          height={16}
          rx={8}
          fill={`hsl(${hue} 95% 55%)`}
          stroke="hsl(0 0% 10%)"
          strokeWidth={1}
          animate={{ opacity: [0.95, 0.7, 0.95] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <text
          y={2}
          textAnchor="middle"
          fontSize={10}
          fontWeight={900}
          fill="hsl(20 30% 12%)"
          style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}
        >
          +{seconds}s
        </text>
      </motion.g>
    </AnimatePresence>
  );
}
