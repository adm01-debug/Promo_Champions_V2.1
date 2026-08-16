# 01 — FRONTEND: ROTAS E PÁGINAS (estado medido)

> **Auditoria por medição.** Cada afirmação abaixo tem `arquivo:linha` que eu li ou um comando que executei sobre o repositório / o banco de produção (SELECT apenas).
> Nenhuma linha veio de `README`/`docs/*.md`. Data da medição: 2026-08-16. Commit: `git rev-parse --short HEAD` = d44e3db.

## Como medi

| O quê | Como |
|---|---|
| Rotas | `grep -c '<Route path=' src/routes/AppRoutes.tsx` → **174** elementos `<Route>`, **174** paths distintos |
| Páginas | `find src/pages -name '*.tsx' \| wc -l` → **174** arquivos (**37.193** linhas), sendo 1 arquivo de teste (`Index.test.tsx`) e 12 em `src/pages/admin/` |
| Órfãs | conjunto de arquivos de `src/pages` menos todos os alvos de `import '@/pages/…'` e `import './…'` em todo `src/` |
| Alcançabilidade | união de `sidebarMenuData.ts` + `CommandPalette.tsx` + `mobile/` + `NavigationHud` + `useVoiceNavigation`, e depois todos os `to=`/`href=`/`navigate(`/`to:`/`route:` fora de `src/routes/` |
| Camada de dados | para cada página, resolvi 2 níveis de imports (`@/components`, `@/hooks`) e contei arquivos que tocam `integrations/supabase/client`, `useQuery`, `useMutation`/`.insert(`/`.update(`/`.upsert(`/`.delete()` |
| Uso real | `SELECT route, count(*) FROM page_analytics GROUP BY route` no banco de produção |

### Critério de classificação (aplicado mecanicamente, sem julgamento otimista)

| Símbolo | Regra exata |
|---|---|
| ✅ IMPLEMENTADO_TOTAL | alcançável por menu **ou** link no código **e** tem camada de leitura (supabase/useQuery) **e** tem mutação/persistência na árvore **e** nenhum dado fictício encontrado |
| 🟨 IMPLEMENTADO_PARCIAL | alcançável **e** tem camada de dados, **mas** (a) contém dado fictício **ou** (b) é somente leitura — zero mutação em toda a árvore de 2 níveis |
| 🟦 SUGERIDO_OU_INICIADO | alcançável **mas** zero chamadas `supabase`/`useQuery` em 2 níveis de imports (estado local ou dados semente) |
| ⬛ MORTO_OU_ABANDONADO | **nenhum** menu, **nenhum** `to=`/`href=`/`navigate()` em todo `src/` aponta para a rota — só se chega digitando a URL |

> ⚠️ **Limite honesto:** ✅ aqui significa "todas as camadas presentes e navegável", **não** "comprovadamente em uso". A telemetria de produção (`page_analytics`, 75 linhas, 2 usuários, 23/07/2026–15/08/2026) só registra **12 rotas de 174**. Para 162 rotas eu **não tenho evidência de uso** — está anotado no item (d).

---

## 1. Rotas (174) — tabela completa

Wrappers de proteção definidos em `src/routes/AppRoutes.tsx:70-78`:
`<Admin>` = `<ProtectedRoute requiredRole="admin">` (linha 71) · `<Manager>` = `<ProtectedRoute requireAdminOrManager>` (linha 76).
Todo o bloco `/*` já está dentro de `<ProtectedRoute>` (AppRoutes.tsx:101) dentro de `<MainLayout>` (:102).

| Rota | Página (arquivo:linha) | Role | Classificação | Evidência / o que falta |
|---|---|---|---|---|

## 2. `supabase/config.toml` — apenas 3 funções públicas

O arquivo inteiro tem **10 linhas** (`supabase/config.toml:1-10`):

```toml
project_id = "rapjswienfhkobhlamxb"

[functions.log-web-vitals]
verify_jwt = false

[functions.receive-quote-sync]
verify_jwt = false

[functions.email-unsubscribe]
verify_jwt = false
```

Analisando a proteção alternativa de cada uma:

| Função | `verify_jwt` | Proteção alternativa (lida no código) | Veredito |
|---|---|---|---|
| `receive-quote-sync` | false | **HMAC-SHA256** com `QUOTE_SYNC_WEBHOOK_SECRET` e `PROMOGIFTS_WEBHOOK_SECRET`; compara assinatura `x-webhook-signature` (`index.ts:97-118`, `:225-246`); recusa 401 se segredo ausente ou assinatura inválida; + `enforceRateLimit` (`:21`); + dedupe em `webhook_inbound_dedupe` | ✅ **Adequadamente protegida** |
| `email-unsubscribe` | false | Token assinado verificado por `verifyUnsubscribeToken(email, token)` (`index.ts:39`, `_shared/unsubscribe.ts`); sem token válido → rejeita | ✅ Adequada (padrão One-Click-Unsubscribe) |
| `log-web-vitals` | false | **Só rate-limit por IP** (120 req/60s por isolate, `index.ts:51`). Sem autenticação, sem assinatura, sem allowlist. Grava com `SERVICE_ROLE_KEY` (`index.ts:73-74`) em `web_vitals_samples` | 🟡 **Exposição aceita, mas gravável por qualquer um** |

**Nenhuma exposição pública grave** foi encontrada aqui: as duas funções sensíveis têm HMAC/token, e a
terceira só aceita métricas de performance descartáveis (tabela com 0 linhas, purgada a cada 30 dias).

### 2.1 O problema inverso, mais sério: webhooks que **não conseguem** ser chamados

`config.toml` lista 3 funções. Todas as outras 165 ficam com `verify_jwt = true` (padrão do Supabase CLI).
Mas **7 funções são, por desenho, endpoints para chamadores externos que não possuem JWT do Supabase**:

| Função | Papel pretendido | Está no config.toml? |
|---|---|---|
| `receive-quote-webhook` | webhook externo (valida `QUOTE_SYNC_API_KEY`) | ❌ AUSENTE → `verify_jwt=true` |
| `inbound-email-webhook` | webhook de provedor de e-mail | ❌ AUSENTE → `verify_jwt=true` |
| `multichannel-status-webhook` | callback de status multicanal | ❌ AUSENTE → `verify_jwt=true` |
| `twilio-call-status` | callback Twilio | ❌ AUSENTE → `verify_jwt=true` |
| `twilio-call-twiml` | callback Twilio (retorna TwiML) | ❌ AUSENTE → `verify_jwt=true` |
| `report-embed-public` | embed público por token de URL | ❌ AUSENTE → `verify_jwt=true` |
| `get-client-ip` | eco de IP do cliente | ❌ AUSENTE → `verify_jwt=true` |

Twilio, o provedor de e-mail e um `<iframe>` de relatório embutido **não enviam JWT Supabase**. Se o
`verify_jwt` efetivo em produção for de fato `true`, esses 7 endpoints rejeitam 401 antes de executar
uma linha do próprio código — o que é consistente com o fato de que `twilio_call_sessions`, `call_logs`,
`inbound_reply_events`, `outbound_messages`, `report_embed_tokens` e `quote_sync_logs` estão **todas com
0 linhas**. `report-embed-public` chega a implementar revogação, expiração, allowlist de origem e
mascaramento de PII (`index.ts:29`, `:111-140`) — proteção correta para algo que, pelo config, é inalcançável.

> ⚠️ **Limite de verificação:** o `verify_jwt` real do ambiente implantado só é legível pela Management
> API (`sbp_…`), que não tenho. O MCP respondeu: *"Listing Edge Functions requires a Supabase Management
> API token"*. Portanto afirmo o que o **repositório** declara, não o que o runtime aplica — funções
> implantadas pelo dashboard/Lovable podem ter setting próprio divergente do `config.toml`.

---

## 3. `_shared/` — o que é realmente compartilhado

