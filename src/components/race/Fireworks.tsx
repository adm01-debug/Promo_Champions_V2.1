import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface FireworksProps {
  /** Quando true, dispara 3 explosões em sequência. */
  active: boolean;
}

const COLORS = [
  'hsl(0 90% 60%)',
  'hsl(45 95% 60%)',
  'hsl(142 76% 50%)',
  'hsl(210 90% 60%)',
  'hsl(280 80% 65%)',
  'hsl(330 85% 65%)',
];

interface Burst {
  id: number;
  originX: string; // CSS %
  originY: string; // CSS %
  particles: Particle[];
  delay: number;
}

function makeBurst(id: number, originX: string, originY: string, delay: number): Burst {
  const count = 32;
  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const velocity = 120 + Math.random() * 140;
    return {
      id: i,
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
    };
  });
  return { id, originX, originY, particles, delay };
}

export function Fireworks({ active }: FireworksProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!active) return;
    const newBursts = [
      makeBurst(Date.now(), '15%', '20%', 0),
      makeBurst(Date.now() + 1, '85%', '20%', 350),
      makeBurst(Date.now() + 2, '50%', '15%', 700),
    ];
    setBursts(newBursts);
    const timer = window.setTimeout(() => setBursts([]), 2400);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="absolute"
            style={{ left: burst.originX, top: burst.originY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: burst.delay / 1000, duration: 0.05 }}
          >
            {/* Flash central */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 60,
                height: 60,
                background:
                  'radial-gradient(circle, hsl(0 0% 100% / 0.9) 0%, transparent 70%)',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ delay: burst.delay / 1000, duration: 0.5, ease: 'easeOut' }}
            />
            {/* Partículas */}
            {burst.particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: p.x,
                  y: p.y + 80, // gravidade
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{
                  delay: burst.delay / 1000,
                  duration: 1.4,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              />
            ))}
            {/* Anel shockwave */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ width: 40, height: 40, borderColor: 'hsl(45 95% 60% / 0.8)' }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ delay: burst.delay / 1000, duration: 0.9, ease: 'easeOut' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
