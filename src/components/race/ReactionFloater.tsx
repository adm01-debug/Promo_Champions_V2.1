import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { RaceReaction } from '@/hooks/race/useRaceReactions';

interface Props {
  reactions: RaceReaction[];
}

/**
 * Renderiza emojis flutuando para cima e desaparecendo conforme chegam reactions.
 * Auto-cleanup em 1.6s. Recebe lista de reactions recentes (mais novos primeiro).
 */
export function ReactionFloater({ reactions }: Props) {
  const [visible, setVisible] = useState<RaceReaction[]>([]);

  useEffect(() => {
    if (reactions.length === 0) return;
    const newest = reactions[0];
    if (visible.find((r) => r.id === newest.id)) return;
    setVisible((prev) => [newest, ...prev].slice(0, 10));
    const t = setTimeout(() => {
      setVisible((prev) => prev.filter((r) => r.id !== newest.id));
    }, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactions[0]?.id]);

  return (
    <g pointerEvents="none">
      <AnimatePresence>
        {visible.map((r, i) => (
          <motion.text
            key={r.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -38 - i * 4, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            x={(i % 3 - 1) * 12}
            y={-18}
            fontSize={16}
            textAnchor="middle"
          >
            {r.emoji}
          </motion.text>
        ))}
      </AnimatePresence>
    </g>
  );
}