34 arquivos (19 módulos + 15 de teste). Adoção medida por `grep -rl "_shared/<mod>.ts"`:

| Módulo | Consumidores | Papel |
|---|---|---|
| `cors.ts` | **163 / 168** | Cabeçalhos CORS + preflight. Padrão de facto |
| `request-id.ts` | **163 / 168** | `withRequestId()` — correlação de requisição. Padrão de facto |
| `fetch-with-timeout.ts` | 65 | Timeout em chamadas externas |
| `chunked-in.ts` | 34 | Quebra de `IN (…)` grande para evitar estouro de URL |
| `auth-client.ts` | 18 | Cliente autenticado a partir do JWT do usuário |
| `validation.ts` | 14 | Validação de payload |
| `webhook-validator.ts` | 9 | Validação/assinatura de webhook |
| `circuit-breaker.ts` | **5** | Circuit breaker |
| `retry.ts` | 5 | Retry com backoff |
| `notification-categories.ts` | 5 | Taxonomia de notificação |
| `rate-limit.ts` | **4** | Rate limit |
| `unsubscribe.ts` | 4 | Token de descadastro |
| `http-envelope.ts` / `html-escape.ts` | 3 | Envelope de resposta / escape |
| `retry-policy.ts` / `send-pacer.ts` | 2 | Política de retry / pacing de envio |
| `contracts.ts` / `campaign-health.ts` | 1 | — |
| **`telemetry.ts`** | **0** | **Nenhum consumidor — módulo morto** |

**Leitura:** CORS e request-id são universais (163/168 — maturidade real de plumbing). Mas as defesas que
importam são raras: **rate-limit em 4 funções, circuit breaker em 5**. `retry-policy.ts` (2) e `retry.ts` (5)
coexistem — dois mecanismos de retry para o mesmo problema. `telemetry.ts` não é importado por ninguém.

---

## 4. Segredos lidos por função (nomes apenas — nenhum valor foi impresso)

Extração: `grep -rhoE "Deno\.env\.get\(['\"][A-Z0-9_]+['\"]\)"`.
*(Nota: `D` aparece como falso-positivo do regex em `Deno` e foi descartado.)*

| Segredo | Nº de funções | Observação de risco |
|---|---|---|
| `SUPABASE_URL` | 160 | Não é segredo |
| `SUPABASE_SERVICE_ROLE_KEY` | 122 | **Bypass total de RLS em 73% das funções** |
| `SUPABASE_ANON_KEY` | 52 | Público por natureza |
| `LOVABLE_API_KEY` | 45 | Provedor de IA — sem ele, toda a camada de IA falha |
| `RESEND_API_KEY` | 9 | Envio de e-mail |
| `SLACK_WEBHOOK_URL` / `SLACK_DIGEST_WEBHOOK_URL` | 3 | Alertas |
| `ELEVENLABS_API_KEY` | 3 | Voz (stt/tts/voice) |
| `BITRIX24_CLIENT_ID/SECRET/DOMAIN` | 2 | OAuth Bitrix24 |
| `QUOTE_SYNC_WEBHOOK_SECRET`, `PROMOGIFTS_WEBHOOK_SECRET`, `QUOTE_SYNC_API_KEY` | 3 | HMAC/API key de webhook |
| `V4_CALLBACK_API_KEY`, `V4_CALLBACK_URL` | 1 | Callback V4 |
| `ZENDESK_*`, `FRESHDESK_*`, `INTERCOM_ACCESS_TOKEN` | 1 (`helpdesk-sync`) | 5 segredos de helpdesk numa função só |
| `EXTERNAL_SUPABASE_URL/ANON_KEY` | 2 | Ponte para banco externo |
| `VAPID_PUBLIC_KEY` | 1 | Web Push |
| `ADMIN_NOTIFICATION_EMAIL` | 2 | — |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | 7 | ⚠️ **Vars de front-end lidas no servidor** — ver §5.4 |

**Funções que dependem de segredo provavelmente ausente (→ 🟨):** as 3 `elevenlabs-*`
(`ELEVENLABS_API_KEY`), `helpdesk-sync` (8 segredos de 3 provedores; `support_tickets` tem 146 linhas
mas de seed), `bitrix24-*` (`bitrix24_sync_logs` = 0 linhas), `notify-v4-quote-status`
(`v4_callback_dead_letters` = 2 linhas), `external-db-bridge` (`query_telemetry` = 0).

---

## 5. Riscos de segurança — ordenados por gravidade

### 🔴 5.1 GRAVE — Chave `anon` JWT hard-coded no código-fonte e no banco

`public.trigger_campaign_health_alert()`, lida via `pg_get_functiondef`, embute o JWT literal:

```sql
'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…UX1OE'
```

A mesma string está **commitada em 5 migrations**:
`supabase/migrations/20260418124334_…sql`, `20260512213243_…sql`, `20260512214007_…sql`,
`20260726202421_…sql`, `20260726202545_…sql`.

Mitigação: é a chave **anon** (projetada para ser pública), não a `service_role` — por isso 🔴 e não ⛔.
Mas está fixada em migrations versionadas, o que **impede rotação** sem reescrever histórico e cria o
hábito exato que produziu o incidente do `migrate-helper`. Deve ir para o Vault (`vault.decrypted_secrets`)
ou para uma GUC de banco.

### 🔴 5.2 GRAVE — `SUPABASE_SERVICE_ROLE_KEY` em 122 de 168 funções (73%)

122 funções instanciam cliente com `service_role`, ignorando RLS por completo. Combinado com o fato de
que **apenas 14 funções fazem qualquer verificação de identidade no próprio código** (§5.3), a superfície
é grande: um bug de autorização em qualquer uma delas vira leitura/escrita irrestrita do banco.

### 🟠 5.3 ALTO — 154 de 168 funções sem verificação de identidade no código

Varredura por `getUser(`, `requireUser`, `authenticateRequest`, `X-Cron-Secret`, HMAC, `user_roles`/`is_admin`:

- **JWT do usuário verificado explicitamente:** 18 funções (`ai-copilot`, `calculate-deal-health`,
  `external-db-bridge`, `email-bulk-send`, `webauthn`, `workflow-executor`, …)
- **Checagem de papel (`user_roles`/admin):** 8 (`access-denied-alerts`, `broadcast-sale-notification`,
  `cron-failure-alerter`, `sdr-consecutive-alerts`, `semantic-reindex-batch`, `send-password-reset`,
  `winloss-webhook-replay`, `winloss-webhook-timeline`)
- **HMAC:** 2 (`receive-quote-sync`, `dispatch-webhook`)
- **Rate limit:** 4
- **Nenhuma verificação no código:** **~140 funções**

Elas dependem inteiramente do `verify_jwt=true` da plataforma. Isso autentica *que existe um usuário*,
mas **não autoriza nada**: qualquer usuário logado — o SDR mais júnior — pode invocar
`territory-optimization`, `predict-quota-attainment`, `revops-hub` (lê `commissions`, 942 linhas),
`ranking-api` ou `auto-reassign-inactive` (reatribui carteira de clientes). Não há segregação por papel.

### 🟠 5.4 ALTO — Variáveis `VITE_*` lidas no servidor

7 funções leem `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` via `Deno.env.get`:
`create-stagnant-tasks`, `cron-failure-alerter`, `forecast-narrative`, `process-race-event`,
`race-commentary`, `receive-quote-sync`, `start-race-season` (+ `winloss-webhook-dispatcher` com
`VITE_SUPABASE_URL`). O prefixo `VITE_` é convenção de *bundle de front-end*. No runtime Deno essas vars
tipicamente **não existem**, gerando `undefined` silencioso — e indica confusão de fronteira
cliente/servidor. `forecast-narrative` ainda lê `TEST_USER_ACCESS_TOKEN` e `TEST_FORECAST_ID`:
**artefatos de teste no caminho de produção**.

