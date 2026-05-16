import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';

const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 20 : -20,
    filter: 'blur(4px)',
  }),
  in: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
  },
  out: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    filter: 'blur(4px)',
  }),
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState(1);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // If it's a "POP" (back/forward browser buttons), we can try to guess direction
    // Or if we have a way to track depth
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
        transition={pageTransition}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
