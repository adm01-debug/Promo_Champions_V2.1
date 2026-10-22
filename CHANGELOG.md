# Changelog

## [1.0.1](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.0.0...promo-champions-v2-v1.0.1) (2026-10-22)


### Correções

* **ci:** add commit-search-depth to release-please action input ([2cb51aa](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2cb51aa04532f34243a37b3e4548b78229ffa078))
* **ci:** adiciona padrão de tag promo-champions-v2-v* ao deploy trigger ([f93222c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f93222c7f748e12879544089b5e259576702bd62))
* **ci:** correções de CI — migration CONCURRENTLY, dompurify CVE, codeql SHA, RELATORIO §9-12 ([18aadd0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/18aadd0f5b84a8457e5570e3c1f9b18a2c88dabe))
* **ci:** corrige CodeQL — SHA de init e analyze devem ser idênticos (v4.39.0) ([3504157](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/350415713e1afaabb0008a70371d8577deec59d9))
* **ci:** corrige CodeQL (SHA mismatch v4.39.0) e Release Please (bootstrap-sha + commit-search-depth) ([ea0e9ab](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ea0e9abcbb0af5ff22ab6413fafc535983058b7e))
* **ci:** move bootstrap-sha to root of release-please-config.json ([e3e2131](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e3e2131622eac17d69906425f001ddba925920d7))
* **ci:** move commit-search-depth para raiz do release-please-config.json ([337bbc5](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/337bbc5abd4955d55dc682b45bf382afef1e04ac))
* **ci:** Release Please commit-search-depth + Supabase Types Drift ([56cf230](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/56cf2306782c975d0417f45beb2f46d83155357d))
* **ci:** Release Please config + Supabase Types Drift ([#316](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/316)) ([56cf230](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/56cf2306782c975d0417f45beb2f46d83155357d))
* **ci:** release-please — bootstrap-sha e commit-search-depth para evitar falha GraphQL ([9816411](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/98164119e126606e56d0bab6fc7737f5df013a68))
* **db:** guarda products.active na migration 20261014000002 ([8999bde](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8999bdec99e0c9d5b78929379b8e85be834f4855))
* **types:** corrige drift do schema Supabase — tabela daily_challenge_rotations, funções admin_edge_cron_status/auto_pause_enrollment/auto_promote_sequence_winners/canonical_phone_key/claim_daily_challenge_reward, FK commissions isOneToOne false ([1d2ddef](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1d2ddefcf8d0d37db4957711e65007a4c29d5fc6))
* **types:** corrige posição de claim_daily_challenge_reward e adiciona funções ausentes ([1bad373](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1bad37362c744016f8ab60ffbee52c7d1eb82a1a))

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
