import { getPositionOnTrack } from './raceTrackHelpers';

interface SlipstreamLinesProps {
  /** Progresso do carro perseguidor (2º). */
  chaserProgress: number;
  /** Progresso do líder. */
  leaderProgress: number;
  /** Distância máxima em progresso para mostrar slipstream — padrão 3%. */
  threshold?: number;
}

/**
 * 3 linhas de vento animadas atrás do líder quando o 2º está colado.
 * Renderizado como filhos do <RaceTrack>, em coordenadas da pista.
 */
export function SlipstreamLines({
  chaserProgress,
  leaderProgress,
  threshold = 0.03,
}: SlipstreamLinesProps) {
  const gap = leaderProgress - chaserProgress;
  if (gap <= 0 || gap > threshold) return null;

  // 3 segmentos atrás do líder, decrescendo em opacidade
  const lines = [0.004, 0.008, 0.012].map((dp, i) => {
    const segStart = getPositionOnTrack(leaderProgress - dp, -6);
    const segEnd = getPositionOnTrack(leaderProgress - dp - 0.005, -6);
    const segStart2 = getPositionOnTrack(leaderProgress - dp, 6);
    const segEnd2 = getPositionOnTrack(leaderProgress - dp - 0.005, 6);
    return { i, segStart, segEnd, segStart2, segEnd2, opacity: 0.55 - i * 0.15 };
  });

  return (
    <g pointerEvents="none" aria-hidden>
      {lines.map(({ i, segStart, segEnd, segStart2, segEnd2, opacity }) => (
        <g key={i}>
          <line
            x1={segStart.x}
            y1={segStart.y}
            x2={segEnd.x}
            y2={segEnd.y}
            stroke="hsl(0 0% 100%)"
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={opacity}
            style={{
              animation: `race-slipstream-pulse 0.5s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
          <line
            x1={segStart2.x}
            y1={segStart2.y}
            x2={segEnd2.x}
            y2={segEnd2.y}
            stroke="hsl(0 0% 100%)"
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={opacity}
            style={{
              animation: `race-slipstream-pulse 0.5s ease-in-out infinite`,
              animationDelay: `${i * 0.08 + 0.04}s`,
            }}
          />
        </g>
      ))}
    </g>
  );
}
