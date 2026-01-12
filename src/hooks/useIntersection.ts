import { useState, useEffect, useRef, RefObject } from 'react';

interface UseIntersectionOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * useIntersection - Hook for detecting when an element enters the viewport
 * Useful for lazy loading, animations on scroll, infinite scroll, etc.
 */
export function useIntersection<T extends Element = Element>(
  options: UseIntersectionOptions = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const { 
    threshold = 0, 
    root = null, 
    rootMargin = '0px',
    triggerOnce = false 
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already triggered, skip
    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);

        if (observerEntry.isIntersecting && triggerOnce) {
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting, entry];
}

/**
 * useIntersectionCallback - Hook variant that accepts a callback
 */
export function useIntersectionCallback<T extends Element = Element>(
  callback: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionOptions = {}
): RefObject<T> {
  const { 
    threshold = 0, 
    root = null, 
    rootMargin = '0px',
    triggerOnce = false 
  } = options;

  const ref = useRef<T>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry);

        if (entry.isIntersecting && triggerOnce) {
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, threshold, root, rootMargin, triggerOnce]);

  return ref;
}

/**
 * useIntersectionMany - Hook for observing multiple elements
 */
export function useIntersectionMany<T extends Element = Element>(
  refs: RefObject<T>[],
  options: UseIntersectionOptions = {}
): Map<Element, boolean> {
  const { 
    threshold = 0, 
    root = null, 
    rootMargin = '0px'
  } = options;

  const [intersectionMap, setIntersectionMap] = useState<Map<Element, boolean>>(new Map());

  useEffect(() => {
    const elements = refs.map(r => r.current).filter((el): el is T => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIntersectionMap(prev => {
          const newMap = new Map(prev);
          entries.forEach(entry => {
            newMap.set(entry.target, entry.isIntersecting);
          });
          return newMap;
        });
      },
      { threshold, root, rootMargin }
    );

    elements.forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [refs, threshold, root, rootMargin]);

  return intersectionMap;
}
