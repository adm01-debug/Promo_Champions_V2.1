import { motion } from "framer-motion";

interface AnimatedFireIndicatorProps {
  streakDays: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedFireIndicator = ({ streakDays, className = "", size = "md" }: AnimatedFireIndicatorProps) => {
  if (streakDays <= 0) return null;

  const isMilestone = [7, 14, 21, 30, 50, 100].includes(streakDays);
  const milestoneLevel = streakDays >= 100 ? 5 : streakDays >= 50 ? 4 : streakDays >= 30 ? 3 : streakDays >= 14 ? 2 : streakDays >= 7 ? 1 : 0;

  const flameCount = Math.min(Math.ceil(streakDays / 3), 5);
  const intensity = Math.min(streakDays / 10, 1);

  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const containerSize = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: containerSize, height: containerSize }}>
      {/* Milestone ring effect */}
      {isMilestone && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-streak"
          style={{ opacity: 0.7 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-t from-streak/40 to-transparent blur-md"
        animate={{ opacity: [0.3, 0.6 + intensity * 0.4, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Multiple flame layers */}
      {Array.from({ length: flameCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            fontSize: containerSize * 0.45 - i * 2,
            left: `${50 + (i - flameCount / 2) * 6}%`,
            transform: "translateX(-50%)",
          }}
          animate={{
            y: [0, -3 - i, 0],
            rotate: [(i - 2) * 5, (2 - i) * 5, (i - 2) * 5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8 + i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        >
          🔥
        </motion.div>
      ))}

      {/* Streak count badge */}
      <motion.div
        className="absolute -bottom-1 -right-1 bg-streak text-streak-foreground rounded-full flex items-center justify-center font-black shadow-lg"
        style={{
          width: containerSize * 0.4,
          height: containerSize * 0.4,
          fontSize: containerSize * 0.18,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        {streakDays}
      </motion.div>

      {/* Rising sparks */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-1 h-1 rounded-full bg-coins"
          style={{ left: `${30 + i * 20}%` }}
          animate={{
            y: [0, -20 - Math.random() * 15],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};
