import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PrefetchConfig {
  routes: string[];
  components?: Record<string, () => Promise<any>>;
  delay?: number;
}

/**
 * usePrefetch - Prefetches routes and components for faster navigation
 */
export function usePrefetch(config: PrefetchConfig) {
  const { routes, components = {}, delay = 2000 } = config;
  const location = useLocation();

  const prefetchRoute = useCallback((route: string) => {
    // Create a link element to prefetch the route
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }, []);

  const prefetchComponent = useCallback(async (loader: () => Promise<any>) => {
    try {
      await loader();
    } catch (error) {
      // Silently fail - component will load normally when needed
    }
  }, []);

  // Prefetch adjacent routes after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      routes.forEach(route => {
        if (route !== location.pathname) {
          prefetchRoute(route);
        }
      });

      Object.values(components).forEach(loader => {
        prefetchComponent(loader);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [routes, components, delay, location.pathname, prefetchRoute, prefetchComponent]);

  return { prefetchRoute, prefetchComponent };
}

/**
 * useLinkPrefetch - Prefetches on hover/focus for instant navigation
 */
export function useLinkPrefetch() {
  const prefetchedUrls = new Set<string>();

  const prefetch = useCallback((url: string) => {
    if (prefetchedUrls.has(url)) return;
    prefetchedUrls.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }, []);

  const getLinkProps = useCallback((url: string) => ({
    onMouseEnter: () => prefetch(url),
    onFocus: () => prefetch(url),
    onTouchStart: () => prefetch(url),
  }), [prefetch]);

  return { prefetch, getLinkProps };
}

/**
 * useIdleCallback - Runs callback when browser is idle
 */
export function useIdleCallback(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(callback, { timeout: 5000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      // Fallback for Safari
      const timer = setTimeout(callback, 1);
      return () => clearTimeout(timer);
    }
  }, deps);
}

/**
 * useDataPrefetch - Prefetches data for anticipated user actions
 */
export function useDataPrefetch<T>(
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
    delay?: number;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const { enabled = true, delay = 1000, onSuccess } = options;

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(async () => {
      try {
        const data = await fetcher();
        onSuccess?.(data);
      } catch (error) {
        // Silently fail
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay, fetcher, onSuccess]);
}
