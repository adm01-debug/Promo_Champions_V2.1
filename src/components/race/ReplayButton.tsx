import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isPlaying?: boolean;
}

/**
 * Botão flutuante de replay no canto inferior direito.
 * Pulsa suavemente quando há replay disponível.
 */
export function ReplayButton({ onClick, disabled = false, isPlaying = false }: ReplayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPlaying}
      aria-label="Reproduzir melhor momento"
      className="absolute bottom-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'hsl(var(--background) / 0.82)' }}
    >
      {!disabled && !isPlaying && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid hsl(var(--primary))' }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <Play className="h-4 w-4 fill-primary text-primary" strokeWidth={2} />
    </button>
  );
}