### 🟡 5.5 MÉDIO — Segredo de cron guardado em tabela do banco

`generate-coaching-actions/index.ts:42-49` autentica cron lendo
`public._internal_secrets['coaching_cron_secret']`. A tabela existe e tem **1 linha**. Guardar segredo em
tabela comum (em vez do Vault) o expõe a qualquer via com `service_role` — que são 122 funções.

### 🟡 5.6 MÉDIO — `log-web-vitals` grava sem autenticação

`verify_jwt=false` + só rate-limit por IP + `service_role` (`index.ts:51`, `:73-74`). Qualquer um na
internet insere em `web_vitals_samples`. Impacto baixo (dado descartável, purgado em 30 dias, 0 linhas
hoje), mas é escrita não autenticada com chave de administrador.

### ✅ 5.7 Verificado e **limpo**: nenhuma outra função expõe `service_role` como o `migrate-helper`

Conforme exigido pelo escopo, procurei o padrão que motivou a remoção no commit `14b2750`:

```
grep -rnE "(JSON.stringify|console.(log|error|warn)|body)[^;]{0,120}SERVICE_ROLE" supabase/functions/  → 0 resultados
grep -rnE "Deno.env.toObject|env.toObject"                                        supabase/functions/  → 0 resultados
grep -rnE "exec_sql|execute_sql|rpc\('exec|raw_sql|query:\s*(body|payload|req)"   supabase/functions/  → 0 resultados
grep -rn  "service_role" supabase/migrations/ | grep -i "eyJ"                                          → 0 resultados
```

**Nenhuma função retorna a `service_role` no corpo, loga a chave, faz dump de env, nem aceita SQL
arbitrário do cliente.** `external-db-bridge` — o candidato óbvio — expõe operações tipadas
(`table`/`rpcName`/`limit`/`offset`) e valida JWT, não SQL livre. `nlq-query` usa LLM mas consulta
tabelas fixas (`sales`, `activities`, `salespeople_public` — uma *view* pública). **O incidente do
`migrate-helper` foi isolado.**

---

## 6. Duplicação e refatoração abandonada

Os três pares apontados no escopo — todos confirmados, **nenhum resolvido**:

### 6.1 `calibrate-win-probabilities` (204 ln) vs `calibrate-win-probability` (180 ln)

**Ambos vivos e ambos inúteis.** Não é órfão/ativo: são dois hooks distintos no front-end.

| | grava em | linhas na tabela | chamador |
|---|---|---|---|
| `calibrate-win-probabilities` | `win_calibration_buckets`, `win_probability_deal_calibrations` | **0 / 0** | `src/hooks/revenue/useWinProbabilityCalibrator.ts` |
| `calibrate-win-probability` | `win_probability_calibrations`, `deal_probability_scores` | **0 / 0** | `src/hooks/revenue/useWinProbabilityCalibration.ts` |

Duas implementações, **dois esquemas de tabela diferentes**, dois hooks quase homônimos. Nenhuma jamais
gravou. Prova de refatoração iniciada e nunca concluída — o autor não escolheu um vencedor.

### 6.2 `recompute-stage-baselines` (78 ln) vs `refresh-stage-baselines` (103 ln)

**Escrevem na MESMA tabela** `stage_velocity_baselines` (0 linhas), mas leem fontes **diferentes**:

- `recompute-stage-baselines` lê `deal_stage_transitions` → **1.254 linhas**
- `refresh-stage-baselines` lê `deal_stage_history` + `sales` → **`deal_stage_history` tem 0 linhas**

Chamadores distintos (`useStageVelocity.ts` e `useStageBaselines.ts`). **`recompute-` é a versão viável**
(sua fonte tem dados); `refresh-` lê de uma tabela vazia e produziria baseline nulo. Se ambos forem
executados, o último a rodar sobrescreve o outro — condição de corrida latente. Nenhum rodou ainda.

### 6.3 `customer-success-360` (147 ln) vs `customer-success-hub` (150 ln)

**Aqui não há duplicação real — são funções diferentes com nome confuso:**

- `customer-success-360` agrega 9 tabelas (`accounts`, `csat_ces_surveys`, `expansion_opportunities`,
  `onboarding_journeys`, `orders`, `product_usage_summary`, `qbr_schedule`, `renewals`, `support_tickets`)
  → visão 360 do cliente. Chamada por `useCustomerSuccess360.ts`.
- `customer-success-hub` lê apenas `accounts` + `account_activities` → feed de atividades.
  Chamada por `useCustomerSuccess.ts`.

Ambas leem tabelas com dados reais (100/360 linhas) e ambas são somente-leitura. **Ambas ✅** — o
problema é nomenclatura, não código morto.

### 6.4 Outras duplicações encontradas (não estavam no escopo)

- **`objection_library` vs `objections_library`** — `analyze-objection-handling` usa a primeira,
  `sales-assistant-chat` usa a segunda. **Ambas com 0 linhas.** Erro de digitação virou schema.
- **`report_embed_tokens` vs `embedded_report_tokens`** — duas tabelas, ambas 0 linhas.
- **`audit_log` (329) vs `audit_logs` (6.933)** — duas tabelas de auditoria coexistindo.
- **`retry.ts` (5 consumidores) vs `retry-policy.ts` (2)** — dois mecanismos de retry em `_shared/`.
- **`semantic-search` vs `semantic-search-universal`** — ambas sem `.from()`, ambas chamadas pelo FE.
- **`revenue-forecast-ai`, `generate-revenue-forecast`, `forecast-narrative`, `snapshot-forecast`,
  `compute-forecast-accuracy`** — 5 funções de previsão; `revenue_forecasts` tem 3 linhas,
  `forecast_accuracy`/`forecast_confidence_scores`/`ai_narrative_cache` têm 0.

---

## 7. Matriz completa — 168 funções

**Critérios de classificação (aplicados por script, não por impressão):**

- ✅ **IMPLEMENTADO_TOTAL** — chamador identificado **e** ao menos uma tabela que a função toca contém linhas.
- 🟨 **PARCIAL** — chamador identificado, mas **toda** tabela de escrita está vazia, ou falta segredo, ou é stub.
- 🟦 **SUGERIDO_OU_INICIADO** — esqueleto: < 80 linhas e nenhuma escrita em banco.
- ⬛ **MORTO_OU_ABANDONADO** — **nenhum** chamador (nem FE, nem cron, nem trigger, nem webhook, nem edge).

Número entre parênteses após a tabela = `n_live_tup` medido em produção.
Coluna `verify_jwt` reflete `supabase/config.toml`; "default" = ausente do arquivo ⇒ `true`.

