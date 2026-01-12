import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
};

// Empty Inbox Illustration
export const EmptyInboxIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Box */}
      <motion.rect
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        x="25"
        y="35"
        width="70"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-muted-foreground/30"
      />
      {/* Box front */}
      <motion.path
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        d="M25 55 L60 75 L95 55"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* Sparkles */}
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        cx="85"
        cy="30"
        r="4"
        fill="currentColor"
        className="text-warning"
      />
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
        cx="30"
        cy="40"
        r="3"
        fill="currentColor"
        className="text-secondary"
      />
      {/* Check mark */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        d="M50 60 L55 65 L70 50"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
      />
    </motion.svg>
  );
};

// No Data Illustration
export const NoDataIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Chart bars */}
      {[
        { x: 25, height: 40, delay: 0.2 },
        { x: 45, height: 60, delay: 0.3 },
        { x: 65, height: 35, delay: 0.4 },
        { x: 85, height: 50, delay: 0.5 },
      ].map((bar, i) => (
        <motion.rect
          key={i}
          initial={{ height: 0, y: 95 }}
          animate={{ height: bar.height, y: 95 - bar.height }}
          transition={{ duration: 0.5, delay: bar.delay, type: 'spring' }}
          x={bar.x}
          width="15"
          rx="4"
          fill="currentColor"
          className="text-muted-foreground/20"
        />
      ))}
      {/* Base line */}
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6 }}
        x1="20"
        y1="95"
        x2="100"
        y2="95"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-muted-foreground/40"
      />
      {/* Question mark */}
      <motion.text
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.7, type: 'spring' }}
        x="60"
        y="45"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="currentColor"
        className="text-primary"
      >
        ?
      </motion.text>
    </motion.svg>
  );
};

// No Sales Illustration
export const NoSalesIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Shopping cart */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
        d="M25 30 L35 30 L45 70 L90 70 L95 45 L40 45"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {/* Wheels */}
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        cx="55"
        cy="80"
        r="6"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-primary"
      />
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
        cx="80"
        cy="80"
        r="6"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-primary"
      />
      {/* Star burst */}
      <motion.path
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        d="M75 25 L78 32 L85 32 L80 37 L82 45 L75 40 L68 45 L70 37 L65 32 L72 32 Z"
        fill="currentColor"
        className="text-warning"
      />
      {/* Arrow up */}
      <motion.path
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        d="M100 55 L105 50 L110 55 M105 50 V65"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
      />
    </motion.svg>
  );
};

// No Clients Illustration
export const NoClientsIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Main person */}
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        cx="60"
        cy="40"
        r="18"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-primary"
      />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        d="M35 95 Q35 70 60 65 Q85 70 85 95"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* Plus sign */}
      <motion.g
        initial={{ scale: 0, x: 10 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ type: 'spring', delay: 0.6 }}
      >
        <circle cx="95" cy="35" r="12" fill="currentColor" className="text-success" />
        <path
          d="M95 30 V40 M90 35 H100"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>
      {/* Decorative dots */}
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0.8] }}
        transition={{ delay: 0.8, duration: 0.5 }}
        cx="25"
        cy="50"
        r="4"
        fill="currentColor"
        className="text-secondary/50"
      />
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0.8] }}
        transition={{ delay: 1, duration: 0.5 }}
        cx="30"
        cy="70"
        r="3"
        fill="currentColor"
        className="text-warning/50"
      />
    </motion.svg>
  );
};

// Search Empty Illustration
export const SearchEmptyIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Magnifying glass */}
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        cx="50"
        cy="50"
        r="25"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="text-primary"
      />
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        x1="68"
        y1="68"
        x2="90"
        y2="90"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* X mark inside */}
      <motion.g
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.7 }}
      >
        <line
          x1="40"
          y1="40"
          x2="60"
          y2="60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <line
          x1="60"
          y1="40"
          x2="40"
          y2="60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
      </motion.g>
      {/* Floating dots */}
      <motion.circle
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        cx="95"
        cy="35"
        r="3"
        fill="currentColor"
        className="text-secondary"
      />
      <motion.circle
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        cx="25"
        cy="80"
        r="4"
        fill="currentColor"
        className="text-warning"
      />
    </motion.svg>
  );
};

// Goal Empty Illustration
export const GoalEmptyIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Target circles */}
      {[35, 25, 15, 5].map((r, i) => (
        <motion.circle
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 * i, type: 'spring' }}
          cx="60"
          cy="60"
          r={r}
          stroke="currentColor"
          strokeWidth="3"
          fill={i === 3 ? "currentColor" : "none"}
          className={i === 3 ? "text-primary" : i % 2 === 0 ? "text-primary/30" : "text-primary/60"}
        />
      ))}
      {/* Arrow */}
      <motion.g
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
      >
        <line
          x1="10"
          y1="25"
          x2="50"
          y2="55"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-warning"
        />
        <path
          d="M50 55 L45 45 M50 55 L40 50"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-warning"
        />
      </motion.g>
      {/* Sparkle */}
      <motion.circle
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        cx="95"
        cy="30"
        r="5"
        fill="currentColor"
        className="text-success"
      />
    </motion.svg>
  );
};

// Celebration Illustration (for success states)
export const CelebrationIllustration: FC<IllustrationProps> = ({ className, size = 'md' }) => {
  const s = sizeMap[size];
  
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(className)}
    >
      {/* Trophy */}
      <motion.path
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        d="M45 40 H75 V65 Q60 85 60 85 Q60 85 45 65 V40 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        className="text-warning"
      />
      {/* Handles */}
      <motion.path
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
        d="M45 45 Q30 45 30 55 Q30 65 45 65"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-warning"
      />
      <motion.path
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
        d="M75 45 Q90 45 90 55 Q90 65 75 65"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-warning"
      />
      {/* Base */}
      <motion.rect
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5 }}
        x="50"
        y="85"
        width="20"
        height="5"
        rx="2"
        fill="currentColor"
        className="text-warning"
      />
      <motion.rect
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.55 }}
        x="45"
        y="90"
        width="30"
        height="5"
        rx="2"
        fill="currentColor"
        className="text-warning/80"
      />
      {/* Confetti */}
      {[
        { cx: 25, cy: 30, r: 4, color: 'text-primary', delay: 0.7 },
        { cx: 95, cy: 25, r: 3, color: 'text-success', delay: 0.8 },
        { cx: 20, cy: 70, r: 3, color: 'text-secondary', delay: 0.9 },
        { cx: 100, cy: 60, r: 4, color: 'text-destructive', delay: 1 },
        { cx: 35, cy: 20, r: 2, color: 'text-warning', delay: 1.1 },
        { cx: 85, cy: 85, r: 3, color: 'text-primary', delay: 1.2 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: [0, 1, 1], y: [10, 0, 5] }}
          transition={{ delay: dot.delay, duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="currentColor"
          className={dot.color}
        />
      ))}
      {/* Star */}
      <motion.path
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
        d="M60 20 L62 28 L70 28 L64 33 L66 42 L60 37 L54 42 L56 33 L50 28 L58 28 Z"
        fill="currentColor"
        className="text-warning"
      />
    </motion.svg>
  );
};
