import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  duration?: number;
}

export const SkeletonTransition: FC<SkeletonTransitionProps> = ({
  isLoading,
  skeleton,
  children,
  duration = 300
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
