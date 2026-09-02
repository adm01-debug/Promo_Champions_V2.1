# 🔬 Auditoria Técnica Exaustiva — Promo Champions V2.1

**Data:** 2026-09-02 · **Commit auditado:** `108bb96` (`main`) · **Método:** prompt "Rumo ao 10/10" v2.0 (scorecard de 20 dimensões¹, pesos ×3/×2/×1)

> ¹ O prompt fala em "22 dimensões", mas enumera e pontua 20 (o próprio template de scorecard tem 20 linhas). Auditadas as 20 enumeradas.

**Evidência executada nesta sessão (não é estimativa):**
- `npx tsc --noEmit` → **0 erros** · `npx eslint . --max-warnings 0` → **0 warnings** · `npx vitest run` → **516 testes passando, 2 skip (54 arquivos, 24s)** · `npx vite build` → **sucesso em 30s**
- `npm audit` → 15 vulnerabilidades (1 crítica, 7 high — majoritariamente devDeps)
- `bun install --frozen-lockfile` → **FALHA** ("lockfile had changes, but lockfile is frozen")
- GitHub API → `main` **sem branch protection**, **0 rulesets**, repo **público** e marcado como **template**
- `curl -I` nos dois domínios de produção → headers reais verificados
- 4 varreduras exaustivas (frontend, edge functions, migrations, CI/docs) com evidência arquivo:linha

**Limite declarado (regra 2 do protocolo):** o banco vivo (`usyxfpqlsspldubptrdl`) **não foi consultável nesta sessão** — o endpoint MCP fornecido foi bloqueado pela camada de permissões da sandbox (POST externo com token na URL). Toda análise de banco é estática, sobre as 603 migrations. Itens que exigem o banco vivo estão marcados **NÃO AUDITÁVEL** e listados na seção "Pendências de verificação viva".

---

## Fase 0 — Inventário do Sistema

