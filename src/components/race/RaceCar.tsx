import { motion } from 'framer-motion';

interface RaceCarProps {
  number: number;
  primaryColor: string;
  secondaryColor: string;
  style: 'f1' | 'stock' | 'kart';
  scale?: number;
  showTrail?: boolean;
}

/**
 * SVG carro top-down cartoon. ViewBox local 60x30; quem usa controla translate/rotate.
 */
export function RaceCar({ number, primaryColor, secondaryColor, style, scale = 1, showTrail = false }: RaceCarProps) {
  const isF1 = style === 'f1';
  const isKart = style === 'kart';
  const bodyW = isF1 ? 56 : isKart ? 40 : 50;
  const bodyH = isF1 ? 18 : isKart ? 22 : 24;

  return (
    <g transform={`scale(${scale})`}>
      {showTrail && (
        <motion.ellipse
          cx={-30} cy={0} rx={22} ry={6}
          fill="url(#boostTrail)"
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: [0, 0.9, 0], scaleX: [0.3, 1.5, 2] }}
          transition={{ duration: 0.6, repeat: 2 }}
        />
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
