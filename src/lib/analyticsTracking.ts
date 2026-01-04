// Advanced Analytics Tracking
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

class AnalyticsTracker {
  private enabled = true;
  private userId: string | null = null;
  
  init(userId?: string) {
    this.userId = userId || null;
    
    // Initialize Google Analytics if available
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        user_id: this.userId,
      });
    }
  }
  
  trackEvent(event: AnalyticsEvent) {
    if (!this.enabled) return;
    
    console.log('[Analytics]', event);
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: this.userId,
      });
    }
    
    // Custom analytics endpoint
    this.sendToBackend(event);
  }
  
  private async sendToBackend(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          userId: this.userId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics', error);
    }
  }
  
  trackPageView(path: string, title: string) {
    this.trackEvent({
      category: 'PageView',
      action: 'view',
      label: `${title} (${path})`,
    });
  }
  
  trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent({
      category: 'UserAction',
      action,
      label: JSON.stringify(details),
    });
  }
  
  trackDealCreated(value: number) {
    this.trackEvent({
      category: 'Deal',
      action: 'created',
      value,
    });
  }
  
  trackDealWon(value: number) {
    this.trackEvent({
      category: 'Deal',
      action: 'won',
      value,
    });
  }
  
  disable() {
    this.enabled = false;
  }
  
  enable() {
    this.enabled = true;
  }
}

export const analytics = new AnalyticsTracker();

// Extend Window interface
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
