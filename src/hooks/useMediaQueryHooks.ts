import { useMediaQuery } from '@/hooks/useMediaQuery';

interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

export function useIsMobileHook(options?: UseMediaQueryOptions) {
  return useMediaQuery('(max-width: 767px)', options);
}

export function useIsTabletHook(options?: UseMediaQueryOptions) {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)', options);
}

export function useIsDesktopHook(options?: UseMediaQueryOptions) {
  return useMediaQuery('(min-width: 1024px)', options);
}

export function useTouchDevice() {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
