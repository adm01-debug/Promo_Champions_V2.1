// Analytics Events Layer - Centralized event tracking

type EventCategory = 
  | 'user' 
  | 'sales' 
  | 'navigation' 
  | 'feature' 
  | 'error' 
  | 'performance';

type EventAction = 
  | 'click' 
  | 'view' 
  | 'submit' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'error' 
  | 'success';

interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig = {
    enabled: true,
    debug: import.meta.env.DEV,
    sampleRate: 1.0,
    batchSize: 10,
    flushInterval: 30000,
  };
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startAutoFlush();
    this.setupPageVisibilityHandler();
  }

  private startAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupPageVisibilityHandler() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  track(
    category: EventCategory,
    action: EventAction,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) {
    if (!this.config.enabled || !this.shouldSample()) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
    };

    this.events.push(event);

    if (this.config.debug) {
      console.log('[Analytics]', event);
    }

    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Convenience methods
  trackPageView(pageName: string, metadata?: Record<string, unknown>) {
    this.track('navigation', 'view', pageName, undefined, metadata);
  }

  trackClick(elementName: string, metadata?: Record<string, unknown>) {
    this.track('user', 'click', elementName, undefined, metadata);
  }

  trackSale(saleId: string, amount: number, metadata?: Record<string, unknown>) {
    this.track('sales', 'create', saleId, amount, metadata);
  }

  trackFeatureUsage(featureName: string, metadata?: Record<string, unknown>) {
    this.track('feature', 'view', featureName, undefined, metadata);
  }

  trackError(errorName: string, metadata?: Record<string, unknown>) {
    this.track('error', 'error', errorName, undefined, metadata);
  }

  trackPerformance(metricName: string, value: number, metadata?: Record<string, unknown>) {
    this.track('performance', 'view', metricName, value, metadata);
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    if (this.config.debug) {
      console.log('[Analytics] Flushing', eventsToSend.length, 'events');
    }

    // In production, send to analytics endpoint
    // For now, just log in debug mode
    try {
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(eventsToSend),
      // });
    } catch (error) {
      // Re-add failed events
      this.events.unshift(...eventsToSend);
      console.error('[Analytics] Failed to flush events:', error);
    }
  }

  configure(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
    if (config.flushInterval) {
      this.startAutoFlush();
    }
  }

  getEventCount(): number {
    return this.events.length;
  }
}

export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}
