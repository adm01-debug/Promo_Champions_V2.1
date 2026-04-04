import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface AnimatedCoinsIndicatorProps {
  coins: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedCoinsIndicator = ({ coins, className = "", size = "md" }: AnimatedCoinsIndicatorProps) => {
  if (coins <= 0) return null;

  const coinCount = Math.min(Math.ceil(coins / 200), 8);
  const isWealthy = coins >= 1000;

  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const containerSize = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: containerSize, height: containerSize }}>
      {/* Golden glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-t from-coins/30 to-rank-gold/10 blur-sm"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Falling coins */}
      {Array.from({ length: coinCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-coins font-bold"
          style={{ fontSize: containerSize * 0.18 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{
            y: [-(10 + i * 5), containerSize + 10],
            x: [(i - coinCount / 2) * 8, (i - coinCount / 2) * 12],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          $
        </motion.div>
      ))}

      {/* Main coin */}
      <motion.div
        className="relative rounded-full flex items-center justify-center shadow-lg"
        style={{
          width: containerSize * 0.6,
          height: containerSize * 0.6,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
        }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Shine */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <Star className="relative z-10 text-primary-foreground" style={{ width: containerSize * 0.25, height: containerSize * 0.25 }} />
      </motion.div>

      {/* Sparkles for wealthy */}
      {isWealthy && Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-coins"
          style={{
            left: `${25 + i * 18}%`,
            top: `${20 + (i % 2) * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Count badge */}
      <motion.div
        className="absolute -bottom-1 bg-rank-gold text-primary-foreground rounded-full flex items-center justify-center font-black shadow-md"
        style={{
          minWidth: containerSize * 0.45,
          height: containerSize * 0.3,
          fontSize: containerSize * 0.14,
          padding: "0 4px",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
      >
        {coins >= 1000 ? `${(coins / 1000).toFixed(1)}k` : coins}
      </motion.div>

      {/* Treasure for wealthy */}
      {isWealthy && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ y: [0, -3, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: containerSize * 0.22 }}
        >
          💎
        </motion.div>
      )}
    </div>
  );
};
