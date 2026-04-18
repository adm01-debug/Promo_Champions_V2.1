import { useEffect, useRef, useState } from 'react';
import { getPositionOnTrack } from './raceTrackHelpers';

interface LeaderNeonTrailProps {
  leaderId?: string;
  leaderProgress: number;
  /** Cor neon (HSL hex/string) — geralmente cor primária do time. */
  color: string;
  /** Quantidade de pontos históricos. */
  length?: number;
}

/**
 * Rastro neon (ghost trail) com ~8 pontos históricos do líder, em gradiente fade.
 * Reseta quando o líder muda. Renderizado como filho do <RaceTrack>.
 */
export function LeaderNeonTrail({
  leaderId,
  leaderProgress,
  color,
  length = 8,
}: LeaderNeonTrailProps) {
  const [points, setPoints] = useState<number[]>([]);
  const lastIdRef = useRef<string | undefined>(leaderId);

  useEffect(() => {
    if (leaderId !== lastIdRef.current) {
      // reset quando o líder muda
      setPoints([leaderProgress]);
      lastIdRef.current = leaderId;
      return;
    }
    setPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last !== undefined && Math.abs(leaderProgress - last) < 0.003) return prev;
      const next = [...prev, leaderProgress];
      return next.slice(-length);
    });
  }, [leaderId, leaderProgress, length]);

  if (points.length < 2) return null;

  return (
    <g pointerEvents="none" aria-hidden>
      {points.map((p, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const a = getPositionOnTrack(prev, 0);
        const b = getPositionOnTrack(p, 0);
        const opacity = (i / points.length) * 0.85;
        const width = 1.5 + (i / points.length) * 4;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            opacity={opacity}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        );
      })}
    </g>
  );
}
