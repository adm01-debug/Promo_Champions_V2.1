class PerformanceMonitor {
  private marks = new Map<string, number>();

  start(label: string) {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (!start) {
      console.warn(`Performance mark "${label}" not found`);
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(label);

    if (import.meta.env.DEV) {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    }

    // Enviar métricas para serviço de monitoramento
    if (import.meta.env.PROD && duration > 1000) {
      // this.sendMetric(label, duration);
    }

    return duration;
  }

  measure(label: string, fn: () => void) {
    this.start(label);
    fn();
    this.end(label);
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

export const perfMonitor = new PerformanceMonitor();
