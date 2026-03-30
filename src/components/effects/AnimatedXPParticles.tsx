import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XPParticle {
  id: number;
  x: number;
  y: number;
  value: string;
  size: number;
  delay: number;
}

interface AnimatedXPParticlesProps {
  isActive: boolean;
  xpGained?: number;
  onComplete?: () => void;
}

export const AnimatedXPParticles = ({ isActive, xpGained = 0, onComplete }: AnimatedXPParticlesProps) => {
  const [particles, setParticles] = useState<XPParticle[]>([]);

  const createParticles = useCallback(() => {
    const newParticles: XPParticle[] = [];
    const count = Math.min(Math.max(Math.ceil(xpGained / 10), 5), 15);

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: 80 + Math.random() * 20,
        value: i < 3 ? `+${Math.ceil(xpGained / 3)}` : "",
        size: 12 + Math.random() * 8,
        delay: i * 0.1,
      });
    }

    return newParticles;
  }, [xpGained]);

  useEffect(() => {
    if (isActive) {
      setParticles(createParticles());

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, createParticles, onComplete]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {/* Glow effect at bottom */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-500/20 to-transparent"
          />
        )}
      </AnimatePresence>

      {/* Rising particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: `${particle.y - 60 - Math.random() * 30}%`,
              opacity: [0, 1, 0.8, 0],
              scale: [0, 1.2, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              delay: particle.delay,
              ease: "easeOut",
            }}
            className="absolute flex items-center gap-1"
          >
            {particle.value ? (
              <span className="text-blue-400 font-black text-sm drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]">
                {particle.value}
              </span>
            ) : (
              <Zap className="text-blue-400" style={{ width: particle.size, height: particle.size }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle trail */}
      <AnimatePresence>
        {particles.slice(0, 6).map((particle, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              opacity: 0,
            }}
            animate={{
              y: `${particle.y - 40 - Math.random() * 20}%`,
              x: `${particle.x + (Math.random() - 0.5) * 10}%`,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: particle.delay + 0.2,
            }}
            className="absolute w-1 h-1 rounded-full bg-blue-300"
          />
        ))}
      </AnimatePresence>

      {/* Central burst effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-500/30"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
