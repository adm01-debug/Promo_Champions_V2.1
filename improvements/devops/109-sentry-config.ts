// Melhoria 109 - Sentry Configuration
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
