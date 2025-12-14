import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface QueryMetrics {
  queryKey: string;
  duration: number;
  timestamp: number;
  status: "success" | "error";
  dataSize?: number;
}

// Store for query metrics
const queryMetricsStore: QueryMetrics[] = [];
const MAX_STORED_METRICS = 100;
const SLOW_QUERY_THRESHOLD_MS = 1000; // 1 second

// Add metric to store
function addMetric(metric: QueryMetrics) {
  queryMetricsStore.unshift(metric);
  if (queryMetricsStore.length > MAX_STORED_METRICS) {
    queryMetricsStore.pop();
  }

  // Log slow queries in development
  if (import.meta.env.DEV && metric.duration > SLOW_QUERY_THRESHOLD_MS) {
    console.warn(
      `[SLOW QUERY] ${metric.queryKey} took ${metric.duration}ms`,
      metric
    );
  }
}

// Get metrics summary
export function getQueryMetrics() {
  const metrics = [...queryMetricsStore];
  
  if (metrics.length === 0) {
    return {
      totalQueries: 0,
      avgDuration: 0,
      slowQueries: 0,
      errorRate: 0,
      byQueryKey: {},
    };
  }

  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  const slowQueries = metrics.filter(m => m.duration > SLOW_QUERY_THRESHOLD_MS);
  const errorQueries = metrics.filter(m => m.status === "error");

  // Group by query key
  const byQueryKey: Record<string, { count: number; avgDuration: number; errors: number }> = {};
  metrics.forEach(m => {
    if (!byQueryKey[m.queryKey]) {
      byQueryKey[m.queryKey] = { count: 0, avgDuration: 0, errors: 0 };
    }
    byQueryKey[m.queryKey].count++;
    byQueryKey[m.queryKey].avgDuration += m.duration;
    if (m.status === "error") byQueryKey[m.queryKey].errors++;
  });

  // Calculate averages
  Object.keys(byQueryKey).forEach(key => {
    byQueryKey[key].avgDuration = Math.round(byQueryKey[key].avgDuration / byQueryKey[key].count);
  });

  return {
    totalQueries: metrics.length,
    avgDuration: Math.round(totalDuration / metrics.length),
    slowQueries: slowQueries.length,
    errorRate: Math.round((errorQueries.length / metrics.length) * 100),
    byQueryKey,
    recentMetrics: metrics.slice(0, 10),
  };
}

// Clear metrics
export function clearQueryMetrics() {
  queryMetricsStore.length = 0;
}

// Hook to monitor a specific query
export function useQueryPerformance<T>(
  queryKey: string,
  data: T | undefined,
  isLoading: boolean,
  isError: boolean
) {
  const startTime = useRef<number | null>(null);
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (isLoading && startTime.current === null) {
      startTime.current = performance.now();
      hasRecorded.current = false;
    }

    if (!isLoading && startTime.current !== null && !hasRecorded.current) {
      const duration = Math.round(performance.now() - startTime.current);
      
      addMetric({
        queryKey,
        duration,
        timestamp: Date.now(),
        status: isError ? "error" : "success",
        dataSize: data ? JSON.stringify(data).length : undefined,
      });

      hasRecorded.current = true;
      startTime.current = null;
    }
  }, [isLoading, isError, queryKey, data]);
}

// Hook to get live metrics
export function useQueryMetricsLive() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" && event.query.state.fetchStatus === "idle") {
        const queryKey = JSON.stringify(event.query.queryKey);
        const state = event.query.state;
        
        if (state.dataUpdatedAt && state.fetchMeta) {
          // Query completed
          const meta = state.fetchMeta as { startTime?: number };
          if (meta.startTime) {
            const duration = state.dataUpdatedAt - meta.startTime;
            addMetric({
              queryKey,
              duration,
              timestamp: Date.now(),
              status: state.status === "error" ? "error" : "success",
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return getQueryMetrics;
}

// Console logger for metrics (call manually or on interval)
export function logQueryMetrics() {
  const metrics = getQueryMetrics();
  
  console.group("📊 Query Performance Metrics");
  console.log(`Total Queries: ${metrics.totalQueries}`);
  console.log(`Avg Duration: ${metrics.avgDuration}ms`);
  console.log(`Slow Queries (>${SLOW_QUERY_THRESHOLD_MS}ms): ${metrics.slowQueries}`);
  console.log(`Error Rate: ${metrics.errorRate}%`);
  
  if (Object.keys(metrics.byQueryKey).length > 0) {
    console.group("By Query Key:");
    Object.entries(metrics.byQueryKey)
      .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
      .forEach(([key, data]) => {
        console.log(`${key}: ${data.count} calls, avg ${data.avgDuration}ms, ${data.errors} errors`);
      });
    console.groupEnd();
  }
  console.groupEnd();
}

// Expose to window for debugging in production
if (typeof window !== "undefined") {
  (window as any).__queryMetrics = {
    get: getQueryMetrics,
    clear: clearQueryMetrics,
    log: logQueryMetrics,
  };
}
