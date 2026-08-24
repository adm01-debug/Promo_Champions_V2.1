import { motion } from 'framer-motion';

interface SpeedHUDProps {
  /** Velocidade simulada do líder em km/h (0..360). */
  speedKmh: number;
  /** Nome do líder (primeiro nome). */
  leaderName?: string;
}

/**
 * Mostrador analógico de velocidade do líder, canto inferior esquerdo (acima do MiniMap).
 * Agulha gira de -120° (0 km/h) a +120° (360 km/h).
 */
export function SpeedHUD({ speedKmh, leaderName }: SpeedHUDProps) {
  const clamped = Math.max(0, Math.min(360, speedKmh));
  const angle = -120 + (clamped / 360) * 240;
  const colorBand =
    clamped > 280 ? 'hsl(0 80% 55%)' : clamped > 180 ? 'hsl(45 95% 55%)' : 'hsl(142 70% 45%)';

  return (
    <div
      className="absolute bottom-3 left-[88px] z-20 rounded-xl border border-border/50 backdrop-blur-md p-2 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
      aria-label={`Velocidade do líder: ${Math.round(clamped)} km/h`}
    >
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground text-center mb-1">
        Líder {leaderName ? `· ${leaderName}` : ''}
      </div>
      <svg width={84} height={56} viewBox="0 0 84 56" aria-hidden>
        {/* arco de fundo */}
        <path
          d="M 10 48 A 32 32 0 0 1 74 48"
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.25)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* arco preenchido (proporcional) */}
        <path
          d="M 10 48 A 32 32 0 0 1 74 48"
          fill="none"
          stroke={colorBand}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={100}
          strokeDashoffset={100 - (clamped / 360) * 100}
          style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.3s' }}
        />
        {/* tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = (-120 + t * 240) * (Math.PI / 180);
          const x1 = 42 + Math.cos(a) * 26;
          const y1 = 48 + Math.sin(a) * 26;
          const x2 = 42 + Math.cos(a) * 30;
          const y2 = 48 + Math.sin(a) * 30;
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground) / 0.6)"
              strokeWidth={1}
            />
          );
        })}
        {/* agulha */}
        <motion.line
          x1={42}
          y1={48}
          x2={42}
          y2={20}
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transformOrigin: '42px 48px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        />
        <circle cx={42} cy={48} r={2.5} fill="hsl(var(--foreground))" />
      </svg>
      <div className="text-center mt-0.5">
        <span className="text-[14px] font-black tabular-nums text-foreground" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {Math.round(clamped)}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground ml-1">km/h</span>
      </div>
    </div>
  );
}
