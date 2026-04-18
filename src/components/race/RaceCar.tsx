import { motion } from 'framer-motion';

interface RaceCarProps {
  number: number;
  primaryColor: string;
  secondaryColor: string;
  style: 'f1' | 'stock' | 'kart';
  scale?: number;
  showTrail?: boolean;
  /** Padrão visual extra para acessibilidade (colorblind mode). */
  pattern?: 'stripes' | 'dots' | 'checker' | null;
}

/**
 * SVG carro top-down cartoon. ViewBox local 60x30; quem usa controla translate/rotate.
 */
export function RaceCar({ number, primaryColor, secondaryColor, style, scale = 1.1, showTrail = false, pattern = null }: RaceCarProps) {
  const patternFillId = pattern === 'stripes' ? 'cbStripes' : pattern === 'dots' ? 'cbDots' : pattern === 'checker' ? 'cbChecker' : null;
  const isF1 = style === 'f1';
  const isKart = style === 'kart';
  const bodyW = isF1 ? 56 : isKart ? 40 : 50;
  const bodyH = isF1 ? 18 : isKart ? 22 : 24;

  return (
    <g transform={`scale(${scale})`}>
      {/* Boost trail melhorado: glow afterimage + partículas */}
      {showTrail && (
        <>
          {/* Glow afterimage atrás do carro */}
          <motion.ellipse
            cx={-40} cy={0} rx={32} ry={9}
            fill={primaryColor}
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: [0, 0.55, 0], scaleX: [0.4, 1.6, 2.2] }}
            transition={{ duration: 0.7, repeat: 3, ease: 'easeOut' }}
            style={{ filter: 'blur(6px)' }}
          />
          {/* Trail principal usando gradiente do TrackDefs */}
          <motion.ellipse
            cx={-30} cy={0} rx={22} ry={6}
            fill="url(#boostTrail)"
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: [0, 0.95, 0], scaleX: [0.3, 1.5, 2] }}
            transition={{ duration: 0.6, repeat: 3 }}
          />
          {/* Partículas de spark */}
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx={-bodyW / 2 - 4} cy={(i - 1.5) * 3}
              r={1.6}
              fill={secondaryColor}
              initial={{ opacity: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [-2, -22 - i * 3, -36 - i * 4],
                y: [(i - 1.5) * 3, (i - 1.5) * 5, (i - 1.5) * 7],
              }}
              transition={{ duration: 0.5 + i * 0.05, repeat: 3, delay: i * 0.04, ease: 'easeOut' }}
            />
          ))}
          {/* Onda de choque */}
          <motion.circle
            cx={-bodyW / 2} cy={0}
            r={0}
            fill="none"
            stroke={primaryColor}
            strokeWidth={1.5}
            initial={{ r: 0, opacity: 0.8 }}
            animate={{ r: [0, 18, 28], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          />
        </>
      )}
      {/* sombra */}
      <ellipse cx={2} cy={bodyH / 2 + 4} rx={bodyW / 2} ry={3} fill="rgba(0,0,0,0.25)" />
      {/* corpo */}
      <rect
        x={-bodyW / 2} y={-bodyH / 2}
        width={bodyW} height={bodyH}
        rx={isKart ? 4 : isF1 ? 8 : 6}
        fill={primaryColor}
        stroke="#1f2937" strokeWidth={1.2}
      />
      {/* faixa central (livery) */}
      <rect
        x={-bodyW / 2 + 4} y={-2}
        width={bodyW - 8} height={4}
        fill={secondaryColor}
        opacity={0.85}
      />
      {/* cockpit */}
      <ellipse cx={isF1 ? 4 : 0} cy={0} rx={isF1 ? 6 : 7} ry={isF1 ? 5 : 6} fill="#0f172a" stroke="#1f2937" strokeWidth={1} />
      {/* asa traseira (F1) */}
      {isF1 && <rect x={-bodyW / 2 - 2} y={-bodyH / 2 - 2} width={4} height={bodyH + 4} fill={secondaryColor} stroke="#1f2937" strokeWidth={0.8} />}
      {/* asa dianteira (F1) */}
      {isF1 && <rect x={bodyW / 2 - 2} y={-bodyH / 2 - 3} width={3} height={bodyH + 6} fill={secondaryColor} stroke="#1f2937" strokeWidth={0.8} />}
      {/* rodas */}
      <circle cx={-bodyW / 2 + 6} cy={-bodyH / 2 - 1} r={3.5} fill="#0f172a" />
      <circle cx={-bodyW / 2 + 6} cy={bodyH / 2 + 1} r={3.5} fill="#0f172a" />
      <circle cx={bodyW / 2 - 6} cy={-bodyH / 2 - 1} r={3.5} fill="#0f172a" />
      <circle cx={bodyW / 2 - 6} cy={bodyH / 2 + 1} r={3.5} fill="#0f172a" />
      {/* número */}
      <circle cx={-bodyW / 2 + 14} cy={0} r={5} fill={secondaryColor} />
      <text
        x={-bodyW / 2 + 14} y={0}
        textAnchor="middle" dominantBaseline="central"
        fontSize={7} fontWeight={900}
        fill={primaryColor}
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {number}
      </text>
    </g>
  );
}
