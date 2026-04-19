import { motion, AnimatePresence } from 'framer-motion';
import { EASE_F1_BRAKE } from '@/lib/race/easings';

const EASE = [...EASE_F1_BRAKE] as number[];

interface Props {
  visible: boolean;
  name: string;
  rank: number;
  /** Cor primária para o anel do "capacete". */
  color?: string;
  id?: string;
}

/**
 * Tooltip flutuante "capacete" exibido acima do carro em hover persistente (>600ms).
 * Renderizado via foreignObject para permitir HTML arbitrário dentro do SVG.
 */
export function CarHelmetTooltip({ visible, name, rank, color = 'hsl(var(--primary))', id }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <foreignObject x={-40} y={-46} width={80} height={36} style={{ overflow: 'visible' }}>
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.22, ease: EASE_F1_BRAKE as any }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              borderRadius: 999,
              background: 'hsl(var(--background) / 0.92)',
              border: `1px solid ${color}`,
              boxShadow: '0 6px 20px hsl(var(--foreground) / 0.18)',
              fontSize: 11,
              fontWeight: 600,
              color: 'hsl(var(--foreground))',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18, height: 18, borderRadius: 999,
                background: color,
                color: 'hsl(var(--primary-foreground))',
                fontSize: 10, fontWeight: 800,
              }}
            >
              {rank}
            </span>
            <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </span>
          </motion.div>
        </foreignObject>
      )}
    </AnimatePresence>
  );
}
