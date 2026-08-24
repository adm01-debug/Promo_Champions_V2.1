import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  /** Transition duration in ms */
  duration?: number;
  /** Add a subtle slide-up to content reveal */
  slideUp?: boolean;
}

const skeletonVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 0.99 },
};

const contentVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const contentFlatVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SkeletonTransition: FC<SkeletonTransitionProps> = ({
  isLoading,
  skeleton,
  children,
  duration = 350,
  slideUp = true,
}) => {
  const durationSec = duration / 1000;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: durationSec * 0.6, ease: 'easeOut' }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={slideUp ? contentVariants : contentFlatVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ 
            duration: durationSec, 
            ease: [0.4, 0, 0.2, 1],
            y: { duration: durationSec * 0.8 }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
