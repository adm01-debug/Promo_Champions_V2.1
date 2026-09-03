# Changelog

## 2026-09-03 — Auditoria 20 dimensões: Quick Wins + Sprint 1 (PR #90)

### 🔒 Segurança
- Repositório tornado privado (expunha código completo + PII de funcionários) e flag de template removida; ruleset `main-protection` ativo (PR obrigatório + checks required + sem force-push); Dependabot security updates ligado
- `twilio-call-status` e `twilio-call-twiml` agora verificam `X-Twilio-Signature` (token do tenant e/ou `TWILIO_AUTH_TOKEN`, fail-closed) — o twiml era um oráculo público de telefone de agente via `?owner_id`
- Wrapper `withRequestId` deixou de vazar `err.message` no corpo das respostas 500 (170 functions); `ranking-api`, `report-embed-public`, `twilio-click-to-call` e `calculate-deal-health` com erros opacos + detalhe só no log estruturado
- CORS: 132 functions migradas do `corsHeaders` estático (`*`) para `getCorsHeaders(req)` — allowlist SEC-07 ativa ao configurar `ALLOWED_ORIGINS` (sem a env, comportamento inalterado)
- `twilio-click-to-call`: normalização E.164 (BR) do destino + rate limit 10/min; rate limit também em `ranking-api` (60/min), `multichannel-status-webhook` (300/min) e webhooks de voz (240/min)
- `ranking-api`: validação de `name`/`email`/`role` no `user/create` e aceite de `Authorization: Bearer <token>`
- Migration `20260902221500`: RLS + REVOKE nas 8 tabelas descobertas sem RLS (inclui `security_events` e `user_permissions_cache`) e `SET search_path` em 3 SECURITY DEFINER regredidas (aplicação no banco pendente)
- QR do TOTP gerado localmente (lib `qrcode`) — o segredo não sai mais para `api.qrserver.com`; `MFASetup` exposto em `/seguranca` (enrollment funcional)
- Token de embed aceito via header `X-Embed-Token` (query mantida por compat)

### ⚡ Performance
- `manualChunks`: preload-helper do Vite fixado em `vendor-core` e subgrafo markdown unificado — `vendor-pdf` (591 KB) e `vendor-markdown` saíram do caminho crítico do entry
- Ícones do mapa self-hosted em `public/map/` (fim de `raw.githubusercontent.com`/cdnjs em runtime)
- Janela explícita (`.limit`) em `useQuotes`, `useTasks` e `useInventoryLevels` (truncamento silencioso do PostgREST)

### 🔧 CI/Tooling
- Pipelines consolidados em `pr-checks.yml` (lint+types+secrets-scan+audit, testes com gate de coverage, `deno lint` das functions, e2e chromium+webkit, notificação de falha); `lint.yml`, `enterprise-quality.yml` e `generate-audit-pdf.yml` removidos
- Falsos verdes eliminados: secrets ausentes em `schedule`/`push`/PR interna agora falham em vez de skipar
- Lockfile único (`package-lock.json`); `bun.lock`/`bun.lockb` removidos; `lint-staged` declarado; `deno.json` migrado ao formato Deno 2 com lint zerado (31 findings corrigidos)
- Dependabot: `ignore` de majors do vitest até o upgrade coordenado
- Limpeza: relatório de qualidade fabricado, `quality-gate.sh`, `.eslintrc.json` legado, `migrate-helper/`, `deployed.txt`/`local.txt`, 5 variantes `remove-demos*` e `bundle-stats/` commitado removidos

### 🧪 Testes
- Novo `webhook-auth_twilio_any_test.ts` (6 casos — assinatura HMAC real, multi-token/multi-URL, GET, tamper); suíte `_shared` 115/115; contrato `withRequestId` 169/169 sem drift

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