| # | Função | Linhas | Quem chama (evidência) | verify_jwt | Tabela que toca (linhas) | Classificação |
|---|---|---|---|---|---|---|
| 1 | `access-denied-alerts` | 365 | FE `src/components/settings/AccessDeniedLogs.tsx` | true (default) | `email_logs`(0), `security_alert_history`(0) | 🟨 |
| 2 | `account-engagement-aggregator` | 111 | FE `src/hooks/engagement/useAccountEngagement.ts` | true (default) | `accounts`(100) | ✅ |
| 3 | `activity-goal-alerts` | 243 | só string em `src/components/admin/BackendAutomationMonitor.tsx` (sem invoke) | true (default) | `email_logs`(0) | ⬛ |
| 4 | `admin-conversion-trail` | 65 | **nenhum** | true (default) | — | ⬛ |
| 5 | `aggregate-coaching-scorecard` | 200 | FE `src/hooks/conversational/useCoachingScorecard.ts` +1 | true (default) | `call_coaching_scorecards`(0), `salesperson_coaching_aggregates`(0) | 🟨 |
| 6 | `ai-agent-orchestrator` | 305 | só string em `src/hooks/agents/useStartAgentRun.ts` (sem invoke) | true (default) | `activities`(2228), `agenda_events`(0), `leads`(0) | ⬛ |
| 7 | `ai-copilot` | 268 | FE `src/hooks/ai/useAICopilot.ts` | true (default) | `activities`(2228), `sales`(954), `salespeople`(18) | ✅ |
| 8 | `ai-email-composer` | 285 | FE `src/components/sales/AIEmailDialog.tsx` +2 | true (default) | `account_contacts`(0), `clients`(100), `sales`(954) | ✅ |
| 9 | `analyze-call` | 135 | FE `src/hooks/conversational/useCallRecordings.ts` | true (default) | `call_insights`(0), `call_recordings`(0), `call_transcripts`(0) | 🟨 |
| 10 | `analyze-conversation` | 146 | FE `src/hooks/conversation-intelligence/useAnalyzeConversation.ts` | true (default) | `conversation_analyses`(0) | 🟨 |
| 11 | `analyze-conversation-metrics` | 162 | FE `src/hooks/conversational/useConversationMetrics.ts` +1 | true (default) | `call_conversation_metrics`(0) | 🟨 |
| 12 | `analyze-objection-handling` | 261 | FE `src/hooks/conversational/useObjectionAnalysis.ts` +1 | true (default) | `call_objection_analysis`(0), `call_objections`(0), `objection_library`(0) | 🟨 |
| 13 | `analyze-pipeline-coverage` | 229 | **nenhum** | true (default) | `pipeline_coverage_recommendations`(0), `pipeline_coverage_snapshots`(0) | ⬛ |
| 14 | `analyze-question-quality` | 195 | FE `src/hooks/conversational/useQuestionAnalysis.ts` +1 | true (default) | `call_question_analysis`(0), `call_questions`(0) | 🟨 |
| 15 | `analyze-sentiment-timeline` | 251 | FE `src/hooks/conversational/useSentimentTimeline.ts` +1 | true (default) | `call_sentiment_timeline`(0) | 🟨 |
| 16 | `analyze-skill-gaps` | 187 | FE `src/hooks/coaching/useSkillGapAnalyzer.ts` | true (default) | `skill_assessments`(0), `skill_development_tracks`(0) | 🟨 |
| 17 | `analyze-stage-conversion` | 300 | FE `src/hooks/deal-intelligence/useStageConversion.ts` | true (default) | `stage_bottleneck_insights`(0), `stage_conversion_metrics`(6) | ✅ |
| 18 | `analyze-win-loss` | 180 | FE `src/hooks/deal-intelligence/useWinLoss.ts` +2 | true (default) | `win_loss_analyses`(500) | ✅ |
| 19 | `auto-enroll-cadence` | 162 | FE `src/components/cadences/EnrollmentRulesDialog.tsx` | true (default) | `cadence_tasks`(0), `prospect_cadences`(0) | 🟨 |
| 20 | `auto-reassign-inactive` | 264 | só string em `src/components/admin/BackendAutomationMonitor.tsx` (sem invoke) | true (default) | `client_portfolio`(100), `lead_routing_log`(0) | ⬛ |
| 21 | `automation-suggestions` | 138 | FE `src/hooks/automation/useAutomationIntelligence.ts` | true (default) | `automation_runs`(39), `automation_workflows`(7), `sales`(954) | ✅ |
| 22 | `behavioral-analysis` | 116 | FE `src/hooks/useBehavioralAnalysis.ts` | true (default) | `automation_runs`(39) | ✅ |
| 23 | `bitrix24-oauth` | 202 | FE `src/hooks/useBitrix24.ts` +1; edge: test-integration-connection:77 | true (default) | `portfolio_settings`(0) | 🟨 |
| 24 | `bitrix24-sync` | 638 | FE `src/hooks/useBitrix24.ts` | true (default) | `bitrix24_sync_logs`(0), `clients`(100), `icp_data`(0) | ✅ |
| 25 | `broadcast-sale-notification` | 228 | DB trigger | true (default) | `sale_notifications_audit`(0) | 🟨 |
| 26 | `calculate-committee-coverage` | 111 | FE `src/hooks/deal-intelligence/useCommitteeCoverage.ts` +1; edge: extract-committee-from-call:238, extract-deal-stakeholders:254 | true (default) | `deal_committee_coverage`(0) | 🟨 |
| 27 | `calculate-deal-health` | 441 | FE `src/hooks/deal-intelligence/useDealHealth.ts` | true (default) | `deal_health_scores`(900) | ✅ |
| 28 | `calibrate-win-probabilities` | 204 | FE `src/hooks/revenue/useWinProbabilityCalibrator.ts` | true (default) | `win_calibration_buckets`(0), `win_probability_deal_calibrations`(0) | 🟨 |
| 29 | `calibrate-win-probability` | 180 | FE `src/hooks/revenue/useWinProbabilityCalibration.ts` | true (default) | `deal_probability_scores`(0), `win_probability_calibrations`(0) | 🟨 |
| 30 | `campaign-health-alert` | 174 | pg_cron | true (default) | `campaign_health_alerts`(0), `notifications`(6) | ✅ |
| 31 | `challenge-expiration-alerts` | 127 | só string em `src/components/admin/BackendAutomationMonitor.tsx` (sem invoke) | true (default) | `achievements`(4) | ⬛ |
| 32 | `check-lead-sla` | 171 | só string em `src/components/admin/BackendAutomationMonitor.tsx` (sem invoke) | true (default) | `email_logs`(0) | ⬛ |
| 33 | `check-quote-expiration` | 88 | **nenhum** | true (default) | `notifications`(6), `quotes`(301) | ⬛ |
| 34 | `check-v4-callback-alerts` | 171 | **nenhum** | true (default) | `v4_callback_alerts`(0) | ⬛ |
| 35 | `coaching-impact-summary` | 115 | FE `src/hooks/coaching/useCoachingImpact.ts` | true (default) | `coaching_impact_metrics`(0) | 🟨 |
| 36 | `coaching-intelligence` | 116 | FE `src/hooks/useCoachingIntelligence.ts` | true (default) | `activities`(2228), `sales`(954), `salespeople`(18) | ✅ |
| 37 | `coaching-session-prep` | 188 | FE `src/hooks/coaching/useCoachingSessions.ts` | true (default) | `activities`(2228), `call_coaching_scorecards`(0), `sales`(954) | ✅ |
| 38 | `collect-race-powerup` | 98 | FE `src/hooks/race/useRacePowerups.ts` | true (default) | `race_badges`(0), `race_events`(0), `race_powerups`(0) | 🟨 |
| 39 | `compute-forecast-accuracy` | 167 | FE `src/hooks/revenue-intelligence/useForecastAccuracy.ts` | true (default) | `forecast_accuracy`(0), `forecast_confidence_scores`(0) | 🟨 |
| 40 | `conversational-intelligence` | 169 | FE `src/hooks/useConversationalIntelligence.ts(url)` | true (default) | `call_insights`(0), `call_recordings`(0) | 🟨 |
| 41 | `create-stagnant-tasks` | 219 | FE `src/hooks/useStagnantTasks.ts` | true (default) | `tasks`(600) | ✅ |
| 42 | `cron-failure-alerter` | 554 | **nenhum** | true (default) | `notifications`(6) | ⬛ |
| 43 | `csat-ces-trigger` | 76 | FE `src/components/customer-success/SurveyTriggerDialog.tsx` | true (default) | `csat_ces_surveys`(108) | ✅ |
| 44 | `customer-success-360` | 147 | FE `src/hooks/customer-success/useCustomerSuccess360.ts` | true (default) | `accounts`(100), `csat_ces_surveys`(108), `expansion_opportunities`(14) | ✅ |
| 45 | `customer-success-hub` | 150 | FE `src/hooks/useCustomerSuccess.ts` | true (default) | `account_activities`(360), `accounts`(100) | ✅ |
| 46 | `deal-probability` | 171 | FE `src/hooks/useDealProbability.ts`; edge: create-stagnant-tasks:42 | true (default) | `deal_outcomes`(500), `deal_stage_history`(0), `sales`(954) | ✅ |
| 47 | `deal-risk-digest` | 247 | **nenhum** | true (default) | `notifications`(6) | ⬛ |
| 48 | `demand-forecast` | 233 | FE `src/components/analytics/SalesForecast.tsx` +1; edge: create-stagnant-tasks:70 | true (default) | `demand_forecasts`(0) | 🟨 |
| 49 | `detect-at-risk-deals` | 219 | FE `src/hooks/deal-intelligence/useAtRiskDeals.ts` | true (default) | `activities`(2228), `deal_stage_history`(0), `sales`(954) | ✅ |
| 50 | `detect-client-churn-alerts` | 287 | FE `src/pages/AdminAlertasChurn.tsx` | true (default) | `client_churn_alerts_state`(0), `notifications`(6), `tasks`(600) | ✅ |
| 51 | `detect-coaching-opportunities` | 209 | FE `src/hooks/coaching/useCoachingOpportunities.ts` | true (default) | `coaching_opportunities`(0), `coaching_skill_benchmarks`(0) | 🟨 |
| 52 | `detect-competitor-mentions` | 176 | FE `src/hooks/conversational/useCompetitorMentions.ts` +1 | true (default) | `competitor_mentions`(0) | 🟨 |
| 53 | `detect-critical-moments` | 238 | FE `src/hooks/conversational/useCriticalMoments.ts` +1 | true (default) | `call_critical_moments`(0) | 🟨 |
| 54 | `detect-stuck-deals` | 95 | FE `src/hooks/deal-intelligence/useStageVelocity.ts` | true (default) | `deal_velocity_alerts`(0) | 🟨 |
| 55 | `detect-winloss-at-risk` | 4175 | FE `src/hooks/win-loss/useAtRiskFromPatterns.ts` | true (default) | `sales`(954), `win_loss_patterns`(4) | ✅ |
| 56 | `dialer-queue-builder` | 147 | FE `src/hooks/dialer/usePowerDialer.ts` | true (default) | `dialer_queue_items`(0), `dialer_queues`(0) | 🟨 |
| 57 | `diarize-call-recording` | 253 | FE `src/hooks/conversational/useDiarizeRecording.ts` +1 | true (default) | `call_recordings`(0) | 🟨 |
| 58 | `dispatch-webhook` | 178 | FE `src/hooks/useWebhooks.ts` | true (default) | `webhook_deliveries`(0), `webhooks`(0) | 🟨 |
| 59 | `edge-retry-threshold-alert` | 180 | FE `src/components/admin/connections/EdgeRetryThresholdCard.tsx` | true (default) | `edge_retry_events`(0) | 🟨 |
| 60 | `elevenlabs-stt` | 120 | **nenhum** | true (default) | — | ⬛ |
| 61 | `elevenlabs-tts` | 127 | FE `src/components/settings/AIAssistantSettings.tsx(url)` | true (default) | — | 🟨 |
| 62 | `elevenlabs-voice` | 71 | FE `src/hooks/useElevenLabsVoice.ts(url)` | true (default) | — | 🟦 |
| 63 | `email-bulk-retry` | 163 | FE `src/hooks/email/useFailedDrafts.ts` | true (default) | `email_bulk_drafts`(0) | 🟨 |
| 64 | `email-bulk-send` | 195 | FE `src/hooks/engagement/useBulkComposer.ts`; edge: process-cadence-tasks:90 | true (default) | `email_bulk_drafts`(0), `email_bulk_jobs`(0) | 🟨 |
| 65 | `email-composer-bulk` | 259 | FE `src/hooks/engagement/useBulkComposer.ts` | true (default) | `email_bulk_drafts`(0), `email_bulk_jobs`(0) | 🟨 |
| 66 | `email-engagement-scorer` | 145 | FE `src/hooks/engagement/useEmailEngagementScore.ts` | true (default) | `email_engagement_scores`(0) | 🟨 |
| 67 | `email-unsubscribe` | 62 | webhook ext. | **false (PÚBLICA)** | — | 🟦 |
| 68 | `engagement-score-recompute` | 42 | FE `src/hooks/engagement/useEngagementScore.ts` | true (default) | — | 🟦 |
| 69 | `enrich-lead` | 142 | FE `src/hooks/useLeadEnrichment.ts` | true (default) | `buying_signals`(0), `clients`(100), `enriched_company_intelligence`(0) | ✅ |
| 70 | `execute-workflow` | 217 | FE `src/hooks/automation/useAutomationWorkflows.ts` | true (default) | `activities`(2228), `agenda_events`(0), `automation_runs`(39) | ✅ |
| 71 | `expansion-detector` | 190 | FE `src/components/customer-success/HelpdeskConnectorPanel.tsx` | true (default) | `expansion_opportunities`(14) | ✅ |
| 72 | `export-winloss-pdf` | 129 | FE `src/components/win-loss/ExportPdfButton.tsx` | true (default) | `win_loss_analyses`(500) | ✅ |
| 73 | `external-db-bridge` | 341 | FE `src/components/admin/ExternalDBSettings.tsx` | true (default) | `query_telemetry`(0) | 🟨 |
| 74 | `extract-coaching-actions` | 186 | FE `src/hooks/conversational/useCoachingActions.ts` +1 | true (default) | `coaching_actions`(0) | 🟨 |
| 75 | `extract-committee-from-call` | 264 | FE `src/hooks/deal-intelligence/useCommitteeCoverage.ts` | true (default) | `committee_extraction_runs`(0), `deal_stakeholders`(600) | ✅ |
| 76 | `extract-deal-stakeholders` | 278 | FE `src/hooks/deal-intelligence/useDealStakeholders.ts` | true (default) | `deal_stakeholders`(600) | ✅ |
| 77 | `forecast-narrative` | 516 | FE `src/components/revenue-intelligence/ForecastNarrative.tsx`; edge: ai-copilot:76 | true (default) | `ai_narrative_cache`(0), `forecast_narrative_dead_letters`(0), `revenue_forecasts`(3) | ✅ |
| 78 | `generate-coaching-actions` | 218 | DB trigger; edge: ai-copilot:98 | true (default) | `coaching_actions`(0) | 🟨 |
| 79 | `generate-executive-briefing` | 167 | FE `src/hooks/executive-briefing/useGenerateBriefing.ts` | true (default) | `executive_briefings`(0) | 🟨 |
| 80 | `generate-loss-coaching` | 94 | **nenhum** | true (default) | `coaching_sessions`(0) | ⬛ |
| 81 | `generate-revenue-forecast` | 281 | FE `src/hooks/revenue-intelligence/useRevenueForecast.ts` | true (default) | `forecast_deal_contributions`(0), `revenue_forecasts`(3) | ✅ |
| 82 | `generate-urgent-client-tasks` | 171 | FE `src/pages/AdminFilaTarefasAutomaticas.tsx` | true (default) | `auto_task_queue_settings`(1), `tasks`(600) | ✅ |
| 83 | `get-client-ip` | 21 | FE `src/hooks/useLoginRateLimiter.ts(url)` | true (default) | — | 🟦 |
| 84 | `helpdesk-sync` | 133 | FE `src/components/customer-success/HelpdeskConnectorPanel.tsx` | true (default) | `support_tickets`(146) | ✅ |
| 85 | `inbound-email-webhook` | 151 | webhook ext. | true (default) | `inbound_reply_events`(0) | 🟨 |
| 86 | `lead-scoring` | 267 | edge: create-stagnant-tasks:28 | true (default) | `lead_scores`(900) | ✅ |
| 87 | `log-web-vitals` | 98 | FE `src/lib/webVitals.ts(url)` | **false (PÚBLICA)** | `web_vitals_samples`(0) | 🟨 |
| 88 | `mine-win-loss-patterns` | 170 | FE `src/hooks/deal-intelligence/useWinLoss.ts` +1 | true (default) | `win_loss_insights`(0), `win_loss_patterns`(4) | ✅ |
| 89 | `multichannel-status-webhook` | 100 | webhook ext. | true (default) | `outbound_messages`(0) | 🟨 |
| 90 | `new-device-alert` | 290 | **nenhum** | true (default) | `email_logs`(0), `known_devices`(0), `login_alerts`(0) | ⬛ |
| 91 | `next-best-action` | 404 | FE `src/hooks/useNextBestAction.ts`; edge: create-stagnant-tasks:56 | true (default) | `accounts`(100), `activities`(2228), `deal_outcomes`(500) | ✅ |
| 92 | `nlq-query` | 665 | FE `src/hooks/nlq/useNLQ.ts` | true (default) | `activities`(2228), `sales`(954), `salespeople_public`(0) | ✅ |
| 93 | `notify-critical-pattern` | 55 | **nenhum** | true (default) | — | ⬛ |
| 94 | `notify-quote-conversion` | 275 | FE `src/hooks/useQuotes.ts` | true (default) | — | 🟨 |
| 95 | `notify-ranking-position` | 106 | FE `src/hooks/useRankingNotifications.ts` | true (default) | `ranking_notifications`(0) | 🟨 |
| 96 | `notify-v4-quote-status` | 233 | FE `src/hooks/admin/useV4Callbacks.ts` | true (default) | `v4_callback_dead_letters`(2) | ✅ |
| 97 | `onboarding-launcher` | 142 | FE `src/components/customer-success/HelpdeskConnectorPanel.tsx` | true (default) | `onboarding_journeys`(100), `onboarding_steps`(0) | ✅ |
| 98 | `personal-assistant-stream` | 604 | FE `src/hooks/assistant/usePersonalAssistant.ts(url)` | true (default) | `personal_assistant_briefings`(0) | 🟨 |
| 99 | `pipeline-pulse-aggregator` | 176 | FE `src/hooks/pipeline-pulse/usePipelinePulse.ts`; edge: generate-executive-briefing:54 | true (default) | `conversation_analyses`(0), `deal_health_scores`(900), `lead_routing_assignments`(0) | ✅ |
| 100 | `predict-deal-velocity` | 401 | FE `src/hooks/deal-intelligence/useDealVelocity.ts` | true (default) | `deal_velocity_predictions`(900) | ✅ |
| 101 | `predict-quota-attainment` | 370 | FE `src/hooks/revenue/useQuotaAttainment.ts` | true (default) | `quota_attainment_actions`(0), `quota_attainment_alerts`(0), `quota_attainment_forecasts`(0) | 🟨 |
| 102 | `predictive-intelligence` | 230 | FE `src/hooks/usePredictiveIntelligence.ts` | true (default) | `clients`(100), `lead_scores`(900), `sales`(954) | ✅ |
| 103 | `predictive-scoring-explain` | 274 | FE `src/hooks/scoring/useExplainBatch.ts` +1 | true (default) | `lead_score_explanations`(0) | 🟨 |
| 104 | `pricing-intelligence` | 254 | FE `src/hooks/usePricingIntelligence.ts(url)` | true (default) | `sales`(954), `salespeople_public`(0) | ✅ |
| 105 | `process-cadence-tasks` | 169 | FE `src/pages/Cadencias.tsx` | true (default) | `cadence_tasks`(0) | 🟨 |
| 106 | `process-call-recording-ingest` | 145 | FE `src/hooks/conversational/useUploadCallRecording.ts` | true (default) | `call_recordings`(0) | 🟨 |
| 107 | `process-race-event` | 325 | FE `src/hooks/race/useRaceTrigger.ts` | true (default) | `race_badges`(0), `race_events`(0), `race_powerups`(0) | ✅ |
| 108 | `process-scheduled-sends` | 60 | **nenhum** | true (default) | `scheduled_sends`(0) | ⬛ |
| 109 | `purchase-intelligence-forecast` | 170 | FE `src/hooks/purchase-intelligence/usePurchaseIntelligence.ts` | true (default) | — | 🟨 |
| 110 | `push-subscribe` | 93 | FE `src/hooks/usePushNotifications.ts` | true (default) | `push_subscriptions`(0) | 🟨 |
| 111 | `qbr-generator` | 142 | FE `src/hooks/revenue/useRevenueIntelligenceHub.ts` | true (default) | `qbr_reports`(0) | 🟨 |
| 112 | `qbr-scheduler` | 155 | FE `src/components/customer-success/HelpdeskConnectorPanel.tsx` | true (default) | `agenda_events`(0), `notifications`(6) | ✅ |
| 113 | `race-commentary` | 213 | FE `src/hooks/race/useRaceCommentary.ts` | true (default) | — | 🟨 |
| 114 | `ranking-api` | 345 | **nenhum** | true (default) | `salespeople`(18), `salesperson_custom_field_values`(0), `score_change_logs`(0) | ⬛ |
| 115 | `receive-quote-sync` | 489 | webhook ext. | **false (PÚBLICA)** | `quote_sync_inbound_log`(1), `quotes`(301), `quotes_inbound`(154) | ✅ |
| 116 | `receive-quote-webhook` | 409 | webhook ext. | true (default) | `quote_items`(900), `quote_sync_logs`(0), `quotes`(301) | ✅ |
| 117 | `recompute-stage-baselines` | 78 | FE `src/hooks/deal-intelligence/useStageVelocity.ts` | true (default) | `stage_velocity_baselines`(0) | 🟨 |
| 118 | `refresh-stage-baselines` | 103 | FE `src/hooks/deal-intelligence/useStageBaselines.ts` | true (default) | `stage_velocity_baselines`(0) | 🟨 |
| 119 | `renewal-automation` | 145 | FE `src/components/customer-success/HelpdeskConnectorPanel.tsx` | true (default) | `notifications`(6), `tasks`(600) | ✅ |
| 120 | `report-builder-execute` | 269 | FE `src/hooks/reporting/useReportExecution.ts` | true (default) | `custom_reports`(0) | 🟨 |
| 121 | `report-embed-public` | 263 | FE `src/hooks/reporting/useEmbeddedReportPreview.ts(url)` | true (default) | `report_embed_tokens`(0) | 🟨 |
| 122 | `revenue-forecast-ai` | 204 | FE `src/components/dashboard/PredictiveRevenueForecast.tsx` +1 | true (default) | `revenue_forecast_view`(0) | 🟨 |
| 123 | `revenue-intelligence` | 116 | FE `src/hooks/revenue/useRevenueIntelligenceHub.ts(url)` | true (default) | `pipeline_inspection_snapshots`(0) | 🟨 |
| 124 | `revops-hub` | 144 | FE `src/hooks/useRevOpsHub.ts(url)` | true (default) | `activities`(2228), `commissions`(942), `sales`(954) | ✅ |
| 125 | `rotate-daily-challenges` | 96 | FE `src/components/gamification/DailyChallengesCard.tsx` +1 | true (default) | `daily_challenges`(0) | 🟨 |
| 126 | `run-retry-tests` | 1994 | FE `src/hooks/useRetryTestRun.ts` | true (default) | — | 🟨 |
| 127 | `sales-assistant-chat` | 428 | FE `src/hooks/sales/useSalesAssistant.ts(url)` | true (default) | `activities`(2228), `activity_goals`(9), `deal_outcomes`(500) | ✅ |
| 128 | `salesperson-coaching` | 287 | FE `src/components/analytics/CoachingComparison.tsx` | true (default) | `deal_outcomes`(500), `salespeople`(18) | ✅ |
| 129 | `schedule-optimal-send` | 85 | FE `src/hooks/engagement/useSendTimeOptimization.ts` +1 | true (default) | `scheduled_sends`(0) | 🟨 |
| 130 | `scheduled-report-trigger` | 76 | FE `src/hooks/reporting/useTriggerScheduledReport.ts` | true (default) | `scheduled_reports`(0) | 🟦 |
| 131 | `scheduled-reports-runner` | 132 | edge: scheduled-report-trigger:58 | true (default) | `scheduled_report_runs`(0), `scheduled_reports`(0) | 🟨 |
| 132 | `sdr-consecutive-alerts` | 480 | FE `src/components/sdr/TestSDRAlertButton.tsx` | true (default) | `email_logs`(0), `sdr_alert_history`(0) | 🟨 |
| 133 | `semantic-coverage` | 44 | FE `src/hooks/semantic/useSemanticCoverage.ts` | true (default) | — | 🟦 |
| 134 | `semantic-index-entity` | 173 | FE `src/hooks/semantic/useIndexEntity.ts`; edge: semantic-reindex-batch:88 | true (default) | `semantic_index`(0) | 🟨 |
| 135 | `semantic-reindex-batch` | 149 | FE `src/hooks/semantic/useReindexBatch.ts` | true (default) | `semantic_index`(0) | 🟨 |
| 136 | `semantic-search` | 176 | FE `src/hooks/useSemanticSearch.ts(url)` | true (default) | — | 🟨 |
| 137 | `semantic-search-universal` | 145 | FE `src/hooks/semantic/useSemanticSearch.ts` | true (default) | — | 🟨 |
| 138 | `send-alert-notifications` | 456 | FE `src/components/notifications/NotificationPreferenceCard.tsx` | true (default) | `email_logs`(0) | 🟨 |
| 139 | `send-churn-alert-email` | 116 | FE `src/pages/AdminAlertasChurn.tsx` | true (default) | `churn_alert_settings`(1) | ✅ |
| 140 | `send-multichannel-message` | 214 | FE `src/hooks/email/useComposeEmail.ts` +1; edge: process-cadence-tasks:101, process-scheduled-sends:18 | true (default) | `channel_credentials`(0) | 🟨 |
| 141 | `send-password-reset` | 175 | FE `src/components/security/PasswordResetApproval.tsx` | true (default) | `password_reset_requests`(0) | 🟨 |
| 142 | `send-push-notification` | 179 | edge: new-device-alert:250 | true (default) | `push_subscriptions`(0) | 🟨 |
| 143 | `send-quote-to-client` | 174 | **nenhum** | true (default) | `client_interactions`(0), `quotes`(301) | ⬛ |
| 144 | `send-time-optimizer` | 146 | FE `src/hooks/engagement/useSendTimeOptimization.ts` | true (default) | `send_time_profiles`(0) | 🟨 |
| 145 | `sequence-ab-promote` | 58 | FE `src/hooks/sequences/usePromoteWinners.ts` | true (default) | — | 🟦 |
| 146 | `sequence-enroll` | 110 | FE `src/hooks/sequences/useEnrollContacts.ts` | true (default) | `sequence_enrollments`(0) | 🟨 |
| 147 | `sequence-record-reply` | 100 | **nenhum** | true (default) | `sequence_enrollments`(0), `sequence_step_executions`(0) | ⬛ |
| 148 | `sequence-runner` | 422 | FE `src/hooks/sequences/useEnrollContacts.ts` | true (default) | `agenda_events`(0), `sequence_enrollments`(0), `sequence_step_assignments`(0) | 🟨 |
| 149 | `simulate-load` | 126 | **nenhum** | true (default) | — | ⬛ |
| 150 | `snapshot-forecast` | 117 | FE `src/hooks/revenue-intelligence/useForecastAccuracy.ts` | true (default) | `forecast_snapshots`(6) | ✅ |
| 151 | `start-race-season` | 208 | FE `src/hooks/race/useStartRaceSeason.ts` | true (default) | `race_cars`(8), `race_powerups`(0), `race_scoring_rules`(0) | ✅ |
| 152 | `stress-test-contracts` | 74 | FE `src/components/debug/WebhookSimulationPanel.tsx` | true (default) | — | 🟦 |
| 153 | `summarize-call-recording` | 219 | FE `src/hooks/conversational/useSummarizeRecording.ts` +1 | true (default) | `call_recordings`(0), `clients`(100), `sales`(954) | ✅ |
| 154 | `territory-optimization` | 348 | FE `src/hooks/useTerritoryOptimization.ts(url)` | true (default) | `sales`(954), `sales_territories`(8), `salespeople_public`(0) | ✅ |
| 155 | `test-integration-connection` | 164 | FE `src/hooks/admin/useIntegrationConnections.ts` | true (default) | `integration_health_checks`(0) | 🟨 |
| 156 | `transcribe-call-recording` | 157 | FE `src/hooks/conversational/useTranscribeRecording.ts` | true (default) | `call_recordings`(0) | 🟨 |
| 157 | `twilio-call-status` | 74 | webhook ext.; edge: twilio-click-to-call:86 | true (default) | `call_logs`(0), `twilio_call_sessions`(0) | 🟨 |
| 158 | `twilio-call-twiml` | 34 | webhook ext.; edge: twilio-click-to-call:85 | true (default) | `channel_credentials`(0) | 🟦 |
| 159 | `twilio-click-to-call` | 153 | FE `src/hooks/dialer/useClickToCall.ts` | true (default) | `twilio_call_sessions`(0) | 🟨 |
| 160 | `visual-search` | 201 | FE `src/components/search/VisualSearchButton.tsx(url)` | true (default) | — | 🟨 |
| 161 | `wal-health-alert` | 181 | **nenhum** | true (default) | `v_platform_wal_health`(0) | ⬛ |
| 162 | `webauthn` | 414 | FE `src/hooks/useWebAuthn.ts` | true (default) | `webauthn_challenges`(0), `webauthn_credentials`(0) | 🟨 |
| 163 | `winloss-webhook-dispatcher` | 5646 | **nenhum** | true (default) | `winloss_webhook_dead_letters`(0), `winloss_webhook_deliveries`(0), `winloss_webhook_dispatch_metrics`(0) | ⬛ |
| 164 | `winloss-webhook-health-monitor` | 608 | **nenhum** | true (default) | `winloss_webhook_alerts`(0) | ⬛ |
| 165 | `winloss-webhook-replay` | 725 | FE `src/hooks/win-loss/useAsyncReplayQueue.ts` +2 | true (default) | `winloss_webhook_dead_letters`(0), `winloss_webhook_replay_audit`(0), `winloss_webhook_replay_invocations`(0) | 🟨 |
| 166 | `winloss-webhook-replay-batch` | 430 | **nenhum** | true (default) | — | ⬛ |
| 167 | `winloss-webhook-timeline` | 298 | FE `src/hooks/win-loss/useWebhookTimeline.ts` | true (default) | `user_roles`(3), `winloss_webhook_alerts`(0), `winloss_webhook_dead_letters`(0) | ✅ |
| 168 | `workflow-executor` | 182 | FE `src/hooks/useWorkflows.ts` | true (default) | `workflow_executions`(0), `workflows`(0) | 🟨 |
---

