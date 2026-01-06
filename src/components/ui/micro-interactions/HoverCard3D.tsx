import { FC, useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HoverCard3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export const HoverCard3D: FC<HoverCard3DProps> = ({
  children,
  className,
  intensity = 10,
  glare = true
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateXVal = (mouseY / (rect.height / 2)) * -intensity;
    const rotateYVal = (mouseX / (rect.width / 2)) * intensity;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    
    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY });
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
      
      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }}
          animate={{ opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0 }}
        />
      )}
    </motion.div>
  );
};
