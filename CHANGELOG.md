# Changelog

## [1.2.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.1.0...promo-champions-v2-v1.2.0) (2026-11-12)


### Funcionalidades

* migra recharts 2-&gt;3 (v3.10.1) typecheck/lint verdes ([#422](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/422)) ([e6a7784](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e6a77847b0a63cef8ae4867a0c3483e12d6a373f))
* migra tailwind 3-&gt;4 (v4.3.5) ([#423](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/423)) ([f5e1a4f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f5e1a4f86dc5992550e6d4c10823032400a9aabf))
* workflow auto-corrige deno.lock em PRs do Dependabot ([#368](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/368)) ([d95348f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d95348f78b81a6ab56b37e50b69cabf2ed6d3cd5))


### Correções

* corrige relatório de impacto do graphify ([#390](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/390)) ([b80e879](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b80e8790c3041637c5156967c4953d87916675de))
* corrige restore incondicional no hook de grafo e typo no count de workflows ([042d3e7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/042d3e7f7116a11fe5abb5f3ebe7967a1bdd89c1))
* corrigir migrations_no_repo para contar apenas .sql do repo (~669) ([09ee2d8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/09ee2d8ed3457591c9dd24e34bbca799c9cc2b99))
* corrigir timeout da seção grants no snapshot do banco ([#417](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/417)) ([31f6e2b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/31f6e2b2c4f96d7be7570979f680b4a87876e28a))
* k6-smoke mira funções não deployadas e health sem chave ([#388](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/388)) ([7535bb0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7535bb0ff75a1a606f66d4bf4584a5e49748615d))
* probe de tabela filtra table_type='BASE TABLE' ([#381](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/381)) ([fa27151](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/fa271519296988d072d3357c9a9a52234a841563))
* protege a saída do snapshot e o trabalho local na publicação do contexto ([37bccd8](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/37bccd899e8d973619d0b2f21b265958fdb06cc6))
* surfaçar migrations_no_repo em banco.json.resumo ([#413](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/413)) ([4f31f1f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4f31f1f07f797f738175f7d3d60ef9ce1713e4cf))

## [1.1.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.0.0...promo-champions-v2-v1.1.0) (2026-11-07)


### Funcionalidades

* automações de contexto, inventário e types-sync para agentes de IA ([#362](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/362)) ([ef80740](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ef8074050be40b374e6bc628c978ad4b56d9edac))
* supressão de DROP + filtro cmd em policies no gerador de probes de migrations ([#375](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/375)) ([82ee984](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/82ee984faa28944f2993f07a98b9e193f20ceb63))


### Correções

* bump eslint-plugin-react-refresh 0.5.7, jsdom 30.1.3, lint-staged 17.6.0 + regenera deno.lock ([6c6df6f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6c6df6fb055c01c1e83d8b43078c1594de2217e3)), closes [#298](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/298) [#358](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/358) [#360](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/360)
* check-migrations — reset lastIndex e strippedContent no RLS check ([#364](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/364)) ([5abf273](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5abf2731d842eaa52daa9cd24e92a4cb8d2c0a44))
* confere contagem do ledger apenas quando banco esta no topo do repo ([#382](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/382)) ([195e4fd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/195e4fd7845c08a9d2a9ba9003114f3a9d4fed8d))
* **config:** CI Failure Alert só dispara em conclusões na main + RELATORIO_CI/PENDENCIAS ([#336](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/336)) ([e461580](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e46158001dc72c167613e139fd6e08d586208d10))
* corrige 3 workflows autônomos com falha repetida ([#363](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/363)) ([aba5965](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/aba5965f5e64ef48c856e383bee4d9ab288ced4d))
* corrige typo LEDGER_TOLERA8CIA -&gt; LEDGER_TOLERANCIA em conferirOrigem ([#379](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/379)) ([13d4b86](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/13d4b861d468b5d7ab313d76f9c174cad1253942))
* **crm:** remediacao r3 de integracoes (bitrix24-sync, whatsapp-inbound, reply log) ([#343](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/343)) ([2d9f938](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2d9f9384ef7917ef6882f8e5a5ace7c18508e987))
* **db:** canonizar vocabulário de sales.status em RPCs e edge functions ([#335](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/335)) ([5d22ecd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5d22ecd3b7cb62671172b69afa046090784f801e))
* **db:** corrigir achados R3 da canonização de sales.status ([#341](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/341)) ([4b7905f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4b7905f9619796b69ef2e3d7f361d2fe25e3bea9))
* **db:** remediacao r3 lgpd/gamificacao — cobertura da anonimizacao, telefone canonico, guarda de payload e xp com posse ([#342](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/342)) ([8d6274f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8d6274f42869e6cd1a46d5b5de87566f5a2ecd82))
* **db:** restringe RPCs de agent_runs, retoma aprovações e valida JWT/embed ([#334](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/334)) ([1e3a191](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/1e3a191b26504af202a587703385466c16611108))
* **db:** trava escrita direta em agent_runs/actions e idempotencia da retomada ([#340](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/340)) ([839645f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/839645f2409495213588d8174d9f3c5534eaa0b0))
* desabilita gate e2e em PRs ([#374](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/374)) ([4606224](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/460622417d808c24b22775783abdc023cf5a6789))
* **gamification:** endurecer RPCs de XP/corrida, sync de desafios e anonimizacao LGPD ([#306](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/306)) ([d8fcd7b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d8fcd7bddd9634ef7154dff6a9d9b6b92e1f5e2d))
* parsers de linha toleram CRLF em checkouts Windows ([#384](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/384)) ([f6010c9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f6010c9683f79fd87ba92218ad30c17d645af48c))
* r3 — briefing jsonb coagido na borda, realtime sem remount morto, alerta de deploy por tag ([#339](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/339)) ([2aa90b9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2aa90b96fec954d1bb1ab3d04bd563964a8b164d))
* release-please com continue-on-error para não reprovar status da main ([aeb70d7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/aeb70d7271001e6e5c2ae03b17b1cbe41e82cdf2))
* remover check contagens_ok em conferirOrigem (drift Lovable) ([#370](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/370)) ([ae24e8f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ae24e8f0c47542918f761470f2d47427e12f5af9))
* **services:** integrações — JID com device, reply de protocolo/reação e lease+paginação no bitrix24-sync ([#333](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/333)) ([afb1f35](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/afb1f35e2bfbd7ab15b46d850acabdc136d6e446))
* **ui:** tópicos realtime únicos por mount, embed salespeople e guard recommended_actions ([#332](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/332)) ([98ce4dd](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/98ce4dd183ce2c1dcb2bc0241fb1fd1211133678))

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
