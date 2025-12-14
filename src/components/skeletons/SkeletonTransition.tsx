import { ReactNode, useState, useEffect, Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
  /** Duration of the transition in milliseconds */
  duration?: number;
  /** Enable staggered animation for child sections */
  staggered?: boolean;
  /** Delay between each child animation in milliseconds */
  staggerDelay?: number;
}

export function SkeletonTransition({
  isLoading,
  skeleton,
  children,
  className,
  duration = 300,
  staggered = true,
  staggerDelay = 80,
}: SkeletonTransitionProps) {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading && showSkeleton) {
      // Start transition
      setIsTransitioning(true);
      
      // After fade out, switch content
      const fadeOutTimer = setTimeout(() => {
        setShowSkeleton(false);
        // Small delay before showing content to ensure smooth transition
        setTimeout(() => setShowContent(true), 50);
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
      setShowContent(false);
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

  // If staggered animation is enabled, wrap children with staggered delays
  if (staggered && showContent) {
    return (
      <div className={cn(className)}>
        {Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            return (
              <StaggeredSection 
                key={index} 
                delay={index * staggerDelay}
                show={showContent}
              >
                {child}
              </StaggeredSection>
            );
          }
          return child;
        })}
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
 * Wrapper for staggered section animation
 */
function StaggeredSection({ 
  children, 
  delay,
  show,
}: { 
  children: ReactNode; 
  delay: number;
  show: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4"
      )}
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

/**
 * Staggered container that animates direct children with delays
 * Use this for grids or lists where each item should animate in sequence
 */
export function StaggeredContainer({
  children,
  className,
  baseDelay = 0,
  staggerDelay = 60,
  show = true,
}: {
  children: ReactNode;
  className?: string;
  baseDelay?: number;
  staggerDelay?: number;
  show?: boolean;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <StaggeredSection 
              key={index} 
              delay={baseDelay + index * staggerDelay}
              show={show}
            >
              {child}
            </StaggeredSection>
          );
        }
        return child;
      })}
    </div>
  );
}
