import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

class ErrorTracking {
  private initialized = false;

  init(config: ErrorTrackingConfig) {
    if (this.initialized) return;

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: config.tracesSampleRate,
      replaysSessionSampleRate: config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException;
          console.error('Error captured:', error);
        }
        return event;
      },
    });

    this.initialized = true;
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  clearUser() {
    Sentry.setUser(null);
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (context) {
      Sentry.setContext('custom', context);
    }
    Sentry.captureException(error);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  setTags(tags: Record<string, string>) {
    Sentry.setTags(tags);
  }

  startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }
}

export const errorTracking = new ErrorTracking();

export const initErrorTracking = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  errorTracking.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const withErrorTracking = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorTracking.captureException(error);
          if (errorHandler) {
            errorHandler(error);
          }
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorTracking.captureException(error as Error);
      if (errorHandler) {
        errorHandler(error as Error);
      }
      throw error;
    }
  }) as T;
};

export { Sentry };
