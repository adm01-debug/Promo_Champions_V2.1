import { motion, AnimatePresence } from 'framer-motion';
import { EASE_F1_BRAKE } from '@/lib/race/easings';

const EASE = [...EASE_F1_BRAKE] as number[];

interface Props {
  visible: boolean;
  name: string;
  rank: number;
  /** Cor primária do livery do carro — usada como fundo da pílula. */
  color?: string;
  id?: string;
}

/**
 * Calcula cor de texto legível (preto ou branco) sobre uma cor de fundo arbitrária.
 * Suporta formatos: #rrggbb, #rgb, hsl(...), hsl(var(--token)).
 * Para tokens CSS dinâmicos, usa fallback branco (mais seguro sobre cores saturadas comuns de livery).
 */
function getReadableTextColor(bg: string): string {
  const hexMatch = bg.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? 'hsl(0 0% 8%)' : 'hsl(0 0% 98%)';
  }
  // hsl(H S% L%) — usa lightness como proxy
  const hslMatch = bg.match(/hsl\(\s*\d+\s+\d+%\s+(\d+(?:\.\d+)?)%/i);
  if (hslMatch) {
    const l = parseFloat(hslMatch[1]);
    return l >= 60 ? 'hsl(0 0% 8%)' : 'hsl(0 0% 98%)';
  }
  return 'hsl(0 0% 98%)';
}

/**
 * Tooltip flutuante "capacete" exibido acima do carro em hover persistente (>600ms).
 * Pílula com fundo na cor primária do livery + texto adaptativo (contraste WCAG).
 */
export function CarHelmetTooltip({ visible, name, rank, color = 'hsl(var(--primary))', id }: Props) {
  const textColor = getReadableTextColor(color);
  const badgeBg = textColor === 'hsl(0 0% 98%)' ? 'hsl(0 0% 100% / 0.22)' : 'hsl(0 0% 0% / 0.18)';

  return (
    <AnimatePresence>
      {visible && (
        <foreignObject x={-44} y={-46} width={88} height={36} style={{ overflow: 'visible' }}>
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
              padding: '4px 9px',
              borderRadius: 999,
              background: color,
              border: '1.2px solid hsl(0 0% 100% / 0.85)',
              boxShadow: '0 2px 6px hsl(0 0% 0% / 0.45), 0 6px 20px hsl(0 0% 0% / 0.25)',
              fontSize: 11,
              fontWeight: 700,
              color: textColor,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18, height: 18, borderRadius: 999,
                background: badgeBg,
                color: textColor,
                fontSize: 10, fontWeight: 900,
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
