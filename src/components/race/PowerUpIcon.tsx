import { motion } from 'framer-motion';

interface PowerUpIconProps {
  type: 'turbo' | 'shield' | 'lightning';
  x: number;
  y: number;
  onClick?: () => void;
  collected?: boolean;
}

const COLORS = {
  turbo: { bg: '#f97316', glow: '#fb923c', icon: '⚡' },
  shield: { bg: '#3b82f6', glow: '#60a5fa', icon: '🛡' },
  lightning: { bg: '#a855f7', glow: '#c084fc', icon: '✦' },
};

export function PowerUpIcon({ type, x, y, onClick, collected }: PowerUpIconProps) {
  const c = COLORS[type];
  if (collected) return null;
  return (
    <motion.g
      transform={`translate(${x} ${y})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0.9, 1.1, 0.9], opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ scale: { repeat: Infinity, duration: 1.2 }, opacity: { duration: 0.4 } }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <circle r={18} fill={c.glow} opacity={0.35} />
      <circle r={12} fill={c.bg} stroke="#fff" strokeWidth={2} />
      <text textAnchor="middle" dy={5} fontSize={14} fontWeight={900} fill="#fff" style={{ fontFamily: 'system-ui' }}>
        {c.icon}
      </text>
    </motion.g>
  );
}
