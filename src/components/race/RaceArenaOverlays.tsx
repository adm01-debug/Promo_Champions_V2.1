import { motion, AnimatePresence } from 'framer-motion';

interface RaceArenaOverlaysProps {
  yellowFlag: boolean;
  replayOverlay: boolean;
  showFinaleFlag: boolean;
}

/**
 * Overlays ambientes/full-screen da arena: vinheta de sol, flash de bandeira
 * amarela, moldura de replay e bandeirada final.
 */
export function RaceArenaOverlays({
  yellowFlag,
  replayOverlay,
  showFinaleFlag,
}: RaceArenaOverlaysProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[5] rounded-3xl"
        style={{
          background:
            'radial-gradient(circle at 92% 8%, hsl(48 100% 75% / 0.22) 0%, hsl(45 95% 65% / 0.08) 30%, transparent 65%)',
          mixBlendMode: 'screen',
        }}
        aria-hidden
      />

      {yellowFlag && (
        <div
          className="pointer-events-none absolute inset-0 z-[6] rounded-3xl"
          style={{
            background: 'hsl(45 95% 55% / 0.15)',
            animation: 'race-track-yellow-overlay 0.7s ease-in-out infinite',
          }}
          aria-hidden
        />
      )}

      <AnimatePresence>
        {replayOverlay && (
          <motion.div
            key="replay-overlay"
            className="pointer-events-none absolute inset-0 z-30 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow:
                'inset 0 0 0 4px hsl(var(--destructive) / 0.85), inset 0 0 60px hsl(0 0% 0% / 0.45)',
              animation: 'race-replay-pulse 1.4s ease-in-out infinite',
            }}
          >
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1 shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-background" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-background">
                Replay
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinaleFlag && (
          <motion.div
            key="finale-flag"
            className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[34%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage:
                'repeating-conic-gradient(hsl(0 0% 8%) 0% 25%, hsl(0 0% 100%) 0% 50%)',
              backgroundSize: '36px 36px',
              boxShadow: '-30px 0 60px -10px hsl(0 0% 0% / 0.5)',
              animation: 'race-checkered-flag 2.2s cubic-bezier(0.22, 1, 0.36, 1) both',
              transformOrigin: 'right center',
            }}
            aria-label="Bandeira de chegada"
          />
        )}
      </AnimatePresence>
    </>
  );
}
