import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

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
  const content = isLoading ? skeleton : children;

  return (
    <motion.div
      key={isLoading ? "skeleton" : "content"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration / 1000 }}
    >
      {content}
    </motion.div>
  );
};
