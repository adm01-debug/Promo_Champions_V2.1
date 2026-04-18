import { useEffect, useRef, useState } from 'react';
import { CHECKPOINTS, getPositionOnTrack } from '../raceTrackHelpers';

interface TireMark {
  id: string;
  x: number;
  y: number;
  rotation: number;
  createdAt: number;
}

interface TrackTireMarksProps {
  /** Snapshot atual { id, progress } dos carros — para detectar curvas cruzadas. */
  cars: Array<{ id: string; progress: number }>;
}

const MAX_MARKS = 30;
const FADE_MS = 1500;

/**
 * Overlay SVG: deixa rastros de pneu pretos translúcidos quando carros cruzam
 * checkpoints (curvas). Acumula até 30 marcas, fade suave.
 */
export function TrackTireMarks({ cars }: TrackTireMarksProps) {
  const prevRef = useRef<Map<string, number>>(new Map());
  const [marks, setMarks] = useState<TireMark[]>([]);

  useEffect(() => {
    const now = Date.now();
    const newMarks: TireMark[] = [];
    cars.forEach((c) => {
      const prev = prevRef.current.get(c.id);
      if (prev !== undefined) {
        for (const cp of CHECKPOINTS) {
          if (prev < cp && c.progress >= cp) {
            const pos = getPositionOnTrack(cp, 0);
            newMarks.push({
              id: `${c.id}-${cp}-${now}-${Math.random()}`,
              x: pos.x,
              y: pos.y,
              rotation: pos.rotation,
              createdAt: now,
            });
          }
        }
      }
      prevRef.current.set(c.id, c.progress);
    });
    if (newMarks.length > 0) {
      setMarks((prev) => {
        const cutoff = now - FADE_MS;
        const filtered = [...prev.filter((m) => m.createdAt > cutoff), ...newMarks];
        return filtered.slice(-MAX_MARKS);
      });
    }
  }, [cars.map((c) => `${c.id}:${Math.floor(c.progress * 200)}`).join('|')]);

  // GC periódico
  useEffect(() => {
    const id = window.setInterval(() => {
      const cutoff = Date.now() - FADE_MS;
      setMarks((prev) => {
        if (!prev.some((m) => m.createdAt < cutoff)) return prev;
        return prev.filter((m) => m.createdAt > cutoff);
      });
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const now = Date.now();
  return (
    <g pointerEvents="none" aria-hidden>
      {marks.map((m) => {
        const age = now - m.createdAt;
        const opacity = Math.max(0, 0.3 * (1 - age / FADE_MS));
        return (
          <g key={m.id} transform={`translate(${m.x} ${m.y}) rotate(${m.rotation})`}>
            <rect x={-12} y={-3} width={24} height={1.6} rx={0.8} fill="hsl(0 0% 0%)" opacity={opacity} />
            <rect x={-12} y={1.4} width={24} height={1.6} rx={0.8} fill="hsl(0 0% 0%)" opacity={opacity} />
          </g>
        );
      })}
    </g>
  );
}
