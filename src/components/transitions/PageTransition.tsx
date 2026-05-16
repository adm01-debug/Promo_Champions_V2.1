import React, { FC, ReactNode, useEffect, useRef, useState, memo, useMemo } from 'react';
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
    x: direction > 0 ? 20 : -20,
    scale: 0.98,
    filter: "blur(8px)",
  }),
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1], // Quartic ease out
      staggerChildren: 0.08,
      when: "beforeChildren",
    }
  },
  out: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    scale: 1.02,
    filter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    }
  }),
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.01,
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Unified PageTransition - Handles smart direction detection (back/forward)
 * and providing a premium app-like feel.
 */
export const PageTransition: FC<PageTransitionProps> = memo(({ children, className }) => {
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
    
    // Optimized scroll to top
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, navigationType]);

  const transitionDivStyles = useMemo(() => 
    cn("w-full min-h-full will-change-[transform,opacity]", className), 
  [className]);

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className={transitionDivStyles}
      >
        {/* Futurist loading line decoration */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-[1px] bg-primary/40 z-[100] pointer-events-none"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = "PageTransition";

export const StaggeredContainer: FC<{ children: ReactNode; className?: string; delay?: number }> = memo(({ 
  children, 
  className,
  delay = 0 
}) => {
  const containerVariantsLocal = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay
      }
    }
  }), [delay]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariantsLocal}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
});

StaggeredContainer.displayName = "StaggeredContainer";