## 8. Contagem por classificação (denominador = 168)

| Classificação | Funções | % de 168 |
|---|---|---|
| ✅ IMPLEMENTADO_TOTAL | **54** | 32,1 % |
| 🟨 PARCIAL | **81** | 48,2 % |
| 🟦 SUGERIDO_OU_INICIADO | **9** | 5,4 % |
| ⬛ MORTO_OU_ABANDONADO | **24** | 14,3 % |
| **Total** | **168** | 100 % |

**Sem chamador identificado: 24 de 168.**

### 8.1 As 24 funções ⬛ mortas

`activity-goal-alerts`, `admin-conversion-trail`, `ai-agent-orchestrator`, `analyze-pipeline-coverage`,
`auto-reassign-inactive`, `challenge-expiration-alerts`, `check-lead-sla`, `check-quote-expiration`,
`check-v4-callback-alerts`, `cron-failure-alerter`, `deal-risk-digest`, `elevenlabs-stt`,
`generate-loss-coaching`, `new-device-alert`, `notify-critical-pattern`, `process-scheduled-sends`,
`ranking-api`, `send-quote-to-client`, `sequence-record-reply`, `simulate-load`, `wal-health-alert`,
`winloss-webhook-dispatcher`, `winloss-webhook-health-monitor`, `winloss-webhook-replay-batch`

