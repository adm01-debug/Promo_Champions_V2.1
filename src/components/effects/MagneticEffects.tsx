import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingActionProps {
  children: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  offset?: { x?: number; y?: number };
  showOnScroll?: boolean;
  scrollThreshold?: number;
  className?: string;
}

export function FloatingAction({
  children,
  position = 'bottom-right',
  offset = { x: 16, y: 16 },
  showOnScroll = false,
  scrollThreshold = 200,
  className,
}: FloatingActionProps) {
  const [visible, setVisible] = useState(!showOnScroll);

  useEffect(() => {
    if (!showOnScroll) return;

    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll, scrollThreshold]);

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
  };

  return (
    <motion.div
      className={cn('fixed z-40', positionClasses[position], className)}
      style={{ marginRight: offset.x, marginBottom: offset.y }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
        y: visible ? 0 : 20,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function ParallaxCard({
  children,
  className,
  intensity = 10,
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotation.x, rotateY: rotation.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
