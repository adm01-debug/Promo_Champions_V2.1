import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CarExhaustProps {
  intensity: number;
  hidden?: boolean;
}

export const CarExhaust = ({ intensity, hidden }: CarExhaustProps) => {
  if (hidden) return null;
  return (
    <g transform="translate(-30, 0)">
       <motion.circle
        r={2 * intensity}
        fill="hsl(0 0% 100% / 0.3)"
        animate={{
          x: [-2, -15],
          scale: [1, 2.5],
          opacity: [0.6, 0]
        }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'easeOut' }}
      />
    </g>
  );
};
