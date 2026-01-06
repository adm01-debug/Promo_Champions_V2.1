import React, { useEffect, ComponentType } from 'react';

// Performance Monitoring
export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private marks = new Map<string, number>();
  
  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }
  
  endMeasure(name: string) {
    const startTime = this.marks.get(name);
    
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return;
    }
    
    const duration = performance.now() - startTime;
    
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });
    
    this.marks.delete(name);
    
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }
  
  measure(name: string, fn: () => any) {
    this.startMeasure(name);
    const result = fn();
    this.endMeasure(name);
    return result;
  }
  
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }
  
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
  
  getAverageDuration(name: string): number {
    const relevant = this.metrics.filter(m => m.name === name);
    
    if (relevant.length === 0) return 0;
    
    const total = relevant.reduce((sum, m) => sum + m.duration, 0);
    return total / relevant.length;
  }
  
  getSlowestOperations(count: number = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }
  
  clear() {
    this.metrics = [];
    this.marks.clear();
  }
  
  reportToConsole() {
    console.group('Performance Metrics');
    
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);
    
    for (const [name, durations] of Object.entries(grouped)) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      console.log(`${name}:`, {
        count: durations.length,
        avg: avg.toFixed(2) + 'ms',
        min: min.toFixed(2) + 'ms',
        max: max.toFixed(2) + 'ms',
      });
    }
    
    console.groupEnd();
  }
}

export const perfMonitor = new PerformanceMonitor();

// HOC for performance monitoring
export const withPerformanceTracking = <P extends object>(
  Component: ComponentType<P>,
  name: string
) => {
  return function PerformanceTrackedComponent(props: P) {
    useEffect(() => {
      perfMonitor.startMeasure(`${name}-render`);
      return () => perfMonitor.endMeasure(`${name}-render`);
    }, []);
    
    return React.createElement(Component, props);
  };
};
