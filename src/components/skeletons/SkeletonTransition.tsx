import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  duration?: number;
}

export const SkeletonTransition = forwardRef<HTMLDivElement, SkeletonTransitionProps>(
  function SkeletonTransition({
    isLoading,
    skeleton,
    children,
    duration = 300
  }, ref) {
    const content = isLoading ? skeleton : children;

    return (
      <motion.div
        ref={ref}
        key={isLoading ? "skeleton" : "content"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration / 1000 }}
      >
        {content}
      </motion.div>
    );
  }
);

SkeletonTransition.displayName = "SkeletonTransition";
