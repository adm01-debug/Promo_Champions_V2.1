import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const RouteProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset and show on location change
    setIsVisible(true);
    setProgress(0);
    
    // Quick jump to simulate initial loading
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(70), 200);
    
    // Complete after a short delay
    const timer3 = setTimeout(() => {
      setProgress(100);
      const timer4 = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer4);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-background/10 z-[9999] overflow-hidden backdrop-blur-md"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              width: { type: "spring", stiffness: 100, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="h-full bg-gradient-to-r from-primary via-primary-glow to-accent shadow-[0_0_20px_hsl(var(--primary)/0.6)] relative"
          >
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

