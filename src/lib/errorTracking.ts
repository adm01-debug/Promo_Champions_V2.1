// Error Tracking with Sentry
import * as Sentry from '@sentry/react';

export function initErrorTracking() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
    });
  }
}

export function trackError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  }
}

export function trackEvent(event: string, data?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(event, {
      level: 'info',
      extra: data
    });
  }
}

export const ErrorBoundary = Sentry.ErrorBoundary;
