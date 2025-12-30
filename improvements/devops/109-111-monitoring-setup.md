# Melhorias 109-111 - Monitoring & Alerts Setup

## 109. Sentry - Error Tracking

### Installation
```bash
npm install --save @sentry/react @sentry/vite-plugin
```

### Configuration (src/main.tsx)
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Vite Config
```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default {
  plugins: [
    sentryVitePlugin({
      org: "your-org",
      project: "salespro",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
};
```

## 110. Vercel Analytics - Performance

### Installation
```bash
npm install --save @vercel/analytics
```

### Integration (src/main.tsx)
```typescript
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
  </>
);
```

## 111. Supabase Metrics - Database

### Dashboard Setup
1. Go to Supabase Dashboard > Settings > Metrics
2. Enable monitoring for:
   - Query performance
   - Connection pool
   - Cache hit rate
   - Disk usage

### Alerts Configuration
- Slow queries (> 1s)
- High connection count (> 80%)
- Low cache hit rate (< 90%)
- High disk usage (> 80%)

### Custom Metrics Query
```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```
