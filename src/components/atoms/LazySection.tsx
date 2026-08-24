import React, { Suspense } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const LazySection = ({
  children,
  fallback,
  threshold = 0.05,
  rootMargin = "100px",
  className,
}: LazySectionProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
    rootMargin,
  });

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Suspense fallback={fallback || <DefaultFallback />}>
            {children}
          </Suspense>
        </motion.div>
      ) : (
        fallback || <DefaultFallback />
      )}
    </div>
  );
};

const DefaultFallback = () => (
  <div className="space-y-4 w-full p-4">
    <Skeleton className="h-8 w-1/3 rounded-lg" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  </div>
);

LazySection.displayName = "LazySection";
