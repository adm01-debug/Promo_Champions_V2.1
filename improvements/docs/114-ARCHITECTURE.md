# SalesPro Architecture

## Overview
SalesPro is a modern CRM built with React, TypeScript, and Supabase.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State**: TanStack Query (React Query)
- **UI**: shadcn/ui, Radix UI
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions, Vercel

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       v
┌─────────────────┐
│   React App     │ ← Vite, TypeScript
│   (Frontend)    │
└────────┬────────┘
         │
         v
┌────────────────────┐
│  TanStack Query    │ ← Caching, State
└────────┬───────────┘
         │
         v
┌────────────────────┐
│  Supabase Client   │ ← SDK
└────────┬───────────┘
         │
         v
┌────────────────────┐
│   Supabase         │
│  - PostgreSQL      │
│  - Auth            │
│  - Edge Functions  │
│  - Realtime        │
└────────────────────┘
```

## Data Flow

1. User interacts with React components
2. Components use custom hooks
3. Hooks leverage TanStack Query for caching
4. Supabase client executes database queries
5. RLS policies enforce security
6. Data flows back through hooks to components

## Key Decisions

### Why Supabase?
- Managed PostgreSQL
- Built-in authentication
- Row Level Security (RLS)
- Realtime subscriptions
- Edge Functions for serverless logic

### Why TanStack Query?
- Automatic caching and invalidation
- Optimistic updates
- Background refetching
- Pagination support

### Why Vite?
- Fast HMR
- Optimal bundling
- TypeScript support
- Plugin ecosystem

## Folder Structure

```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard widgets
│   └── pipeline/       # Kanban board
├── hooks/              # React hooks
│   ├── __tests__/      # Hook tests
│   └── use*.ts         # Custom hooks
├── pages/              # Route components
├── lib/                # Utilities
│   ├── cache-config.ts
│   ├── animations.ts
│   └── utils.ts
├── integrations/
│   └── supabase/       # Supabase client
└── test/               # Test setup
```

## Security Model

### Row Level Security (RLS)
All database tables enforce RLS policies:

```sql
-- Users can only see own data
CREATE POLICY "Users view own data"
  ON deals FOR SELECT
  USING (auth.uid() = assigned_to);
```

### Role-Based Access Control (RBAC)
- **Admin**: Full access
- **Manager**: Read/Write, no delete
- **Salesperson**: Own data only

### Authentication
- JWT-based via Supabase Auth
- Optional 2FA
- Session management

## Performance Optimizations

1. **Code Splitting**: Lazy load routes
2. **Caching**: TanStack Query + custom strategies
3. **Virtual Scrolling**: For large lists
4. **Debouncing**: Search inputs
5. **Memoization**: Heavy calculations
6. **Database Indexes**: Optimized queries
7. **Materialized Views**: Pre-computed aggregates

## Monitoring & Observability

- **Errors**: Sentry
- **Analytics**: Vercel Analytics
- **Database**: Supabase Metrics
- **Logs**: Edge Function logs

## Deployment

### Staging
```bash
./scripts/deploy-staging.sh
```

### Production
```bash
./scripts/deploy-production.sh
```

### Rollback
```bash
./scripts/rollback.sh <version>
```

## Future Roadmap
- Offline support (Service Workers)
- i18n (English, Spanish)
- Mobile app (React Native)
- AI-powered insights (GPT-4)
