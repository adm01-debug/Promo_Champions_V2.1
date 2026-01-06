import React, { lazy, ComponentType, Suspense, useState, useEffect, useRef, RefObject } from 'react';

type LazyComponentFactory<T extends ComponentType<unknown>> = () => Promise<{ default: T }>;

export function lazyLoad<T extends ComponentType<unknown>>(
  factory: LazyComponentFactory<T>,
  fallback?: React.ReactNode
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(factory);
  
  const LazyWrapper: React.FC<React.ComponentProps<T>> = (props) => {
    return React.createElement(
      Suspense,
      { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props as any)
    );
  };

  return LazyWrapper;
}

// Image lazy loading
export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);
  
  return { imageSrc, isLoading };
};

interface UseInViewResult {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
}

// Intersection Observer for lazy loading
export const useInView = (options?: IntersectionObserverInit): UseInViewResult => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);
  
  return { ref, isInView };
};
