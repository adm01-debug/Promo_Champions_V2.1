import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  inp: number | null; // Interaction to Next Paint
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint
  
  // Navigation timing
  domContentLoaded: number | null;
  loadComplete: number | null;
  
  // Memory
  usedJSHeapSize: number | null;
  totalJSHeapSize: number | null;
  jsHeapSizeLimit: number | null;
  
  // Frame rate
  fps: number | null;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  value?: number;
}

export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    ttfb: null,
    fcp: null,
    domContentLoaded: null,
    loadComplete: null,
    usedJSHeapSize: null,
    totalJSHeapSize: null,
    jsHeapSizeLimit: null,
    fps: null,
  });

  const fpsRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Measure FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    const fps = 1000 / delta;
    fpsRef.current.push(fps);
    
    // Keep only last 60 frames
    if (fpsRef.current.length > 60) {
      fpsRef.current.shift();
    }
    
    // Update FPS every 10 frames
    if (fpsRef.current.length % 10 === 0) {
      const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
      setMetrics(prev => ({ ...prev, fps: Math.round(avgFps) }));
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, []);

  // Get memory info
  const getMemoryInfo = useCallback(() => {
    const performance = window.performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
    
    if (performance.memory) {
      setMetrics(prev => ({
        ...prev,
        usedJSHeapSize: performance.memory!.usedJSHeapSize,
        totalJSHeapSize: performance.memory!.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory!.jsHeapSizeLimit,
      }));
    }
  }, []);

  useEffect(() => {
    // Navigation timing
    const timing = performance.timing;
    if (timing) {
      setMetrics(prev => ({
        ...prev,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        ttfb: timing.responseStart - timing.navigationStart,
      }));
    }

    // Observe LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Observe FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const firstEntry = entries[0];
      if (firstEntry?.duration !== undefined) {
        setMetrics(prev => ({ ...prev, fid: firstEntry.duration! }));
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Observe CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Observe FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // Start FPS measurement
    animationFrameRef.current = requestAnimationFrame(measureFPS);

    // Update memory periodically
    const memoryInterval = setInterval(getMemoryInfo, 5000);

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(memoryInterval);
    };
  }, [measureFPS, getMemoryInfo]);

  const getVitalRating = useCallback((metric: keyof PerformanceMetrics, value: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (value === null) return 'unknown';

    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      inp: { good: 200, poor: 500 },
      ttfb: { good: 800, poor: 1800 },
      fcp: { good: 1800, poor: 3000 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, []);

  const formatBytes = useCallback((bytes: number | null): string => {
    if (bytes === null) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }, []);

  return {
    metrics,
    getVitalRating,
    formatBytes,
  };
}
