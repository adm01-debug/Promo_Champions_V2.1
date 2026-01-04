import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        if (event.exception) {
          console.error('Sentry error:', event.exception);
        }
        return event;
      }
    });
  }
}

export const captureError = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
