import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnimatedLevelIndicatorProps {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedLevelIndicator = ({ level, className = "", size = "md" }: AnimatedLevelIndicatorProps) => {
  if (level <= 0) return null;

  const particleCount = Math.min(Math.ceil(level / 5), 8);
  const isHighLevel = level >= 10;
  const isMasterLevel = level >= 25;

  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const containerSize = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: containerSize, height: containerSize }}>
      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isMasterLevel
            ? "radial-gradient(circle, rgba(250,204,21,0.3), transparent 70%)"
            : isHighLevel
            ? "radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)"
            : "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Rotating energy ring */}
      <motion.div
        className="absolute inset-1 rounded-full border border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          borderStyle: "dashed",
        }}
      />

      {/* Orbiting particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360;
        const radius = containerSize * 0.45;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: `${containerSize / 2 - containerSize * 0.02}px ${containerSize / 2 - containerSize * 0.02}px`,
              left: containerSize / 2 - 3 + Math.cos((angle * Math.PI) / 180) * radius,
              top: containerSize / 2 - 3 + Math.sin((angle * Math.PI) / 180) * radius,
            }}
          />
        );
      })}

      {/* Main level badge */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: containerSize * 0.65,
          height: containerSize * 0.65,
          background: isMasterLevel
            ? "linear-gradient(135deg, hsl(45 100% 50%), hsl(35 100% 45%))"
            : isHighLevel
            ? "linear-gradient(135deg, hsl(217 91% 60%), hsl(224 76% 48%))"
            : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Inner shine */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Level number */}
        <span className="relative z-10 font-black text-white" style={{ fontSize: containerSize * 0.22 }}>
          {level}
        </span>

        {/* Sparkle for high levels */}
        {isHighLevel && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-3 w-3 text-yellow-300" />
          </motion.div>
        )}
      </motion.div>

      {/* Master crown */}
      {isMasterLevel && (
        <motion.div
          className="absolute -top-2"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: containerSize * 0.25 }}
        >
          👑
        </motion.div>
      )}

      {/* Label */}
      <motion.div
        className="absolute -bottom-2 bg-primary/20 text-primary rounded-full px-1.5 font-bold"
        style={{ fontSize: containerSize * 0.14 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        LVL
      </motion.div>
    </div>
  );
};
