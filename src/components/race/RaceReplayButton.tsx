import { Film } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  isPlaying?: boolean;
}

/**
 * Botão flutuante "Replay 4s" das últimas posições.
 * Posicionado no canto inferior direito, acima do ReplayButton (de overtake).
 */
export function RaceReplayButton({ onClick, disabled, isPlaying }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPlaying}
      aria-label="Reproduzir replay 4s"
      className="absolute bottom-[58px] right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'hsl(var(--background) / 0.82)' }}
    >
      {isPlaying && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid hsl(var(--destructive))' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <Film className="h-4 w-4 text-primary" strokeWidth={2.4} />
    </button>
  );
}
