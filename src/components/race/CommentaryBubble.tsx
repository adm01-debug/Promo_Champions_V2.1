import { AnimatePresence, motion } from 'framer-motion';
import { Radio } from 'lucide-react';

export interface CommentaryLine {
  id: string;
  text: string;
  createdAt: number;
}

interface CommentaryBubbleProps {
  line: CommentaryLine | null;
}

/**
 * Bolha de comentário estilo "broadcast subtitle" no rodapé central.
 * Glassmorphism, fade-in/out automático.
 */
export function CommentaryBubble({ line }: CommentaryBubbleProps) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2">
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 shadow-xl backdrop-blur-md"
            style={{ background: 'hsl(var(--background) / 0.78)' }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90">
              <Radio className="h-3 w-3 text-background" strokeWidth={3} />
            </span>
            <span className="max-w-[420px] truncate text-[12px] font-bold tracking-wide text-foreground">
              {line.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