Três casos merecem destaque:

- **`cron-failure-alerter` (554 linhas)** — monitor de falhas de cron. As migrations
  `20260712223213_…sql:20` e `20260712230734_…sql:40` referenciam os jobs `cron-failure-alerter-10min`
  e `detect-stalled-cron-15min`; **nenhum dos dois existe em `cron.job`**. O vigia dos crons nunca foi agendado.
- **`notify-critical-pattern`** — tem trigger real (`trg_notify_critical_winloss` em `win_loss_patterns`,
  confirmado em `pg_trigger`), mas o corpo só dispara se `current_setting('app.functions_url', true)`
  estiver definido. Medido: **`app.functions_url` é NULL**. O trigger existe e é um no-op silencioso —
  `win_loss_patterns` tem 4 linhas que nunca notificaram nada.
- **`winloss-webhook-dispatcher` (5.646 linhas, 14 arquivos — a maior função do repositório)** — sem
  chamador. Todas as 7 tabelas `winloss_webhook_*` têm 0 linhas. Junto com `-health-monitor` (608),
  `-replay` (725), `-replay-batch` (430) e `-timeline` (298), é um subsistema de **7.707 linhas** —
  15% de todo o backend — do qual só `-replay` e `-timeline` têm chamador de FE, e nenhum dado jamais fluiu.

