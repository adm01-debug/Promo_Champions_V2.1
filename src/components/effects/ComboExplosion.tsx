import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  emoji?: string;
}

interface ComboExplosionProps {
  trigger: boolean;
  tier: number;
  onComplete?: () => void;
}

const TIER_COLORS = [
  ["#94a3b8", "#64748b"], // Normal - gray
  ["#3b82f6", "#60a5fa"], // Aquecendo - blue
  ["#f97316", "#fb923c"], // Em Chamas - orange
  ["#ef4444", "#f87171"], // Imparável - red
  ["#f59e0b", "#fbbf24"], // LENDÁRIO - amber/gold
];

const TIER_EMOJIS = [
  ["⭐"],
  ["⚡", "💫"],
  ["🔥", "💥", "✨"],
  ["💀", "🔥", "⚡", "💥"],
  ["👑", "🏆", "💎", "🔥", "⚡"],
];

export function ComboExplosion({ trigger, tier, onComplete }: ComboExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger && tier > 0) {
      const colors = TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)];
      const emojis = TIER_EMOJIS[Math.min(tier, TIER_EMOJIS.length - 1)];
      const particleCount = 20 + tier * 10;

      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const velocity = 100 + Math.random() * 150;
        const useEmoji = Math.random() > 0.7;

        newParticles.push({
          id: i,
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          size: 4 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 720 - 360,
          emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        });
      }

      setParticles(newParticles);
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [trigger, tier, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
        >
          {/* Central flash */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-20 h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)][0]}80, transparent)`,
            }}
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0,
                rotate: particle.rotation,
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.5,
                ease: "easeOut",
              }}
              className="absolute"
            >
              {particle.emoji ? (
                <span style={{ fontSize: particle.size * 2 }}>{particle.emoji}</span>
              ) : (
                <div
                  className="rounded-full"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Shockwave ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-16 h-16 rounded-full border-2"
            style={{
              borderColor: TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)][0],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
