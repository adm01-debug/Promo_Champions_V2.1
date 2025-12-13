import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
  /** Duration of the transition in milliseconds */
  duration?: number;
}

export function SkeletonTransition({
  isLoading,
  skeleton,
  children,
  className,
  duration = 300,
}: SkeletonTransitionProps) {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && showSkeleton) {
      // Start transition
      setIsTransitioning(true);
      
      // After fade out, switch content
      const fadeOutTimer = setTimeout(() => {
        setShowSkeleton(false);
      }, duration / 2);

      // End transition after full duration
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(transitionTimer);
      };
    } else if (isLoading && !showSkeleton) {
      setShowSkeleton(true);
    }
  }, [isLoading, showSkeleton, duration]);

  const transitionStyle = {
    transition: `opacity ${duration / 2}ms ease-in-out, transform ${duration / 2}ms ease-out`,
  };

  if (showSkeleton) {
    return (
      <div
        className={cn(
          className,
          isTransitioning && "opacity-0 scale-[0.99]"
        )}
        style={transitionStyle}
      >
        {skeleton}
      </div>
    );
  }

  return (
    <div
      className={cn(
        className,
        isTransitioning ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"
      )}
      style={transitionStyle}
    >
      {children}
    </div>
  );
}

/** 
 * Simple fade wrapper for content that should fade in after loading
 * Use this to wrap content sections that load independently
 */
export function FadeIn({ 
  children, 
  className,
  delay = 0,
  duration = 400,
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
}
