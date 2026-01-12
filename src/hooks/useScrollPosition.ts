import { useState, useCallback, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | 'none';

interface UseScrollPositionReturn {
  scrollY: number;
  scrollX: number;
  scrollDirection: ScrollDirection;
  isAtTop: boolean;
  isAtBottom: boolean;
  progress: number; // 0 to 1
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToElement: (element: HTMLElement | string, options?: { offset?: number; behavior?: ScrollBehavior }) => void;
}

export const useScrollPosition = (
  containerRef?: React.RefObject<HTMLElement>
): UseScrollPositionReturn => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollPosition = useCallback(() => {
    const container = containerRef?.current || document.documentElement;
    const scrollTop = containerRef?.current 
      ? container.scrollTop 
      : window.scrollY;
    const scrollLeft = containerRef?.current 
      ? container.scrollLeft 
      : window.scrollX;
    
    const scrollHeight = container.scrollHeight - container.clientHeight;
    
    setScrollY(scrollTop);
    setScrollX(scrollLeft);
    setIsAtTop(scrollTop <= 0);
    setIsAtBottom(scrollTop >= scrollHeight - 10);
    setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    
    // Determine scroll direction
    if (scrollTop > lastScrollY.current) {
      setScrollDirection('down');
    } else if (scrollTop < lastScrollY.current) {
      setScrollDirection('up');
    }
    
    lastScrollY.current = scrollTop;
    ticking.current = false;
  }, [containerRef]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(updateScrollPosition);
      ticking.current = true;
    }
  }, [updateScrollPosition]);

  useEffect(() => {
    const target = containerRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateScrollPosition();
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, handleScroll, updateScrollPosition]);

  const scrollTo = useCallback((options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
    const target = containerRef?.current || window;
    target.scrollTo(options);
  }, [containerRef]);

  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollTo({ top: 0, behavior });
  }, [scrollTo]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef?.current || document.documentElement;
    const scrollHeight = container.scrollHeight;
    scrollTo({ top: scrollHeight, behavior });
  }, [containerRef, scrollTo]);

  const scrollToElement = useCallback((
    element: HTMLElement | string,
    options?: { offset?: number; behavior?: ScrollBehavior }
  ) => {
    const { offset = 0, behavior = 'smooth' } = options || {};
    
    const el = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;
    
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY - offset;
    
    scrollTo({ top: absoluteTop, behavior });
  }, [scrollTo]);

  return {
    scrollY,
    scrollX,
    scrollDirection,
    isAtTop,
    isAtBottom,
    progress,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    scrollToElement,
  };
};

// Hook for scroll-based animations
export const useScrollTrigger = (
  threshold = 100
): { triggered: boolean; progress: number } => {
  const { scrollY } = useScrollPosition();
  const triggered = scrollY > threshold;
  const progress = Math.min(scrollY / threshold, 1);
  
  return { triggered, progress };
};
