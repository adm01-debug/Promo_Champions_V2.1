import { motion } from 'framer-motion';
import { Flag, Zap } from 'lucide-react';
import type { NextCornerInfo } from './raceTrackHelpers';

interface NextCornerHUDProps {
  info: NextCornerInfo | null;
}

/**
 * HUD pessoal no canto inferior direito (acima do ReplayButton).
 * Mostra a próxima curva do pilot logado: nome, distância e se é DRS zone.
 */
export function NextCornerHUD({ info }: NextCornerHUDProps) {
  if (!info) return null;
  const distancePct = (info.distance * 100).toFixed(1);

  return (
    <motion.div
      className="absolute bottom-16 right-3 z-20 rounded-xl border border-border/50 backdrop-blur-md p-2.5 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.82)', minWidth: 150 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={`Próxima curva: ${info.name}, em ${distancePct}%`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Flag className="h-3 w-3 text-primary" />
        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Próxima curva
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-black text-foreground" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {info.name}
        </span>
        <span className="text-[10px] font-mono font-black tabular-nums text-primary">
          {distancePct}%
        </span>
      </div>
      {info.isDRS && (
        <motion.div
          className="mt-1.5 flex items-center justify-center gap-1 rounded-md px-1.5 py-0.5"
          style={{ background: 'hsl(142 76% 38%)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap className="h-2.5 w-2.5 text-white" />
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">
            DRS Zone
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
