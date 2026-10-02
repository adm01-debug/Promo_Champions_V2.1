import { useState, useEffect } from 'react';

interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false } = options;

  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Common breakpoint hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
