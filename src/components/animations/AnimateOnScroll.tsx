import { useRef, useEffect, forwardRef, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'flip'
  | 'slide-up'
  | 'bounce';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const animations: Record<AnimationType, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  'zoom-in': {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  'zoom-out': {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { opacity: 1, scale: 1 },
  },
  'flip': {
    hidden: { opacity: 0, rotateY: 90 },
    visible: { opacity: 1, rotateY: 0 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
  },
  'bounce': {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }
    },
  },
};

/**
 * AnimateOnScroll - Wrapper component that animates children when they enter the viewport
 */
export const AnimateOnScroll = forwardRef<HTMLDivElement, AnimateOnScrollProps>(({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  triggerOnce = true,
  className,
  as = 'div',
}, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = forwardedRef || internalRef;
  
  const isInView = useInView(ref as React.RefObject<HTMLDivElement>, { 
    once: triggerOnce, 
    amount: threshold 
  });

  const variants = animations[animation];
  const Component = motion[as] as any;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </Component>
  );
});

AnimateOnScroll.displayName = 'AnimateOnScroll';

/**
 * StaggerChildren - Wrapper that staggers animation of child elements
 */
interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Child element for StaggerChildren
 */
interface StaggerItemProps {
  children: ReactNode;
  animation?: AnimationType;
  className?: string;
}

export function StaggerItem({
  children,
  animation = 'fade-up',
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={animations[animation]}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
