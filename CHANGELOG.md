# Changelog

## 2026-05-30 — Audit & Hardening Sprint

### 🔒 Security
- Added Row Level Security (RLS) policies for all tables
- Added missing foreign key indexes to prevent sequential scans
- PWA service worker now uses NetworkFirst for API calls
- Production guards suppress console.log and catch unhandled rejections

### 🐛 Bug Fixes
- **activityService**: `clientId` filter now applied + input validation
- **biService**: Fixed race condition (moved streak query into Promise.all)
- **bi-helpers**: Corrected ABC Pareto classification algorithm
- **LevelBadge**: Fixed LevelUpNotification showing wrong title/emoji
- **use-toast**: Fixed useEffect dependency causing listener churn
- **AudioContext**: Memoized context value to prevent unnecessary re-renders
- **AuthContext**: Wrapped callbacks in `useCallback` for stability
- **button / ripple-button**: Fixed haptic feedback lost in `asChild` mode
- **alert**: Fixed forwardRef element type mismatch
- **breadcrumb**: Fixed typo in BreadcrumbEllipsis displayName
- **types/activity**: Replaced hardcoded fields with generic Record<>

### 🧪 Testing
- Implemented real regression tests (was empty stubs)
- Added vitest coverage thresholds (70% lines, 60% branches)
- Playwright configured with retries and parallel workers

### 🛠 Developer Experience
- Added ErrorBoundary component for graceful error handling
- Added useAbortController and useMountedRef hooks
- ESLint now warns on `no-explicit-any` and `no-console`
- tsconfig tightened with `noImplicitAny`, `noUncheckedIndexedAccess`
- commitlint configured with project-specific scopes
- Lighthouse CI thresholds made realistic
- Added style guide, a11y checklist, and component guidelines
- Updated README with full setup instructions

### ⚡ Performance
- RLS policies and FK indexes added for database performance
- Context memoization prevents unnecessary re-renders
- Code splitting via manual chunks in vite config
- PWA runtime caching configured for Supabase API