### 8.2 Sobre o significado de ✅

✅ significa **"chamador identificado + tabela que a função toca está populada"**. Não prova que *esta
função* escreveu aquelas linhas. Os volumes (`sales`=954, `activities`=2.228, `lead_scores`=900,
`deal_health_scores`=900, `clients`=100, `accounts`=100) têm assinatura de **seed/demo** — números
redondos, proporções exatas. Sem os logs de execução (§9) não é possível distinguir "função gravou" de
"seed gravou e função lê". **Leia ✅ como 'plausivelmente funcional', não como 'comprovadamente em uso'.**

### 8.3 O padrão dominante: 🟨 é quase metade

81 funções (48%) têm código completo, chamador real no front-end — e escrevem em tabelas com **0 linhas**.
O bloco mais evidente é a inteligência de chamadas: `call_recordings`, `call_transcripts`, `call_insights`,
`call_objections`, `call_questions`, `call_sentiment_timeline`, `call_critical_moments`,
`call_coaching_scorecards`, `call_conversation_metrics` — **todas com 0 linhas**. Cerca de 20 funções
(`analyze-call`, `transcribe-call-recording`, `diarize-call-recording`, `summarize-call-recording`,
`analyze-objection-handling`, `analyze-question-quality`, `detect-critical-moments`,
`aggregate-coaching-scorecard`, …) dependem desse pipeline. Como `call_recordings` está vazia, **nada
entra pelo topo do funil** e todo o subsistema fica ocioso — inclusive os 2 triggers de banco que
apontam para `generate-coaching-actions`, que nunca dispararam.

