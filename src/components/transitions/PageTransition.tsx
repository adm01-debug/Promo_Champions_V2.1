import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 10 : -10,
    scale: 0.995,
  }),
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    }
  },
  out: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -10 : 10,
    scale: 1.005,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    }
  }),
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24,
    }
  }
};

/**
 * Unified PageTransition - Handles smart direction detection (back/forward)
 * and providing a premium app-like feel.
 */
export const PageTransition: FC<PageTransitionProps> = ({ children, className }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState(1);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const currentDepth = location.pathname.split('/').filter(Boolean).length;
    const prevDepth = prevPathRef.current.split('/').filter(Boolean).length;

    if (navigationType === 'POP') {
      setDirection(-1);
    } else if (currentDepth < prevDepth) {
      setDirection(-1);
    } else {
      setDirection(1);
    }

    prevPathRef.current = location.pathname;
    
    // Smooth scroll to top on every page change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, navigationType]);

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className={cn("w-full min-h-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const StaggeredContainer: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ 
  children, 
  className,
  delay = 0 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay
          }
        }
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
