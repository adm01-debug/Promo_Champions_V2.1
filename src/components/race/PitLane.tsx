import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  /** Quantos carros estão atualmente em pit. */
  count: number;
  /** Nome do piloto em pit (mostra apenas o primeiro). */
  pilotName?: string;
}

/**
 * Garagem SVG lateral exibida quando há ≥1 carro em pit-stop.
 * Posicionada como overlay no canto superior esquerdo.
 */
export function PitLane({ count, pilotName }: Props) {
  const reducedMotion = useReducedMotion();
  if (count <= 0) return null;

  return (
    <div
      className="absolute left-3 top-3 z-20 rounded-xl border border-border/50 backdrop-blur-md p-2 shadow-lg"
      style={{ background: 'hsl(var(--background) / 0.86)' }}
      aria-label={`Pit lane: ${count} carro(s)`}
    >
      <div className="flex items-center gap-1 mb-1">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-destructive"
          style={{
            animation: reducedMotion ? undefined : 'race-pit-blink 1s ease-in-out infinite',
          }}
        />
        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Pit Lane · {count}
        </span>
      </div>
      <svg viewBox="0 0 90 50" width={90} height={50} aria-hidden>
        {/* Garagem */}
        <rect x={4} y={6} width={82} height={38} rx={3}
          fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
        {/* Listra horizontal teto */}
        <rect x={4} y={6} width={82} height={5} fill="hsl(0 0% 12%)" />
        {/* Asfalto pit */}
        <rect x={6} y={36} width={78} height={6} fill="hsl(0 0% 22%)" />
        <line x1={6} y1={39} x2={84} y2={39} stroke="hsl(45 95% 55%)" strokeWidth={0.6} strokeDasharray="3 2" />
        {/* Carro estilizado */}
        <g transform="translate(34, 22)">
          <rect x={0} y={0} width={22} height={9} rx={2} fill="hsl(var(--primary))" />
          <rect x={3} y={1.5} width={16} height={4} rx={1} fill="hsl(var(--background))" opacity={0.7} />
          <circle cx={4} cy={10} r={2} fill="hsl(0 0% 8%)" />
          <circle cx={18} cy={10} r={2} fill="hsl(0 0% 8%)" />
        </g>
        {/* 4 mecânicos animados (bolinhas pulando) */}
        {[
          { x: 30, y: 24 },
          { x: 60, y: 24 },
          { x: 30, y: 34 },
          { x: 60, y: 34 },
        ].map((m, i) => (
          <motion.circle
            key={i}
            cx={m.x}
            cy={m.y}
            r={2}
            fill="hsl(45 95% 55%)"
            stroke="hsl(0 0% 8%)"
            strokeWidth={0.5}
            animate={
              reducedMotion
                ? undefined
                : { cy: [m.y, m.y - 2, m.y], scale: [1, 1.1, 1] }
            }
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
      {pilotName && (
        <div className="mt-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-muted-foreground truncate max-w-[90px]">
          {pilotName}
        </div>
      )}
    </div>
  );
}