O mesmo vale para: sequences (`sequences`, `sequence_steps`, `sequence_enrollments` = 0), cadences
(`cadences`, `cadence_steps`, `cadence_tasks` = 0), e-mail (`email_logs`, `email_bulk_jobs`,
`email_tracking_events`, `email_opt_outs` = 0) e gamificação de corrida (`race_events`, `race_powerups`,
`race_badges` = 0).

Medido no schema `public`: **398 tabelas, das quais ~300 têm 0 linhas.**

---

## 9. O que NÃO consegui verificar

Declaração explícita dos limites desta auditoria:

1. **Logs de execução das edge functions — não tenho acesso.** Esta é a lacuna principal. Sem
   `analytics.function_edge_logs` / `function_logs` não consigo provar que qualquer função foi
   *realmente invocada*, com que frequência, ou se falhou em runtime. Todas as conclusões de "quem chama"
   vêm de **análise estática** (call sites no código) + **evidência indireta de banco** (`cron.job_run_details`,
   `net._http_response`, contagem de linhas). Um botão de front-end que chama `functions.invoke()` prova
   que o *caminho de código existe* — não que algum usuário já clicou nele.

2. **`verify_jwt` efetivo em produção.** O MCP recusou: *"Listing Edge Functions requires a Supabase
   Management API token (sbp_…)"*. Reporto o que `supabase/config.toml` declara. Funções implantadas via
   dashboard ou Lovable podem divergir. **As conclusões da §2.1 dependem dessa suposição.**

3. **Quais funções estão de fato implantadas.** Não sei se as 168 do repositório correspondem às
   implantadas. Pode haver funções em produção ausentes do repo, ou vice-versa.

4. **Valores dos segredos e quais existem.** Listei apenas nomes de `Deno.env.get()`, conforme instruído.
   Não sei se `ELEVENLABS_API_KEY`, `RESEND_API_KEY`, `LOVABLE_API_KEY` etc. estão realmente configurados.
   Onde escrevi "segredo provavelmente ausente" é **inferência** a partir de tabela-alvo vazia, não medição.

5. **Autoria das linhas existentes.** Sem logs/auditoria por linha, não distingo dados escritos por edge
   function de dados de seed — daí a ressalva da §8.2.

6. **Chamadores fora deste repositório.** Um sistema externo (V4, PromoGifts, n8n, outro app) pode invocar
   qualquer função por HTTP direto. Funções marcadas ⬛ estão mortas *no que este repositório e este banco
   revelam*; um chamador externo desconhecido é invisível para mim.

7. **Corretude funcional.** Não executei nada. Não sei se `predict-deal-velocity` calcula certo — só que
   tem chamador e que sua tabela está vazia.

---

## 10. Síntese

O backend serverless do Promo Champions v2.1 tem **plumbing maduro e produto ocioso**.

A engenharia transversal é genuinamente boa: 163 de 168 funções usam CORS e request-id compartilhados,
65 usam fetch com timeout, existem circuit breaker, retry, rate limit, validação de HMAC e testes em
`_shared/`. Não há exposição de `service_role`, nem SQL arbitrário, nem dump de env — o incidente do
`migrate-helper` foi pontual e está corrigido.

Mas a camada de **automação não existe**: dos 11 jobs de cron, 10 são faxina de banco e **1 único**
chama uma edge function — que responde 200 e devolve `{"evaluated":0,"created":0}`. As ~40 funções
escritas como jobs periódicos nunca foram agendadas. Dos webhooks, 7 estão fora do `config.toml` e
provavelmente inalcançáveis por seus chamadores externos.

E o produto está **vazio**: ~300 das 398 tabelas têm 0 linhas; 48% das funções escrevem exclusivamente
em tabelas vazias. O maior artefato do repositório — o subsistema `winloss-webhook-*`, 7.707 linhas —
nunca processou um evento.

**Ordem de correção sugerida:** (1) tirar o JWT anon hard-coded das 5 migrations e da função SQL;
(2) resolver os 7 webhooks ausentes do `config.toml`; (3) escolher um vencedor em cada par duplicado
(§6.1, §6.2) e apagar o perdedor; (4) agendar ou apagar as 24 funções ⬛ — em especial os 7.707 linhas
de `winloss-webhook-*`; (5) introduzir autorização por papel nas ~140 funções sem verificação, dado que
122 delas rodam com `service_role`.

---

*Documento gerado por auditoria de medição em 2026-08-16. Toda afirmação é rastreável a `arquivo:linha`
ou a uma consulta `SELECT` nomeada no texto. Onde não pude medir, declarei na §9.*