| Item | Valor |
|---|---|
| Repositório | `adm01-debug/Promo_Champions_V2.1` · branch `main` · **público** (⚠️ `AGENTS.md:13` afirma "privado") · `is_template: true` |
| Histórico | 178 commits desde 2026-07-26 (histórico truncado; repo criado 2026-07-06) · 1 autor efetivo + Dependabot |
| Stack | Vite 6 + React 18 + TS 5 (strict) + Tailwind/shadcn + TanStack Query 5 + Supabase Cloud (Postgres/RLS/Auth/Edge Deno) |
| Código | 2.035 arquivos TS/TSX · ~299k LOC em `src/` · 173 páginas · 177 rotas (`src/routes/AppRoutes.tsx`) |
| Edge functions | 172 diretórios (170 com `index.ts` + `_shared/` com 48 arquivos + `migrate-helper/` residual) |
| Banco | 603 migrations SQL (primeira `20241231`, última `20260902121000`) · ~390 tabelas criadas em migration · **398 tabelas no banco vivo** (evidência: PR [#89](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/89)) · 19 jobs pg_cron ativos |
| Projeto Supabase | **`usyxfpqlsspldubptrdl`** (vivo, confirmado na PR #89). `CLAUDE.md` da main ainda cita `rapjswienfhkobhlamxb` (fix na PR #89, aberta). `index.html:45-46` ainda pré-conecta a um **terceiro** projeto (`saejqkojleeaxzrslzfg`) |
| Integrações | Twilio, ElevenLabs, Bitrix24, Resend/SendGrid (e-mail), WhatsApp/Meta (multichannel), IA via gateway Lovable (`ai.gateway.lovable.dev`, modelos Gemini), Freshdesk/Zendesk/Intercom (helpdesk-sync) |
| Testes | 185 arquivos: 54 vitest + 46 E2E Playwright + 1 a11y + 1 load + 82 testes Deno + 2 contract em migrations (+ 4 suítes SQL) |
| CI | 11 workflows GitHub Actions · Dependabot semanal (npm + actions) · CodeQL semanal |
| Deploy | Lovable Cloud (GitHub-first, auto-deploy da `main`). Último push na main: 2026-09-02 19:16 UTC. Data exata do último deploy: NÃO AUDITÁVEL (Lovable não exposto nesta sessão) |
| Domínios | `pixels-with-personality-09.lovable.app` e `championgifts.lovable.app` (ambos servindo, atrás de Cloudflare) |
| Auditorias anteriores | Extensas: `docs/auditoria/` (plano 100 etapas, ondas 0/1), `docs/execucao/` (hardening canônico 2026-08-31, validação adversarial 2026-09-02), PRs #86–#89. Esta auditoria consolida o estado atual e adiciona delta novo (visibilidade do repo, lockfiles, deps, bundle real, headers de produção) |

---

## Fase 1 — As 20 Dimensões

### 1. Arquitetura — **7,0/10** (peso ×2)

**Evidências (+):**
- Feature-based consistente: 106 subpastas em `components/`, hooks por domínio (471 hooks), `lib/` por domínio (winloss, revenueForecast, bi).
- **Zero ciclos de import** (`graphify-out/GRAPH_REPORT.md:1176-1177`) + `dependency-cruiser` configurado (`package.json:25`).
- 8 ADRs reais (`docs/decisions/ADR-001..008`), infra compartilhada de edge functions madura (`supabase/functions/_shared/`, 48 arquivos com testes co-localizados).
- Code splitting: 170/173 páginas via `lazyWithPrefetch` (`src/routes/lazyPages.ts`).

**Evidências (−):**
- Camada de serviço vestigial: 5 services (~20 KB) vs 471 hooks falando direto com o Supabase — não há abstração consistente de acesso a dados.
- Dois design systems parciais coexistem (`src/components/atoms/card.tsx` + `src/components/ui/card.tsx`).
- Peso do código desalinhado do domínio: gamificação (race+gamification+competitive = 154 arquivos) > CRM core (pipeline+clients+sales+activities = 63).
- God components: `LeadScoringDashboard.tsx` 1.065 linhas, `RaceArena.tsx` 985, `Client360View.tsx` 929; `index.css` com 63 KB.

**Gaps para 10/10:** camada de acesso a dados (repositories/hooks base tipados); fundir atoms/ui; quebrar os 5 maiores componentes; ADR para o padrão de acesso a dados.

**Ações:** criar `src/lib/db/` com helpers de query tipados + paginação padrão (ver dim. 14); codemod para eliminar `atoms/`; ADR-009.

---

### 2. Autenticação — **5,0/10** (peso ×3)

**Evidências (+):**
- Supabase Auth com `autoRefreshToken` + `persistSession` (`src/integrations/supabase/client.ts:23-29`); URL/key só via env com guard de boot (`:11-18`); `.env` não commitado.
- `ProtectedRoute` com preservação de deep-link e auditoria de negações em `access_denied_logs` (`src/components/auth/ProtectedRoute.tsx:33-40`).
- Reset de senha com verificação HIBP k-anonymity (`src/components/ui/password-strength.tsx:28`) — único fetch externo do app, feito do jeito certo.
- `login_attempts` para tracking de brute force (policy restaurada em `20260719000001`).
- WebAuthn implementado como edge function (`supabase/functions/webauthn`).

**Evidências (−):**
- **MFA é código morto**: `MFASetup`/`MFAVerification` têm **0 imports**, 0 rotas, 0 gate no login (`src/pages/Auth.tsx` e `useAuthForm.ts` sem menção a MFA/aal2). O próprio repo documenta (`docs/estado/08_ADMIN_SEGURANCA.md:139`). Detalhe: se ativado como está, `MFATotpTab.tsx:76` enviaria o URI `otpauth://` (contém o segredo TOTP) para `api.qrserver.com`.
- Sessão em `localStorage` (`client.ts:25`) — exposta a XSS; sem `flowType: 'pkce'` explícito.
- Logout sem invalidação global de sessões (`AuthContext.tsx:117-124` — `signOut()` local + hard reload).
- `useUserRoles.ts:19-35`: timeout de 8s resolve `null` → falha de rede vira "acesso negado". `:61-81`: fabrica role sintético `salesperson` no cliente quando falta linha em `user_roles`.
- Config do Supabase Auth (password policy, leaked-password protection, expiração de OTP, MFA habilitado no projeto): **NÃO AUDITÁVEL** nesta sessão (dashboard).

**Gaps para 10/10:** MFA real no fluxo de login (TOTP server-side já existe via RPCs `initialize_totp`/`verify_and_enable_totp`); PKCE; distinção timeout×negado; eliminar role sintético; QR TOTP gerado localmente (lib `qrcode`), nunca via terceiro.

**Ações:** ligar `MFAVerification` no `useAuthForm` (challenge quando `aal2` requerido); `flowType: 'pkce'` no client; `useUserRoles` retornar estado `error` distinto de `denied`; remover fallback sintético (criar a linha em `user_roles` via trigger no signup).

---

### 3. Autorização — **5,5/10** (peso ×3)

**Evidências (+):**
- RBAC 3 papéis com ADR (`ADR-001-rbac-three-roles.md`); RLS habilitado em **384 tabelas** com **1.500 CREATE POLICY**.
- Onda de hardening canônico 2026-08/09 real e documentada: **234 REVOKE, 314 GRANT, 579 DROP POLICY**; views com `security_invoker=true`; RPCs privilegiadas restritas a `service_role`; `_internal_secrets` deny-all (`20260715184427:6`); `REVOKE TRUNCATE` de default privileges (`20260902121000:11-12`).
- Testes de RLS existem: 3 specs E2E (`tests/e2e/rls-authorization-edge-cases.spec.ts`, `sales-markup-rls-salesperson.spec.ts`, `security-definer-rpc-access.spec.ts`) + suíte SQL (`supabase/tests/rls_test_suite.sql`, `canonical_role_simulation.sql`) + `scripts/smoke-target-backend.ts` (valida 6 tabelas sensíveis contra leitura anônima e testa escalonamento em `user_roles`).
- Guards de role no front: 17 rotas admin-only + 64 admin/manager (`src/routes/AppRoutes.tsx:70-76`).

**Evidências (−):**
- **431 policies permissivas** (`USING (true)`/`WITH CHECK (true)`) criadas ao longo do histórico em **187 tabelas**, sendo **222 de escrita/DELETE** — várias sem `TO`, valendo para `anon` (ex.: `salespeople` UPDATE/DELETE `USING(true)` em `20251212201956:5-8`). Quantas ainda vigoram após os 579 DROP POLICY: **NÃO AUDITÁVEL estaticamente** — exige `pg_policies` no vivo. Apenas 7 permissivas foram criadas ≥ 2026-08, todas `TO authenticated` (aceitáveis).
- **8 tabelas sem nenhum `ENABLE ROW LEVEL SECURITY`**: `roles`, `user_permissions_cache`, `experiments`, `experiment_variants`, `experiment_assignments`, `ab_tests`, `migration_log` e — a pior — **`security_events`** (`20260104200100:61`).
- **109 de 170 edge functions operam com `service_role` (bypass de RLS) sem nenhuma validação de identidade do caller** além do `verify_jwt` do gateway (que valida existência de JWT, não papel).
- Autorização em nível de campo: inexistente (sem views de colunas restritas por role).
- Gap registrado na PR #89 e ainda aberto: defacl de `supabase_admin` ainda concede TRUNCATE a `anon`/`authenticated` para tabelas futuras (precisa de suporte Supabase).

**Gaps para 10/10:** inventário vivo de policies permissivas zerado (escrita) e justificado (leitura); RLS nas 8 tabelas; padrão `getUserClient` + checagem de role nas functions com service_role (SEC-08 lista ~50 para refatorar); field-level para colunas sensíveis (`salespeople.email`, comissões).

**Ações:** migration RLS para as 8 tabelas (deny-all + policies mínimas); query de auditoria em `pg_policies` (vivo) com relatório e derrubada das permissivas de escrita; adotar `_shared/auth-client.ts:getUserClient` nas 20 functions mais sensíveis primeiro.

---

### 4. Banco de Dados — **7,0/10** (peso ×2)

**Evidências (+):**
- 603 migrations versionadas, estilo idempotente dominante (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, blocos `DO`).
- **Dinheiro impecável**: NUMERIC×557 + DECIMAL×63; zero float em valor financeiro (os 4 floats são threshold/telemetria/web-vitals). **Datas 100% TIMESTAMPTZ** (906 ocorrências; 1 única exceção é parâmetro de função).
- 25 enums Postgres; 771 índices distintos; 2 ondas de índices para FKs (`20260530_add_missing_fk_indexes.sql`, `20260831130001` com 11 `idx_*_fk`).
- pg_cron com 19 jobs + monitoramento (`cron_failure_alerts` com UNIQUE(jobid,start_time) + job `cron-failure-alerter-10min`).
- Retenção de logs com purga diária (ADR-007 + crons `purge-*`).

**Evidências (−):**
- **15 migrations fora do padrão `YYYYMMDDHHmmss`** (ex.: `202601050000ad_...`, `20260530_...`) — ordenação lexicográfica frágil.
- **Forward-only**: zero migrations down; rollback de schema não existe (só `docs/ROLLBACK.md` genérico e snapshots de dados).
- **223 FKs (38,6%) sem `ON DELETE` explícito** + 290 CASCADE / 0 RESTRICT — deleção em cadeia não intencional é possível a partir de `clients`/`salespeople`.
- `audit_log` com **4 definições concorrentes** + 11 tabelas de auditoria (ver dim. 6).
- 8 funções públicas órfãs referenciando tabela `deals` inexistente (registrado na PR #89, sem fix — decisão de negócio pendente).
- 2 arquivos `.ts` dentro de `supabase/migrations/` (contract tests — fora de lugar).
- Backup/restore: **NÃO AUDITÁVEL** (gerenciado pelo Supabase Cloud; nenhum teste de restore documentado no repo).

**Gaps para 10/10:** renomear as 15 migrations fora do padrão (ou congelar com README explicando); política explícita de `ON DELETE` por relacionamento; teste de restore documentado; consolidação do audit_log; remoção das funções órfãs.

**Ações:** migration de normalização de FKs críticas (`RESTRICT` em `sales→clients`, `SET NULL` onde couber); mover contract tests para `supabase/tests/`; agendar teste de restore trimestral no RUNBOOK.

---

### 5. CI/CD — **5,5/10** (peso ×1)

**Evidências (+):**
- Gate de PR completo: `pr-checks.yml` (lint→typecheck→test→e2e→build→lighthouse→bundle-size); `enterprise-quality.yml` com coverage; workflows path-filtered para edge functions (bundle check + lint de `withRequestId`); CodeQL e `qa-exhaustive` semanais; Dependabot npm+actions com cache npm em 13 pontos.

**Evidências (−):**
- **`main` sem branch protection e 0 rulesets** (verificado via API) — todo o gate é opcional; push direto e merge com CI vermelho são possíveis.
- **Falsos verdes**: `cron-monitoring.yml:38-47` e `quote-to-sale-e2e.yml:55-58,80-86` fazem `exit 0`/skip quando secrets faltam.
- **`bun.lock` dessincronizado do `package.json`** (verificado: `bun install --frozen-lockfile` falha) + 3 lockfiles (`bun.lock` + `bun.lockb` no disco + `package-lock.json`); CI é 100% npm, docs recomendam bun.
- `qa-exhaustive.yml:38` roda `npx tsgo` **não declarado** em package.json; `scripts/security/check-no-committed-service-role.ts` **não é chamado por workflow nenhum**; `format:check` idem; `supabase/functions/**` ignorado pelo ESLint (`eslint.config.js:17`) e **nenhum `deno lint` roda em CI**.
- 3 pipelines redundantes rodando lint+type+test no mesmo PR; sem notificação de falha (crons semanais falham em silêncio); `generate-audit-pdf.yml` morto (path `AUDIT_REPORT.md` inexistente na raiz e faria push direto na main).
- Deploy: 100% Lovable, sem gate próprio; rollback de deploy não documentado no repo.

**Gaps para 10/10:** ruleset na main (PR obrigatório + required checks); 1 pipeline canônico; lockfile único; secrets-check e deno lint no CI; notificação de falha (Slack webhook já existe no runtime).

**Ações:** criar ruleset via API (require PR + checks `quality`/`lint-and-typecheck`); deletar `lint.yml` ou `enterprise-quality.yml` (manter um); remover `bun.lock`/`bun.lockb` e ajustar `CONTRIBUTING.md:9`; adicionar step `npm run security:secrets` + `deno lint` no pipeline canônico; step final `curl` no Slack em `if: failure()`.

---

### 6. Data Integrity — **6,5/10** (peso ×3)

**Evidências (+):**
- **Quote-to-sale é referência**: ADR-005 de idempotência + **22 specs E2E** cobrindo concorrência (`-concurrent-x5`, `-race-trigger-vs-rpc`, `-idempotencia-sequencial`), guard contra downgrade de status (`20260718000001`), auditoria própria (`quote_conversion_audit`).
- Idempotência por chave natural difundida: 51 `onConflict` em 43 arquivos (`'provider,message_id'` para dedupe de webhook, `'source,external_id'`, etc.).
- Infra de retry/DLQ completa: `_shared/retry.ts` (backoff + full jitter AWS, respeita `Retry-After`), `retry-policy.ts` (erros permanentes nunca reprocessam), tabelas `dead_letters`/`edge_retry_events` + replay auditado.
- 578 FKs; sanitização: `html-escape.ts` em templates, `request-body.ts` com limite de tamanho, anti-CRLF em e-mail (`send-transactional-email/index.ts:52-57`); soft delete implementado com views `*_active`.
- Versionamento de entidades existe (`20241231000001_entity_versions.sql`).

**Evidências (−):**
- **Sem `Idempotency-Key` de cliente em nenhuma function**; `_shared/webhook-integrity.ts:4-5` admite: sem dedupe persistente — `inbound-email-webhook` e `twilio-call-*` vulneráveis a replay/reentrega (janela HMAC de 5min limita, não elimina — e os twilio nem HMAC têm).
- **109/170 functions fazem `req.json()` sem schema** — validação server-side é minoria (ver dim. 19).
- Trilha de auditoria por trigger cobre **só 4 tabelas** (`clients`, `activities`, `deals`†, `users`†; † nem existem mais) — `sales`, `quotes`, `orders`, `commissions` sem audit automático.
- Optimistic locking: `entity_versions` existe, uso real não evidenciado nos hooks.
- Auditoria fragmentada: 11 tabelas, 4 definições concorrentes de `audit_log`.

**Gaps para 10/10:** dedupe persistente nos 3 webhooks sem proteção; audit trigger nas tabelas financeiras; consolidar audit em 1 tabela canônica; validação de schema nas escritas (dim. 19).

**Ações:** tabela `webhook_inbound_dedupe` já existe (purga diária) — plugar `inbound-email-webhook` e `twilio-call-status` nela via chave natural (`MessageSid`); migration única `audit_canonical` + triggers em `sales`/`quotes`/`orders`/`commissions`; deprecar as 3 gerações antigas.

---

### 7. Documentação — **7,0/10** (peso ×1)

**Evidências (+):**
- Volume e qualidade raros para 1 dev: 80 arquivos em `docs/` — 8 ADRs, `RUNBOOK.md` (10 KB) + 2 runbooks específicos, `DR_PLAN.md`, `ROLLBACK.md`, série `docs/estado/01..14` (~500 KB de estado medido por domínio), `SECURITY.md` com SLAs, `CONTRIBUTING.md`, PR template com 5 checklists, dicionários de funcionalidades.
- `TEST_QUALITY_REPORT.md` (raiz, 2026-09-02) é **honesto** — substitui e desmente explicitamente uma versão fabricada anterior.

**Evidências (−):**
- **Drift que engana**: `AGENTS.md:13` diz repo "privado" (é público); `CLAUDE.md` aponta projeto Supabase errado (fix na PR #89 aberta); `README.md:15` aponta repo antigo e **não cobre deploy**; `CONTRIBUTING.md:44` e `CHANGELOG.md:26` citam thresholds de coverage errados (70/60 vs reais 85/75); `SECURITY.md:113` recomenda var de env que o código não usa.
- `CHANGELOG.md` abandonado (última entrada 2026-05-30).
- **`docs/reports/TEST_QUALITY_REPORT.md` fabricado ("10/10", "89% coverage") continua versionado**, junto com `scripts/generate-quality-report.ts` que o gera hard-coded.
- Sem diagrama ER para ~398 tabelas (schema só em prosa, `docs/estado/11_DADOS_BANCO.md`).

**Gaps para 10/10:** zero contradições entre docs e realidade; CHANGELOG vivo (ou assumir RELEASE_NOTES como canônico); ER gerado automaticamente; deletar artefatos fabricados.

**Ações:** deletar `docs/reports/TEST_QUALITY_REPORT.md` + `scripts/generate-quality-report.ts` + `scripts/quality-gate.sh`; corrigir README (deploy Lovable + URL do repo); gerar ER com `pg_dump --schema-only` → mermaid no CI mensal.

---

### 8. Infraestrutura / DevOps — **4,5/10** (peso ×1)

**Evidências (+):**
- Supabase Cloud + Lovable gerenciam SSL/CDN/escala; Cloudflare na frente dos domínios (verificado via curl); storage buckets com limites/MIME (`20260831130002`); secrets como env vars do Supabase (~58 nomes via `Deno.env.get`, zero hardcoded nas functions); `config.staging.toml` existe.

**Evidências (−):**
- **🔴 Repo público com `is_template: true`** — código-fonte completo do CRM comercial exposto, incluindo **PII real**: `scripts/seed-real-people.ts` versiona 8 nomes + e-mails `@promobrindes.com.br` de funcionários (LGPD). `AGENTS.md` acredita que é privado → forte indício de exposição **acidental**.
- Headers do hosting incompletos (verificado ao vivo nos 2 domínios): HSTS ✅, `x-content-type-options` ✅, `referrer-policy` ✅, mas **sem `X-Frame-Options`/`frame-ancestors`** (clickjacking aberto) e sem `Permissions-Policy` — o comentário em `index.html:48` afirma que o hosting aplica; não aplica.
- Dependências de runtime em terceiros frágeis: `raw.githubusercontent.com` como CDN de ícones de mapa (`ClientsMap.tsx:56-68`), `api.dicebear.com`, e **`nominatim.openstreetmap.org` recebendo endereços reais de clientes** (`ClientsMap.tsx:98` — LGPD + sem SLA).
- Ambientes isolados de verdade (staging com dados separados): não evidenciado; DR: plano existe, teste de restore não; pooler/network do Supabase: **NÃO AUDITÁVEL**.
- `index.html:45-46` pré-conecta a projeto Supabase morto (`saejqkojleeaxzrslzfg`).

**Gaps para 10/10:** repo privado (ou decisão explícita e limpeza de PII); clickjacking mitigado (limite da plataforma Lovable — registrar/ticket); assets de mapa self-hosted; geocoding server-side com consentimento/contrato.

**Ações:** **tornar o repo privado + `is_template:false`** (1 chamada de API); anonimizar `seed-real-people.ts`; copiar os 3 PNGs de marcador para `public/icons/`; mover geocoding para edge function com cache (Nominatim exige, inclusive, User-Agent identificado por política de uso).

---

### 9. Logging / Monitoring — **7,0/10** (peso ×1)

**Evidências (+):**
- **Logging estruturado exemplar nas functions**: `withRequestId` adotado em **170/170**, JSON `{ts, level, fn, requestId, duration_ms}`, validação do header contra log-injection (`_shared/request-id.ts:10-17`), "never logs headers/body".
- Alertas de runtime reais: `cron-failure-alerter` (10min), `edge-retry-threshold-alert`, `wal-health-alert`, `campaign-health-alert`, com Slack webhooks (`SLACK_WEBHOOK_URL`/`SLACK_DIGEST_WEBHOOK_URL` nas envs).
- Retenção definida e executada: ADR-007 + crons `purge-*` diários (webhook dedupe 30d, telemetria, logs stale).
- Front: `errorTracking.ts` com breadcrumbs + flush batch em `error_logs`; web-vitals RUM com batching, `sendBeacon` e normalização de rota anti-cardinalidade (`src/lib/webVitals.ts:23-29`); página admin de p75.

**Evidências (−):**
- Correlação frontend→edge inexistente: o front não propaga `X-Request-Id` (requestId nasce no edge).
- Uptime monitoring externo: não evidenciado (nenhuma config/menção).
- `errorTracking` custom: buffer em memória perde erros em crash; severidade inflada (todo `console.error` vira `high`); stacks persistidos serão ilegíveis porque o build não emite sourcemaps.
- CI não notifica falha (crons semanais silenciosos) — runtime notifica, CI não.

**Gaps para 10/10:** requestId fim-a-fim; uptime externo (1 check por domínio + 1 na edge function `log-web-vitals`); sourcemaps retidos fora do deploy para des-minificar stacks.

**Ações:** `edgeFetch.ts` gerar e enviar `X-Request-Id` (o edge já aceita); UptimeRobot/Better Stack nos 2 domínios; `build.sourcemap: 'hidden'` + retenção local dos maps.

---

### 10. Observabilidade — **5,5/10** (peso ×1)

**Evidências (+):**
- Telemetria de banco: `query_telemetry`, `slow_query_alerts`, reset semanal de `pg_stat_statements` (`20260712212750`), página `/admin/platform-slo` e `/admin/telemetria`.
- `circuit_breaker_events` (REL-02) para integrações externas; métricas de negócio nos BI hubs; feature flags: rota `/feature-flags` + `VITE_FEATURE_*`.
- RED parcial: `duration_ms` + `request_completed/failed` por function (dá rate/errors/duration por log).

**Evidências (−):**
- Sem tracing distribuído (sem propagação de contexto front→edge→SQL).
- Sem error tracking de mercado (Sentry DSN previsto em `.env.example:36`, nunca usado) — o custom não agrega/deduplica/alerta.
- SLOs formais (targets numéricos + error budget): página existe, definição não auditável no repo.
- Métricas USE de infra: delegadas ao Supabase (não expostas no produto).

**Gaps para 10/10:** requestId fim-a-fim + spans simples (função→RPC); Sentry (ou equivalente) com sourcemaps; SLOs escritos com alerta ligado ao runbook.

**Ações:** adotar Sentry free tier no front (browser + sourcemap upload no build) mantendo `error_logs` como fallback; documentar 3 SLOs (disponibilidade `log-web-vitals`, p95 das 5 functions mais chamadas, taxa de DLQ) no RUNBOOK com query pronta.

---

### 11. Lógica de Negócio — **6,5/10** (peso ×1)

**Evidências (+):**
- Regras críticas no banco (single source of truth): conversão quote→sale via RPC com guard de status (`20260718000005`), scoring/health via stored procedures, 25 enums como state machines de status com CHECK.
- Cálculo financeiro NUMERIC (dim. 4); datas timezone-aware; `getLocalISODate` centralizado.
- Regras puras testadas: 516 testes unit (markup, forecast, winloss severity, stages, sale-status, CPF/CNPJ).
- Linguagem ubíqua PT-BR consistente (cadências, cotações, premiações).

**Evidências (−):**
- Duplicação de fonte de verdade em pontos: `STAGE_PROBABILITY` como constante no front (community 2 do grafo) enquanto o banco tem `deal_probability_scores`; `isSDR/isCloser` vem de `salespeople.role` e `isAdmin` de `user_roles` — dois eixos de "papel".
- 8 stored procedures órfãs referenciando schema antigo (`deals`, `public.users`) — dormentes, quebram se chamadas via RPC (PR #89).
- Regras espalhadas por 471 hooks sem camada intermediária (dificulta teste unitário de regra que hoje só é testável via E2E).

**Gaps para 10/10:** matar as procedures órfãs (mapear→substituir→drop); um único eixo de papel; extrair regras de cálculo restantes do front para `lib/` puro testado.

**Ações:** migration dropando as 8 órfãs após grep de chamadas RPC no front (zero uso confirmado → drop seguro); mover `STAGE_PROBABILITY` para tabela de config lida por hook.

---

### 12. Manutenibilidade — **6,0/10** (peso ×1)

**Evidências (+):**
- Higiene de lint rígida e **verificada**: 0 warnings com `--max-warnings 0`, `unused-imports` como error, zero `console.log`, zero TODO/FIXME reais, prettier + husky + commitlint (conventional commits com scopes).
- Débito técnico **visível e priorizado**: `docs/auditoria/RELATORIO_FALHAS.md` (75 KB) + planos de onda; Dependabot semanal ativo (PRs #71-#79 mergeadas em 02/09).
- Zero ciclos de import; naming consistente.

**Evidências (−):**
- **Código morto em blocos grandes**: MFA (~1.500 linhas), 4 ErrorBoundaries especializadas sem uso, 5 variantes de `scripts/remove-demos*` (19 KB), `migrate-helper/` (config.toml:43 diz removida, diretório existe), `.eslintrc.json` legado ignorado pelo ESLint 9, `deployed.txt`/`local.txt` sem consumidor, `bundle-stats/` commitado de build antiga.
- **Defasagem de majors mascarada**: React 18 (19 estável desde 2024), react-router 6, vitest 1 (2 majors + CVE), `@testing-library/react` 14 (trava React 19), com `.npmrc legacy-peer-deps=true` silenciando o sinal.
- 3 lockfiles; 219 `as unknown as` em produção (dim. 18).

**Gaps para 10/10:** faxina dos blocos mortos; trilha de upgrade React 19 destravada; lockfile único.

**Ações:** PR de limpeza (deletar os 10 itens listados — diff só de remoção); PR de upgrade encadeado `@testing-library/react@16` → `react@19` → `vitest@3` (resolve também a CVE crítica do npm audit).

---

### 13. Operacionalidade — **5,0/10** (peso ×1)

**Evidências (+):**
- Runbooks reais (`docs/RUNBOOK.md`, `runbooks/race-arena.md`, `runbooks/smoke-target-backend.md`) + `DR_PLAN.md` + `ROLLBACK.md`; smoke pós-migração executável (`npm run smoke:target`).
- Circuit breakers em Twilio/ElevenLabs/Bitrix24 (PR #87) com tabela de eventos; retry/DLQ com replay auditado; feature flags.

**Evidências (−):**
- **Estado de deploy das edge functions indeterminado**: `deployed.txt` (10 nomes) vs 170 no repo, sem data/procedência; `twilio-call-*` fora do `config.toml` (se deployadas com default `verify_jwt=true`, os callbacks da Twilio quebram; se com flag manual, o repo não reflete produção).
- Rollback: de schema não existe (forward-only); de deploy é o do Lovable (não documentado no README).
- **46 functions de IA sem circuit breaker e sem retry** (1 exceção) — indisponibilidade do gateway Lovable degrada 46 endpoints em cascata.
- Processo de incidente formal (severidades, quem age, post-mortem padrão): não documentado.

**Gaps para 10/10:** reconciliação deploy×repo automatizada (supabase CLI list vs git, semanal, com alerta); breaker no caminho de IA; procedimento de incidente de 1 página.

**Ações:** wrapper `callAI` único em `_shared/` com `withRetry` + circuit breaker (46 call sites migram para 1 helper); workflow semanal de reconciliação; deletar `deployed.txt`/`local.txt` após reconciliar.

---

### 14. Performance — **5,5/10** (peso ×1)

**Evidências (+):**
- Code splitting 170/173 páginas + prefetch; `manualChunks` com 17 buckets; PWA com precache seletivo; 771 índices + ondas de índices FK; `chunked-in.ts` contra estouro de URL do PostgREST; web-vitals RUM + budget de bundle no CI (`check-bundle-budget.mjs`).
- Build fresco medido nesta sessão: 30s, maiores chunks gz: vendor-pdf 169 KB, vendor 157 KB, vendor-core 119 KB, charts 108 KB.

**Evidências (−):**
- **Paginação server-side quase inexistente: 4 `.range(` para 1.022 `.select(`** (213 `.limit(`) — o teto default de 1.000 linhas do PostgREST vira truncamento silencioso conforme a base cresce; listagens carregam tudo.
- **Bundle inicial ~500 KB gz**: o entry pré-carrega `vendor-pdf` (169 KB gz) e `vendor-markdown` via modulepreload (`dist/index.html`) — biblioteca de PDF no caminho crítico por import estático em módulo compartilhado. Meta de 250 KB gz estourada em ~2×.
- Virtualização em só 3 sites de uso (`react-window`) para 173 páginas; kanbans/tabelas renderizam listas inteiras.
- Debounce em 4 buscas apenas; 1 duplicata local de `useDebouncedValue` (`useCallLibrarySearch.ts:16`).
- SW com `NetworkFirst` cacheando respostas autenticadas do Supabase (`vite.config.ts:20-28`) sem limpeza no logout — risco de vazamento entre usuários no mesmo dispositivo.
- N+1 e LCP real: **NÃO AUDITÁVEL** nesta sessão (exigem banco vivo/RUM; web-vitals já coletados — consultar `/admin/web-vitals`).

**Gaps para 10/10:** paginação padrão nas listagens; PDF/markdown fora do entry (import dinâmico no ponto de uso); virtualização nas 10 listas mais pesadas; limpeza de cache SW no logout.

**Ações:** helper `pagedQuery()` com `.range()` + `useInfiniteQuery` e migração das 20 páginas de maior volume; tornar `jspdf`/`react-markdown` `await import()` nos exporters; `caches.delete` no `signOut`.

---

### 15. Qualidade de Código — **7,5/10** (peso ×1)

**Evidências (+, verificadas nesta sessão):**
- `tsc --noEmit` **0 erros** · `eslint --max-warnings 0` **0 warnings** · 516 testes verdes · build limpo.
- Zero `console.log`/`as any`/`@ts-ignore`; **zero secrets em `src/`** (varredura completa); error handling com `onError` global de mutations (`App.tsx:66-80`); commits semânticos enforced (commitlint); PR template com checklists; pre-commit hooks.

**Evidências (−):**
- `AGENTS.md:51` institucionaliza `--no-verify` (bypassa os próprios hooks); `lint-staged` usado mas **não declarado** em devDependencies; `.eslintrc.json` morto confunde; `supabase/functions/**` sem lint nenhum em CI (ver dim. 5); artefatos fabricados ainda no repo (`docs/reports/TEST_QUALITY_REPORT.md` "10/10", `quality-gate.sh` que imprime sucesso com `test -f`).

**Gaps para 10/10:** lint das functions no CI; declarar lint-staged; deletar artefatos fabricados; remover instrução `--no-verify`.

**Ações:** já listadas nas dims. 5/7/12 (mesmos itens).

---

### 16. Segurança — **4,5/10** (peso ×3)

**Evidências (+):**
- `_shared/webhook-auth.ts` **criptograficamente sólido**: HMAC timing-safe, anti-replay 5min, anti-downgrade de esquema, fail-closed em segredo ausente, ECDSA SendGrid com parser DER próprio.
- Zero `service_role` hardcoded em qualquer lugar; secrets 100% via env; `_internal_secrets` deny-all com allowlist de funções no wrapper `SECURITY DEFINER`.
- Processo de hardening ativo e auditado (fases A/B com CWE citado por migration, validação adversarial 2026-09-02).
- HIBP no reset de senha; CodeQL semanal; `SECURITY.md` com canal e SLAs; headers HSTS/nosniff/referrer verificados ao vivo; CSP via meta.

**Evidências (−):**
1. **🔴 Repo público** com PII de funcionários e todo o código (dim. 8) — provavelmente acidental (`AGENTS.md` diz privado).
2. **🔴 `twilio-call-status`/`twilio-call-twiml` sem verificação de assinatura Twilio** — o helper `verifyTwilioSignature` existe (`webhook-auth.ts:177`) e não é importado por nenhuma das duas. `twilio-click-to-call` sem validação E.164 e sem rate limit → toll fraud.
3. **🔴 Vazamento de detalhe interno em escala**: o wrapper universal devolve `err.message` no corpo de toda resposta 500 (`_shared/request-id.ts:78-80` — afeta 170 functions); +31 arquivos devolvem `error.message` do PostgREST (nomes de constraint/coluna), incluindo endpoint público (`report-embed-public/index.ts:215`).
4. **🔴 5 JWTs anon hardcoded em migrations** (2 projetos: `saejqkojleeaxzrslzfg`, `rapjswienfhkobhlamxb`), 2 deles **inline no comando pg_cron** (`20260726202421:15`, `20260726202545:12` — ficam legíveis em `cron.job`); +1 fallback em `scripts/verify-dispatcher-request-id.sh:22`; +1 em doc. São `role:anon` (publicável por design), mas: refs de projeto expostos, rotação virou breaking change, e o padrão convida a repetir com service_role. Mitigado daqui pra frente por `_internal_secrets` (`20260831130003+`), **tokens antigos seguem válidos até 2035/2036 — rotacionar**.
5. **CORS efetivamente wildcard**: allowlist SEC-07 existe mas **154/170 functions usam `corsHeaders` estático com `*` hardcoded** (`_shared/cors.ts:94-97`), ignorando `ALLOWED_ORIGINS`.
6. `log-web-vitals` público sem auth (rate limit por isolate contornável trocando IP); `report-embed-public` com token na query string validado só por comprimento ≥20.
7. Clickjacking sem mitigação HTTP (dim. 8); CSP com `unsafe-inline`+`unsafe-eval` e `connect-src https://*.supabase.co` (amplo).
8. `npm audit`: 1 crítica (vitest UI — dev), 7 high (vite path traversal — dev server, ws, js-yaml, nanoid...); CVE do vitest core registrada na PR #89 sem fix.
9. LGPD: endereços de clientes → Nominatim público (dim. 8); sem pen test registrado.

**Gaps para 10/10:** os 9 itens acima zerados + rotação periódica documentada + pen test.

**Ações:** ver Top 10 (itens 1-6 são desta dimensão).

---

### 17. Testes — **6,5/10** (peso ×2)

**Evidências (+):**
- **185 arquivos de teste** (54 vitest + 46 E2E + 1 a11y axe + 1 load + 82 Deno + 2 contract) + 4 suítes SQL; 516 unit verdes em 24s (verificado).
- Profundidade real onde importa: 22 specs E2E de quote-to-sale (concorrência ×5, race trigger×RPC, idempotência sequencial); testes de RLS (3 E2E + SQL); fuzz tests (`_shared/fuzz_test.ts`, `request-id-fuzz`); testes paramétricos de retry (57 KB em `run-retry-tests/`); contract tests (12).
- `TEST_QUALITY_REPORT.md` honesto sobre os limites.

**Evidências (−):**
- **Cobertura instrumentada de apenas 16 arquivos hard-coded (~0,76% de `src/`)** (`vitest.config.ts:31-48`) — os thresholds 85/75 valem só para essa ilha; cobertura real do sistema é desconhecida.
- Edge functions: ~16% dos diretórios com teste; **zero cobertura instrumentada Deno**; as financeiras (comissões/premiações) sem teste.
- E2E auto-desarma sem secrets no CI (falso verde, dim. 5); 1 spec órfão fora da config.
- Testes de carga quebrados: `tests/load/load-test.ts:4-6` aponta para projeto Supabase **antigo** (`rapjswienfhkobhlamxb`); `scripts/load-test-sim.ts:27` engole falhas (`.catch(() => ({status:200}))`) — não pode reprovar.

**Gaps para 10/10:** coverage include ampliado por camadas (lib/ + services/ + hooks críticos) com threshold honesto; testes das functions financeiras; carga apontando para o projeto certo e capaz de falhar.

**Ações:** expandir `coverage.include` para `src/lib/**` e `src/services/**` (threshold inicial 60% e subir); portar o padrão de teste de `run-retry-tests` para `email-bulk-send` e comissões; corrigir URL + remover catch do load test.

---

### 18. Tipagem / Type Safety — **7,0/10** (peso ×2)

**Evidências (+):**
- `strict: true` (`tsconfig.app.json:15`) + `noImplicitReturns` + `noFallthroughCasesInSwitch`; **4 `: any` reais no repo inteiro**, 0 `as any`, 0 `@ts-ignore`, 3 `@ts-expect-error` justificados; tsc 0 erros (verificado).
- Tipos gerados do banco presentes (`src/integrations/supabase/types.ts`, 22.829 linhas); zod v4; enums/union types difundidos.

**Evidências (−):**
- **238 `as unknown as` (219 fora de testes)** — escape hatch dominante exatamente na fronteira Supabase↔UI (`useCustomReports.ts:29` típico), neutralizando o strict onde erro de tipo mais importa. Não há regra de lint contra.
- `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes` desligados; `noUnusedLocals/Parameters` off (delegado ao ESLint — ok).
- Geração de tipos não está no pipeline (sem `supabase gen types` em CI — drift manual do types.ts).
- Validação runtime de resposta de API: só nos 21 arquivos com zod; as 151 chamadas `functions.invoke` confiam no cast.

**Gaps para 10/10:** zerar `as unknown as` fora de testes (regra `no-restricted-syntax` + refatoração progressiva); types.ts regenerado por CI com diff check; `noUncheckedIndexedAccess` ligado.

**Ações:** ESLint `no-restricted-syntax` para `TSAsExpression > TSUnknownKeyword` como warn com contador no CI; job semanal `supabase gen types` → PR automático.

---

### 19. Validação — **5,5/10** (peso ×2)

**Evidências (+):**
- Front: **15/15 formulários react-hook-form com zodResolver** (100% do que usa RHF); `useFormGuard` contra perda de dados.
- Back: exemplares existem — `receive-quote-webhook` (zod versionado 1.3.0, 422 com detalhe de campo, cap 10 MB) e `send-transactional-email` (anti-CRLF, limites, enum de purpose).
- CPF/CNPJ próprios com dígito verificador e teste unitário (`src/lib/validators/brDocuments.ts` + `.test.ts`); buckets de storage com validação de MIME/tamanho (`20260831130002`).

**Evidências (−):**
- **Servidor: 109/170 functions fazem `req.json()` sem schema** (zod em ~4 functions + validação manual em 14). `ranking-api` insere e-mail sem validar formato; `twilio-click-to-call` disca `to_number` sem E.164.
- Front: RHF cobre 15 diálogos de 173 páginas — o padrão dominante é `useState` com `if` manual (ex.: `Fornecedores.tsx:46`).
- CPF/CNPJ usado em **1 call site**; **não existem** validadores de CEP e telefone; schemas zod não reutilizam os validadores BR via `.refine()`.
- Schema compartilhado front↔back: só nos contratos de webhook; o resto duplica ou omite.

**Gaps para 10/10:** zod em toda function que escreve; pacote `src/lib/schemas/` compartilhado (client/product/sale) importado pelos dois lados; validadores BR completos plugados nos schemas.

**Ações:** criar `_shared/schemas.ts` (espelho dos `src/lib/schemas/`) e adotar nas 10 functions de escrita mais críticas; adicionar `isValidCEP`/`isValidPhoneBR` + `.refine()` nos schemas de cliente/fornecedor; E.164 no click-to-call.

---

### 20. Operações (Processos) — **6,0/10** (peso ×1)

**Evidências (+):**
- Fluxo de trabalho documentado e seguido: `AGENTS.md` (branch → commit → PR → CI → squash → delete, worktree isolado obrigatório), conventional commits enforced, Dependabot com reviewer, releases (`RELEASE_NOTES.md`).
- **Backlog técnico visível e priorizado** (`docs/auditoria/` com ondas e status); processo de auditoria adversarial recorrente (5 agentes, 2 rodadas em 02/09) — raro até em times grandes.
- CODEOWNERS, PR/issue templates.

**Evidências (−):**
- **Bus factor 1**: todas as 12 regras do CODEOWNERS apontam para `@adm01-debug`; review é auto-review; sem branch protection nada é obrigatório.
- Hotfix procedure e gestão formal de incidente (sev/SLA/post-mortem padrão): não documentadas; CHANGELOG morto; `--no-verify` institucionalizado; idioma misto nos issue templates.

**Gaps para 10/10:** processo mínimo obrigatório via ruleset; hotfix + incidente documentados (1 página cada); changelog automatizado do squash-merge.

**Ações:** ruleset (dim. 5); adicionar seção "Hotfix" e "Incidente" ao RUNBOOK; release-notes automáticas por PR label.

---

## Fase 2 — Scorecard Consolidado

```
╔══════════════════════════════════╦═══════╦═══════════════════════════════════════════╗
║ DIMENSÃO                         ║ NOTA  ║ GAP PRINCIPAL PARA 10/10                  ║
╠══════════════════════════════════╬═══════╬═══════════════════════════════════════════╣
║ 1.  Arquitetura            (×2)  ║ 7,0   ║ Camada de dados vestigial (5 services ×   ║
║                                  ║       ║ 471 hooks diretos no Supabase)            ║
║ 2.  Autenticação           (×3)  ║ 5,0   ║ MFA existe mas está morto (0 imports,     ║
║                                  ║       ║ sem gate no login)                        ║
║ 3.  Autorização            (×3)  ║ 5,5   ║ 109/170 functions c/ service_role sem     ║
║                                  ║       ║ checar caller; policies USING(true) a     ║
║                                  ║       ║ confirmar no banco vivo                   ║
║ 4.  Banco de Dados         (×2)  ║ 7,0   ║ Forward-only (sem rollback); 223 FKs sem  ║
║                                  ║       ║ ON DELETE explícito                       ║
║ 5.  CI/CD                  (×1)  ║ 5,5   ║ main sem branch protection — todo o gate  ║
║                                  ║       ║ é opcional; bun.lock dessincronizado      ║
║ 6.  Data Integrity         (×3)  ║ 6,5   ║ Webhooks Twilio/e-mail sem dedupe         ║
║                                  ║       ║ persistente; audit trigger em só 4 tab.   ║
║ 7.  Documentação           (×1)  ║ 7,0   ║ Drift que engana (repo "privado", projeto ║
║                                  ║       ║ Supabase errado, relatório fabricado)     ║
║ 8.  Infraestrutura/DevOps  (×1)  ║ 4,5   ║ REPO PÚBLICO com PII real + clickjacking  ║
║                                  ║       ║ sem mitigação no hosting                  ║
║ 9.  Logging / Monitoring   (×1)  ║ 7,0   ║ Sem uptime externo; sem correlação        ║
║                                  ║       ║ front→edge                                ║
║ 10. Observabilidade        (×1)  ║ 5,5   ║ Sem tracing nem error tracking agregado   ║
║ 11. Lógica de Negócio      (×1)  ║ 6,5   ║ 8 procedures órfãs; 2 fontes de verdade   ║
║                                  ║       ║ p/ papel e probabilidade de estágio       ║
║ 12. Manutenibilidade       (×1)  ║ 6,0   ║ Blocos de código morto; React 18/vitest 1 ║
║                                  ║       ║ mascarados por legacy-peer-deps           ║
║ 13. Operacionalidade       (×1)  ║ 5,0   ║ Estado de deploy das functions            ║
║                                  ║       ║ indeterminado; 46 fns IA sem breaker      ║
║ 14. Performance            (×1)  ║ 5,5   ║ 4 .range() p/ 1.022 .select(); PDF no     ║
║                                  ║       ║ bundle inicial (~500KB gz eager)          ║
║ 15. Qualidade de Código    (×1)  ║ 7,5   ║ Functions sem lint em CI; --no-verify     ║
║                                  ║       ║ institucionalizado                        ║
║ 16. Segurança              (×3)  ║ 4,5   ║ Repo público + Twilio sem assinatura +    ║
║                                  ║       ║ err.message vazando em 170 fns + CORS *   ║
║ 17. Testes                 (×2)  ║ 6,5   ║ Coverage real desconhecida (instrumenta   ║
║                                  ║       ║ 16 arquivos = 0,76% da árvore)            ║
║ 18. Tipagem / Type Safety  (×2)  ║ 7,0   ║ 219 as unknown as na fronteira dados↔UI   ║
║ 19. Validação              (×2)  ║ 5,5   ║ 109/170 functions parseiam body sem       ║
║                                  ║       ║ schema                                    ║
║ 20. Operações (Processos)  (×1)  ║ 6,0   ║ Bus factor 1; hotfix/incidente sem        ║
║                                  ║       ║ procedimento                              ║
╠══════════════════════════════════╬═══════╬═══════════════════════════════════════════╣
║ NOTA GERAL PONDERADA             ║ 6,0   ║ (197,0 ÷ 33 pesos = 5,97)                 ║
╚══════════════════════════════════╩═══════╩═══════════════════════════════════════════╝
```

---

## Top 10 Ações por ROI (impacto ÷ esforço)

```
[P0] [INFRA/SEGURANÇA] — Tornar o repo privado e desmarcar template
├── Impacto: Altíssimo · Esforço: Trivial (1 chamada de API)
├── Tipo: Config
├── Arquivos: nenhum (GitHub Settings) + anonimizar scripts/seed-real-people.ts
├── Descrição: repo público expõe código completo do CRM + nomes/e-mails reais de
│   8 funcionários (LGPD). AGENTS.md:13 acredita que é privado → acidental.
└── Aceite: GET /repos → "private": true, "is_template": false; seed sem PII.

[P0] [CI/CD/OPERAÇÕES] — Branch protection na main
├── Impacto: Alto · Esforço: Baixo
├── Tipo: Config (ruleset via API)
├── Descrição: require PR + required checks (job "quality" do lint.yml e
│   "lint-and-typecheck" do pr-checks.yml). Hoje merge com CI vermelho é possível.
└── Aceite: push direto na main rejeitado; PR sem checks verdes não mergeia.

[P0] [SEGURANÇA] — Verificar assinatura Twilio nos 2 webhooks
├── Impacto: Alto · Esforço: Baixo (helper pronto)
├── Tipo: Código
├── Arquivos: supabase/functions/twilio-call-status/index.ts, twilio-call-twiml/index.ts
├── Descrição: importar verifyTwilioSignature de _shared/webhook-auth.ts:177 (já
│   implementa canonical string + timing-safe). Adicionar as 2 functions ao
│   config.toml com verify_jwt=false (hoje estão fora — estado indeterminado).
└── Aceite: request sem X-Twilio-Signature válida → 401; deploy refletido no config.toml.

[P0] [SEGURANÇA] — Parar vazamento de err.message nas respostas 500
├── Impacto: Alto (170 functions de uma vez) · Esforço: Baixo (1 arquivo)
├── Tipo: Código
├── Arquivos: supabase/functions/_shared/request-id.ts:78-80
├── Descrição: responder {requestId, error: "internal_error"} e logar o detalhe
│   via ctx.log (padrão que log-web-vitals já usa). Segunda fase: os 31 arquivos
│   que devolvem error.message do PostgREST explicitamente.
└── Aceite: 500 de qualquer function sem mensagem interna; requestId presente p/ correlação.

[P1] [AUTORIZAÇÃO] — RLS nas 8 tabelas descobertas (security_events primeiro)
├── Impacto: Alto · Esforço: Baixo
├── Tipo: Migration
├── Descrição: ENABLE RLS + deny-all + policy admin/service_role em security_events,
│   roles, user_permissions_cache, experiments, experiment_variants,
│   experiment_assignments, ab_tests, migration_log.
└── Aceite: pg_class.relrowsecurity=true nas 8; smoke:target continua verde.

[P1] [SEGURANÇA] — Rotacionar anon keys expostas + limpar cron.job no vivo
├── Impacto: Alto · Esforço: Médio (rotação em 2 projetos + verificação)
├── Tipo: Config/Migration
├── Descrição: os 5 JWTs em migrations + 1 em script são válidos até 2035/2036.
│   Rotacionar as anon keys de saejqkojleeaxzrslzfg e rapjswienfhkobhlamxb;
│   no banco vivo, auditar cron.job.command por 'Bearer ' hardcoded remanescente.
└── Aceite: tokens antigos revogados; SELECT command FROM cron.job sem Bearer literal.

[P1] [AUTORIZAÇÃO] — Auditoria viva das policies USING(true)
├── Impacto: Alto · Esforço: Baixo (1 query + migrations pontuais)
├── Tipo: Migration
├── Descrição: no banco vivo: SELECT * FROM pg_policies WHERE qual='true' OR
│   with_check='true'; derrubar/restringir as de INSERT/UPDATE/DELETE (222 no
│   histórico); justificar as de SELECT que ficarem.
└── Aceite: zero policy permissiva de escrita vigente; lista de exceções documentada.

[P1] [SEGURANÇA] — CORS: ativar a allowlist que já existe
├── Impacto: Médio-alto · Esforço: Médio (mecânico, 154 arquivos)
├── Tipo: Código + Config
├── Descrição: setar ALLOWED_ORIGINS (2 domínios lovable.app + custom) e codemod
│   trocando corsHeaders estático por getCorsHeaders(req) (_shared/cors.ts já suporta).
└── Aceite: resposta de function a Origin desconhecido sem ACAO *.

[P2] [PERFORMANCE] — Paginação padrão + PDF fora do entry
├── Impacto: Alto (crescente com a base) · Esforço: Médio
├── Tipo: Código
├── Descrição: helper pagedQuery() com .range() + useInfiniteQuery nas 20 listagens
│   de maior volume; jspdf/react-markdown via await import() nos exporters
│   (tira 200+ KB gz do caminho crítico).
└── Aceite: nenhuma listagem principal sem janela; entry sem vendor-pdf no modulepreload.

[P2] [VALIDAÇÃO/TESTES] — Zod nas 10 functions de escrita críticas + coverage real
├── Impacto: Médio-alto · Esforço: Médio
├── Tipo: Código
├── Descrição: _shared/schemas.ts espelhando src/lib/schemas; aplicar em ranking-api,
│   email-bulk-send, twilio-click-to-call (E.164), sequence-enroll, etc. Expandir
│   coverage.include para src/lib/** e src/services/** (threshold 60%, subir gradual).
└── Aceite: 422 estruturado nas 10; coverage reportada sobre denominador honesto.
```

---

## Roadmap em 3 Ondas

| Onda | Itens | Prazo |
|---|---|---|
| 🔴 **Quick Wins** (impacto alto, esforço baixo) | Repo privado + PII do seed · branch protection · assinatura Twilio · fix `request-id.ts` (err.message) · RLS nas 8 tabelas · deletar artefatos fabricados/mortos (relatório 10/10, `quality-gate.sh`, `.eslintrc.json`, `migrate-helper/`, `deployed.txt`/`local.txt`, `remove-demos*` ×4) · lockfile único (npm) | 1–3 dias |
| 🟠 **Sprint 1** | Rotação das anon keys + auditoria `cron.job` viva · policies USING(true) no vivo · CORS allowlist (codemod) · zod nas 10 functions críticas + E.164 + rate limit em `ranking-api`/`twilio-click-to-call` · wire `security:secrets` + `deno lint` + notificação de falha no CI · MFA ligado no fluxo de login | 1–2 semanas |
| 🟡 **Sprint 2** | Paginação padrão (20 listagens) + PDF/markdown fora do entry + virtualização (10 listas) · upgrade encadeado `@testing-library/react@16` → React 19 → vitest 3 (fecha CVE) · dedupe persistente nos webhooks + audit triggers em sales/quotes/orders/commissions · wrapper `callAI` com retry+breaker (46 functions) · coverage real por camadas · drop das 8 procedures órfãs · Sentry + requestId fim-a-fim | 2–4 semanas |
| 🟢 **Backlog** | Camada de acesso a dados (dim. 1) · field-level authorization · ER diagram automatizado · zerar `as unknown as` · SLOs formais · pen test externo · consolidação audit_log · procedimento incidente/hotfix | contínuo |

---

## Pendências de verificação viva (bloqueadas nesta sessão)

Executar via MCP do Supabase (`usyxfpqlsspldubptrdl`):
1. `SELECT * FROM pg_policies WHERE qual = 'true' OR with_check = 'true'` — estado real das 431 permissivas históricas.
2. `SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity` — RLS real das 398 tabelas (vs 8 achadas estaticamente).
3. `SELECT jobname, command FROM cron.job` — Bearer hardcoded remanescente + jobs órfãos.
4. `SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosecdef AND NOT COALESCE(p.proconfig::text LIKE '%search_path%', false)` — confirmar as 3 SECURITY DEFINER sem search_path (`auto_victory_post`, `audit_trigger_func`, `maintain_sales_streaks`).
5. `supabase functions list` — reconciliar os 170 diretórios com o que está realmente deployado (e o `verify_jwt` efetivo de `twilio-call-*`).
6. Dashboard Auth: password policy, leaked-password protection, MFA habilitado no projeto.
7. Índices não usados / N+1: `pg_stat_user_indexes` + `pg_stat_statements` (top 20 queries com EXPLAIN).

---

## Nota Final — **6,0/10**

O sistema está muito acima do estereótipo de "app Lovable": gates de qualidade rodam de verdade e passam (tsc/eslint/516 testes verificados nesta sessão), a criptografia de webhooks e o logging estruturado das edge functions são de nível profissional, o banco acerta em cheio tipagem monetária e timezone, e existe um processo raro de auditoria adversarial recorrente com hardening documentado. O que segura a nota em 6,0 é concentrado e endereçável: uma camada de exposição provavelmente acidental (repo público com PII, webhooks Twilio sem assinatura, `err.message` vazando em 170 functions, CORS wildcard de fato), autorização que depende de confirmação no banco vivo (histórico de 431 policies permissivas + 109 functions com service_role sem checar o caller), e duas dívidas estruturais que crescem com a base (paginação inexistente e validação de input server-side minoritária). As ondas Quick Wins + Sprint 1 atacam quase só a camada de exposição e, sozinhas, levam o ponderado para a faixa de 7,5; o caminho 8→10 passa por coverage honesta ampliada, upgrade do trilho React/vitest e a verificação viva listada acima.

> **RUMO À PERFEIÇÃO SEMPRE. 🚀**
