import { useEffect, useRef, useState } from 'react';
import { CHECKPOINTS, getPositionOnTrack } from '../raceTrackHelpers';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAt: number;
  life: number;
  kind: 'dust' | 'smoke';
}

interface TrackDustParticlesProps {
  /** Snapshot atual { id, progress } dos carros — para detectar curvas cruzadas. */
  cars: Array<{ id: string; progress: number }>;
}

const MAX_PARTICLES = 120;
const LIFE_MS = 700;
const FRAME_MS = 33; // ~30fps

/**
 * Overlay SVG: emite poeira/fumaça quando carros cruzam checkpoints (curvas).
 * Reaproveita o padrão de `TrackTireMarks` para detecção, somando atmosfera arcade.
 */
export function TrackDustParticles({ cars }: TrackDustParticlesProps) {
  const prevRef = useRef<Map<string, number>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const [, setTick] = useState(0);

  // Detecta cruzamento de checkpoints e emite partículas
  useEffect(() => {
    const now = Date.now();
    const emitted: Particle[] = [];
    cars.forEach((c) => {
      const prev = prevRef.current.get(c.id);
      if (prev !== undefined) {
        for (const cp of CHECKPOINTS) {
          if (prev < cp && c.progress >= cp) {
            const jitter = (Math.random() - 0.5) * 6;
            const pos = getPositionOnTrack(cp, jitter);
            // Direção contrária ao carro (rotation + 180°) ± 40°
            const baseAngle = ((pos.rotation + 180) * Math.PI) / 180;
            const count = 5 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
              const spread = ((Math.random() - 0.5) * 80 * Math.PI) / 180;
              const angle = baseAngle + spread;
              const speed = 0.25 + Math.random() * 0.55;
              emitted.push({
                id: `${c.id}-${cp}-${now}-${i}-${Math.random()}`,
                x: pos.x,
                y: pos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                bornAt: now,
                life: LIFE_MS * (0.7 + Math.random() * 0.6),
                kind: Math.random() < 0.6 ? 'dust' : 'smoke',
              });
            }
          }
        }
      }
      prevRef.current.set(c.id, c.progress);
    });
    if (emitted.length > 0) {
      const merged = [...particlesRef.current, ...emitted];
      particlesRef.current = merged.slice(-MAX_PARTICLES);
      setTick((t) => t + 1);
    }
  }, [cars.map((c) => `${c.id}:${Math.floor(c.progress * 200)}`).join('|')]);

  // Loop de animação (~30fps) atualiza posição/idade e força re-render
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      if (dt >= FRAME_MS) {
        last = t;
        const now = Date.now();
        const next: Particle[] = [];
        for (const p of particlesRef.current) {
          if (now - p.bornAt < p.life) {
            // dt em frames (~1 a 30fps); avança suavemente
            const step = dt / 16;
            next.push({ ...p, x: p.x + p.vx * step, y: p.y + p.vy * step });
          }
        }
        if (next.length !== particlesRef.current.length || next.length > 0) {
          particlesRef.current = next;
          setTick((tk) => tk + 1);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const now = Date.now();
  return (
    <g pointerEvents="none" aria-hidden>
      {particlesRef.current.map((p) => {
        const age = now - p.bornAt;
        const k = Math.min(1, Math.max(0, age / p.life));
        const r = 1.5 + k * 3.5;
        const baseOpacity = p.kind === 'dust' ? 0.55 : 0.4;
        const opacity = baseOpacity * (1 - k);
        const fill = p.kind === 'dust' ? 'hsl(var(--race-runoff))' : 'hsl(0 0% 80%)';
        return <circle key={p.id} cx={p.x} cy={p.y} r={r} fill={fill} opacity={opacity} />;
      })}
    </g>
  );
}
