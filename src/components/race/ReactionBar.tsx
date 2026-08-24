import { motion, AnimatePresence } from 'framer-motion';
import { REACTION_EMOJIS, useSendRaceReaction } from '@/hooks/race/useRaceReactions';
import { useState } from 'react';

interface Props {
  carId: string;
  seasonId?: string | null;
  visible: boolean;
}

/**
 * Barra flutuante de emojis para reagir a um carro durante a corrida.
 * Renderizada como overlay HTML (não SVG) sobre a posição do carro.
 */
export function ReactionBar({ carId, seasonId, visible }: Props) {
  const send = useSendRaceReaction();
  const [pulsed, setPulsed] = useState<string | null>(null);

  const handleClick = async (emoji: string) => {
    setPulsed(emoji);
    if (navigator.vibrate) navigator.vibrate(15);
    try { await send.mutateAsync({ carId, emoji, seasonId }); } catch { /* silent */ }
    setTimeout(() => setPulsed(null), 250);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 rounded-full border border-border bg-background/95 backdrop-blur px-2 py-1 shadow-md"
          role="group"
          aria-label="Reagir ao carro"
        >
          {REACTION_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => handleClick(e)}
              className="text-base hover:scale-125 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={`Reagir com ${e}`}
            >
              <span className={pulsed === e ? 'inline-block animate-ping' : 'inline-block'}>{e}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
