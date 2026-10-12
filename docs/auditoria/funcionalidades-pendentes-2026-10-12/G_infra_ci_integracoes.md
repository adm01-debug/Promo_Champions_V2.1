# Anexo G — Infraestrutura, CI, testes, scripts e integrações externas

Verificado no commit `6f6b94a` (leitura de código e docs, mais API do GitHub e da Vercel em modo leitura). **NÃO VERIFICADO:** dados de runtime do banco `usyxfpqlsspldubptrdl` (sem MCP disponível na sessão) e variáveis de ambiente da Vercel (API respondeu 403).

Siglas dos planos citados: **P100** = `docs/execucao/PLANO_WORKFLOWS_GITHUB_ACTIONS_100_ETAPAS_2026-09-27.md`; **PCI** = `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md`.

### G.1 Workflows de CI: planejado vs existente

Estado real: 16 workflows `.yml`. O ruleset `main-protection` exige só o check `CI Gate`, com `strict=false`, 0 aprovações, sem code owner, e permite merge por `squash` e `merge`.

#### G.1.1 Workflows que falham todo dia em `main`

| Item | Fonte | Estado | Evidência | O que falta |
|---|---|---|---|---|
| Release Please | `.github/workflows/release-please.yml:26-29` | DIVERGENTE | Todos os runs de push falham com "GitHub Actions is not permitted to create or approve pull requests". 0 tags e 0 releases. | Permitir que Actions crie PR, ou usar token PAT/App. |
| DB Backup (off-site) | `db-backup.yml:54-64` | DIVERGENTE | 6 de 6 runs falharam com `pg_dump ... db.cfmzkthhgliqelozlmwu.supabase.co ... Network is unreachable`. O secret aponta para **outro projeto** e para host IPv6. | Trocar o secret para o pooler IPv4 de `usyxfpqlsspldubptrdl`. |
| Cron Monitoring Regression | `cron-monitoring.yml:75-101` | DIVERGENTE | Falha diária desde 05/10 com `edge status inesperado: 401`. O hack `SUPABASE_SERVICE_ROLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"` (`:95`) continua. | Credencial E2E válida (PCI #37). |
| Dependabot Auto-merge (job `reconcile`) | `dependabot-automerge.yml:43-48` | DIVERGENTE | `fatal: not a git repository`: falta checkout/`GH_REPO`. Repo com `allow_auto_merge=false`. Sem filtro de major. | Checkout, ligar auto-merge, filtrar patch/minor (PCI #93). |
| PR Review SLA | `pr-review-sla.yml:32` | DIVERGENTE | 4 de 4 runs falharam pelo mesmo motivo (gh sem checkout). | `GH_REPO` ou checkout. |
| Migrations Drift | `migrations-drift.yml:66-67` | DIVERGENTE (verde falso) | O `awk` lê a coluna com crases e a lista "remote" sai vazia: o drift **nunca dispara**. O log também mostra centenas de migrations sem linha em `schema_migrations`, porque foram aplicadas via `db_query`. | Corrigir o parser e definir qual é a fonte de verdade. |

#### G.1.2 Gates que existem mas não bloqueiam

| Item | Fonte | Estado | Evidência | O que falta |
|---|---|---|---|---|
| CI Gate só cobre 3 jobs | `pr-checks.yml:655-672` | PARCIAL | `needs: [lint-and-typecheck, test, build]`. Ficam fora: migrations-gate, security-audit, edge-functions-lint, deno-tests, sql-tests, k6-smoke, e2e, lighthouse, bundle-size, gen-types-drift. | Incluir no gate (P100 #28/#32, PCI #12). |
| Job cancelado passa no gate | `pr-checks.yml:667` | DIVERGENTE | Só conta `"result": "failure"`. | Exigir `success`/`skipped`. |
| Workflows separados fora do gate | edge-functions-bundle, request-id, input-validation, a11y-sweep, quote-to-sale-e2e, codeql, graphify | NÃO INICIADO | Nenhum é required. | PCI #13. |
| Ruleset fraco | ruleset 22148182 | NÃO INICIADO | `strict=false`, 0 aprovações, sem code owner. | PCI #9/#16/#18; P100 #29-31. |
| CODEOWNERS inválido | `.github/CODEOWNERS:8,16-22` | NÃO INICIADO | 6 erros "Unknown owner @promo-ops". | Criar a conta ou remover. |
| Merge queue | — | NÃO INICIADO | Nenhum `merge_group:`. | PCI #10-11. |
| security-audit | `pr-checks.yml:146-169` | PARCIAL | Fora do gate. Só `--omit=dev`. Não abre issue. | PCI #59; P100 #20. |
| bundle-size | `pr-checks.yml:587-619` | PARCIAL | O comentário diz "quebra o job", mas o job não é required. | Incluir no gate. |
| lighthouse | `pr-checks.yml:549-585`; `.lighthouserc.json` | PARCIAL | `url` e `staticDistDir` juntos; upload em storage público temporário. | PCI #57-58. |
| gen-types-drift | `pr-checks.yml:621-653` | DIVERGENTE | Compara com o banco de **produção** e falha em PR com migration ainda não aplicada. | Banco efêmero ou rodar só em main (PCI #49-50). |
| k6-smoke | `pr-checks.yml:367-409` | NÃO INICIADO na prática | 0 variables. `K6_TARGET_BASE_URL` não existe e o job sempre pula "verde". | Criar a variável ou staging. |
| sql-tests remoto | `pr-checks.yml:327-351`; `scripts/run-sql-tests.sh:60-68` | DIVERGENTE | Pula porque o secret aponta para o ref errado. Cobertura: **45 de 406 tabelas**. | Secret correto. |
| deno-tests live | `pr-checks.yml:320-321` | PARCIAL | Testes live pulados por "Invalid API key". | Corrigir a service role do CI. |
| notify-failure (4 workflows) | `pr-checks.yml:674-702`, `codeql.yml:44-66`, `cron-monitoring.yml:105-127`, `qa-exhaustive.yml:164-186` | NÃO INICIADO (sem efeito) | O secret `SLACK_CI_WEBHOOK_URL` não existe: nenhuma falha chega a ninguém. db-backup, release-please, dependabot e pr-review-sla nem têm o job. | Canal (Slack ou WhatsApp via N8N, PCI #84) e `_notify.yml` (P100 #42). |

#### G.1.3 Falhas mascaradas (continue-on-error, steps comentados)

| Item | Fonte | Estado | Evidência | O que falta |
|---|---|---|---|---|
| Lighthouse no QA | `qa-exhaustive.yml:117` | NÃO INICIADO | `|| echo "::warning::"`: nunca falha. | PCI #61. |
| Build do QA sem env | `qa-exhaustive.yml:94` | DIVERGENTE | Sem `VITE_*`, cai no default de **produção** (`src/integrations/supabase/env.ts:4-12`). | PCI #60. |
| Summary com números fixos | `qa-exhaustive.yml:147-156` | NÃO INICIADO | "293+ cenários" e "917 fuzz" são texto fixo. | PCI #66. |
| `--no-check` no deno test | `qa-exhaustive.yml:81-88` | NÃO INICIADO | Esconde erro de tipo. | P100 #77. |
| Upload off-site S3 | `db-backup.yml:74-80` | NÃO INICIADO | Step comentado. | Bucket e secrets. |
| Health pós-deploy | `deploy.yml:154-163` | PARCIAL | Só `::warning::`. | Smoke que reprova (PCI #97). |
| Lockfile Deno | `pr-checks.yml:261-267` e outros | PARCIAL | `--frozen=false` muta o lock. | `--frozen` (PCI #55-56). |

#### G.1.4 Itens dos planos P100/PCI ainda não feitos

| Item | Fonte | Estado | O que falta |
|---|---|---|---|
| README dos workflows | `.github/workflows/README.md` | DIVERGENTE | Documenta só 8 dos 16 (PCI #98; P100 #96). |
| Supply chain das Actions | API de permissions | NÃO INICIADO | `allowed_actions=all`, `sha_pinning_required=false` (PCI #20-21). |
| actionlint, zizmor, dependency-review, CodeQL para actions | — | NÃO INICIADO | PCI #22-23, #28-29. |
| `persist-credentials: false` e `permissions: {}` | — | NÃO INICIADO | `actions: write` em vários workflows (PCI #24-26). |
| Injeção via `${{ }}` em `run:` | `cron-monitoring.yml:66,70`; `pr-checks.yml:38,42-43` | NÃO INICIADO | PCI #27. |
| `supabase/setup-cli version: latest` | `deploy.yml:120`, `migrations-drift.yml:48`, `pr-checks.yml:637` | NÃO INICIADO | Fixar versão (PCI #31). |
| Environment `ci-integration`; secrets fora do nível do repo | — | NÃO INICIADO | PCI #33-36. |
| `VITE_SUPABASE_PROJECT_ID` unificado em `vars` | `pr-checks.yml:502`; `quote-to-sale-e2e.yml:175` | NÃO INICIADO | PCI #38; P100 #67. |
| Lembrete de rotação de secrets | `docs/SECRETS_ROTATION.md:69-70` | NÃO INICIADO | PCI #39. |
| Composite actions; `.nvmrc`; build único com artifact; cache do Playwright; paralelizar lint e typecheck | — | NÃO INICIADO | PCI #70-78. |
| Concorrência por SHA em `push:main` | `pr-checks.yml:21-23` | PARCIAL | Runs de main ainda são cancelados (PCI #80). |
| Issue automática para falha agendada e CodeQL | — | NÃO INICIADO | CodeQL com **89 alertas abertos (14 high)** e sem gate (PCI #67-69). |
| Dependabot: cooldown, ignore de major, grupo catch-all | `.github/dependabot.yml` | NÃO INICIADO | PCI #90-92. |
| Job "migrations apply cleanly" (`supabase db reset`) | — | NÃO INICIADO | PCI #47. |
| `npm run ci` espelhando os gates | `package.json:52` | DIVERGENTE | Faltam format, complexity, typecheck baseline, deps, coverage ladder, check-migrations, deno (PCI #99). |
| Workflows planejados inexistentes | — | NÃO INICIADO | `_notify.yml`, `stale.yml`, deploy só das functions alteradas, bundle diário (P100 #52), relatório mensal de minutos (P100 #65), alerta via N8N após N falhas (P100 #43), revisão trimestral (P100 #100). |

### G.2 Testes

#### G.2.1 Testes pulados, auto-pulados e quarentena

| Item | Fonte | Estado | Evidência | O que falta |
|---|---|---|---|---|
| `.only`, `fixme`, `todo`, `xit` | src, tests, functions | OK | 0 ocorrências. A quarentena está vazia (`tests/flaky-quarantine.json`). | — |
| Testes de autorização FORBIDDEN | `tests/e2e/quote-to-sale-api-forbidden.spec.ts:56,95`; `quote-to-sale-forbidden.spec.ts:57,86`; `quote-to-sale-error-payload-ui.spec.ts:132,151`; `quote-to-sale-seq-no-advance.spec.ts:114`; `quote-to-sale-backfill.spec.ts:54` | NÃO INICIADO | 8 `test.skip(true, ...)`: a conta de CI é privilegiada, então **a negação de acesso nunca é testada**. | Segunda conta E2E de vendedor (PCI #46). |
| Skips por `!HAS_AUTH` | `tests/e2e/pages-*.spec.ts` (172 ocorrências) | PARCIAL | Rodam só no job E2E, que não é required (a última run da PR #240 foi cancelada antes do merge). | E2E required (P100 #72). |
| Privilégio de `service_role` | `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:13-44` | NÃO INICIADO | `describe.skipIf(!canRun)`, com `canRun=false` no CI. | Job de integração. |
| forecast-narrative | `supabase/functions/forecast-narrative/index.test.ts:76-177` | NÃO INICIADO | 7 cenários `ignore: !USER_TOKEN`: os secrets não existem. | Secrets ou fixture. |
| Contrato de migrations | `tests/migrations/*.ts`; `deno.json:4` | NÃO INICIADO | `scripts/deno-test-suite.mjs:29` só varre `supabase/functions`. | Incluir no runner. |
| Suíte SQL órfã | `supabase/tests/role_helpers_matrix_assertions.sql` | NÃO INICIADO | `run-sql-tests.sh:70-91` roda 4 de 5. | Incluir. |
| Teste-espelho | `src/hooks/dashboard/__tests__/useDashboardKPIs.contract.test.ts` | PARCIAL | Não importa o hook que diz testar. | Reescrever. |
| a11y sweep | `tests/a11y/routes.ts`; `axe-sweep.spec.ts:85-91` | PARCIAL | No CI só avalia `/auth` e `/404`: **2 de 175 rotas**. | Injetar sessão e ampliar a lista. |
| E2E contra produção | `pr-checks.yml:422-509`; `quote-to-sale-e2e.yml:106,167-181` | DIVERGENTE | A suíte grava vendas reais no banco oficial. | Staging ou banco efêmero. |

#### G.2.2 Módulos sem nenhum teste

Só 3 de 103 diretórios de `src/components` têm teste (email 1/10, reporting 1/15, sales 1/16). Entre as páginas, 1 de 173 tem teste. Em `src/hooks` são 26 testes para 484 arquivos. Em `src/services`, 4 de 7.

| Domínio | Arquivos sem teste (sem teste / total) |
|---|---|
| CRM core | pipeline 0/23, clients 0/20, deal-intelligence 0/47, activities 0/21, tasks 0/9, orders 0/4, quotes 0/2 |
| Cadências / multicanal | cadences 0/22, sequences 0/20, multichannel 0/11, engagement 0/21; hooks 0/30 |
| IA / coaching | coaching 0/23, conversational 0/60, revenue-intelligence 0/43, assistant 0/13, dialer 0/7, forecast 0/7 |
| Gamificação | race 0/107, gamification 0/36; `hooks/race` 1/41 |
| Win-Loss / competitive | componentes 0/65 e 0/33; hooks 0/54; só `lib/winloss` tem teste (5/6) |
| BI / relatórios | bi 0/30, analytics 0/54, dashboard 0/66, reports 0/13 |
| Admin / segurança | admin 0/59, security 0/20, settings 0/27 |
| Customer Success | 0/12 |

- **Edge functions:** só **30 de 172** têm teste. Não têm nenhum: as 3 de Twilio, as 3 de ElevenLabs, as 2 de Bitrix24, multichannel-status-webhook, inbound-email-webhook, email-bulk-send, webauthn, push-subscribe, send-push-notification, helpdesk-sync, external-db-bridge e receive-quote-webhook.
- **SQL:** 45 de 406 tabelas cobertas.

#### G.2.3 Escada de cobertura

| Item | Fonte | Estado | Evidência |
|---|---|---|---|
| Cobertura global | `coverage-baseline.json:3-6`; `vitest.config.ts:65-70` | PARCIAL | lines **3,99%**, branches 3,31%, functions 2,92%. Threshold de 2,5%. Meta de 5% (`docs/TECH_DEBT.md:9`) não atingida. |
| `src/services` | `coverage-ladder-baseline.json`; `15_PLANO_COBERTURA_MODULOS.md:50` | PARCIAL | 20,65% contra meta de 40%. |
| `src/lib/schemas` | `15_PLANO...md:49,61` | DIVERGENTE | Meta de 90% para um módulo que foi removido (PR #209). |
| Teto de complexidade | `package.json:24` | DIVERGENTE | `--max-warnings 130`, mas a regra diz 126 e "o teto só desce". |
| Baselines de tipo | `scripts/typecheck-baseline.json`; `deno-typecheck-baseline.json` | PARCIAL | 882 erros strict no frontend e 58 no Deno. |
| Allowlist de validação de input | `scripts/input-validation-lint-allowlist.txt` | PARCIAL | **122 de 172** functions gravam no banco sem `_shared/validation.ts`. |
| `TEST_QUALITY_REPORT.md` | raiz | DIVERGENTE | Medição de 2026-09-02, desatualizada. |

### G.3 Scripts do package.json

| Item | Fonte | Estado | Evidência |
|---|---|---|---|
| `check:data-layer`, `check:domain-boundaries` | `package.json:33-34`; `scripts/baselines/*.txt` (134 e 70 entradas) | NÃO INICIADO no CI | Nenhum workflow chama. |
| `smoke:target` | `package.json:42` | NÃO INICIADO no CI | Não é usado como smoke pós-deploy (P100 #86). |
| `debt:report`, `graphify:*` (exceto test), `a11y:report` | `package.json:37,46-53` | NÃO INICIADO no CI | — |
| `package.json` sem `version` | `package.json:1-5` | DIVERGENTE | O release-please registra "updating from undefined". |
| Scripts sem chamador | `scripts/` | morto ou manual | `ci-check-forbidden.sh`, `codemod-*.mjs`, `dev-kpis-as-role.sh`, `verify-dispatcher-request-id.sh`, `prod-health-check.ts`, `pack-quote-to-sale-artifacts.ts`, `run-win-loss-analysis.ts`, `gen-api-catalog.mjs`, `gen-data-dict.mjs`, `db/simulate-migrations-via-mcp.ts`, `seed-*.ts`. |
| **PII em repo público** | `scripts/seed-real-people.ts:14+` | DIVERGENTE | Nomes e e-mails reais de vendedores, num repositório **público**. |

### G.4 Integrações externas

| Integração | O que existe | Estado | O que falta |
|---|---|---|---|
| **Twilio (voz/dialer)** | `twilio-click-to-call` (JWT, rate limit, E.164, circuit breaker); `twilio-call-twiml`/`twilio-call-status` com assinatura; tabela `twilio_call_sessions`; UI `components/dialer`; credenciais por tenant em `channel_credentials` | PARCIAL | (1) Auth token Twilio em **texto puro**, legível por qualquer admin/manager de qualquer tenant (`migrations/20260417112931_*.sql:19-21`). (2) `verified_at` nunca é gravado. (3) Callback de status sem reconciliação (`twilio-call-status/index.ts:70-79`). (4) Sem chamadas de entrada. (5) 0 testes. (6) Runbook diverge sobre `TWILIO_TWIML_URL`. |
| **ElevenLabs** | `elevenlabs-voice`/`tts`/`stt`; `useElevenLabsVoice.ts`; `AIAssistantSettings.tsx` | PARCIAL | (1) `elevenlabs-stt` sem chamador e **não deployada** (`docs/runbooks/elevenlabs.md:10-14`). (2) Sem medição de consumo. (3) Sem fallback de voz. (4) 0 testes. (5) A transcrição de chamadas usa outro provedor de IA (duas rotas para a mesma coisa). |
| **Bitrix24** | `bitrix24-oauth`, `bitrix24-sync` (822 linhas), `Bitrix24Tab.tsx`, `useBitrix24.ts`, `BitrixSyncHistory` | DIVERGENTE | (1) O callback OAuth redireciona sem JWT e o `supabase/config.toml` **não** declara `verify_jwt=false`: o OAuth tende a não completar (401). (2) **Sem refresh automático** de token (`bitrix24-sync/index.ts:78-99`); o token expira em cerca de 1h. (3) **Sem cron**, embora `AdminSystemStatus.tsx:34` anuncie "Horário". (4) Tokens em texto puro. (5) Sem webhook de entrada. (6) Sem reprocesso. (7) 0 testes. |
| **WhatsApp / Evolution (multicanal)** | `send-multichannel-message` (twilio, meta_cloud, zapi), `multichannel-status-webhook`, `outbound_messages`, `ChannelCredentialsManager` | DIVERGENTE | (1) **Não existe integração com a Evolution API** no código, embora o `CLAUDE.md` §5 diga "via Evolution". (2) MessageBird aparece na UI mas o envio responde `provider_not_supported` (`send-multichannel-message/index.ts:306`). (3) O envio por Twilio não define StatusCallback, e o webhook valida só o token global, então callbacks de tenant falham. (4) Z-API não assina webhook. (5) **Respostas do cliente não são ingeridas**: `sequence-record-reply` não tem chamador. (6) Sem retry. (7) Credenciais em texto puro. (8) Quase sem testes. |
| **Email transacional e em massa** | `send-transactional-email` (Resend), `inbound-email-webhook` (bounce/complaint), `email-unsubscribe`, `email-bulk-send`/`retry`, `send-churn-alert-email` | PARCIAL | (1) A RPC **`enqueue_email` não existe em nenhuma migration** e não há worker de fila; bulk e alertas devolvem `email_infra_missing` (`email-bulk-send/index.ts:106,148-158`). (2) Transacional sem retry. (3) Sem webhook de eventos de entrega. (4) Sem UI de remetente/domínio. (5) `process-scheduled-sends` sem cron. (6) O runbook cita SendGrid, que não é usado. |
| **N8N** | `N8nTab.tsx` grava em `integration_connections`; `test-integration-connection` chama `/healthz` | PARCIAL | (1) **O CRM nunca chama o N8N.** (2) `api_key` em texto puro. (3) O teste de conexão não valida a key. (4) Alertas de CI via N8N/WhatsApp planejados e não feitos. |
| **WebAuthn (passkeys)** | `webauthn/index.ts` (simplewebauthn 14), `webauthn_challenges`, `PasskeySettings` | PARCIAL | (1) **Não há login por passkey na tela de login**: `loginWithPasskey` (`useWebAuthn.ts:128`) não é usado em `Auth.tsx`. (2) RP ID vem do cliente (`webauthn/index.ts:144-145`). (3) 0 testes e sem runbook. |
| **Push notifications** | `push-subscribe`, `send-push-notification`, `push_subscriptions`, `public/sw.js`, `usePushNotifications.ts` | NÃO ENTREGA | `send-push-notification/index.ts:15-35` faz POST sem assinatura VAPID e sem criptografia (RFC 8291/8292), e `VAPID_PRIVATE_KEY` nunca é lida. Os serviços de push rejeitam. |
| **Helpdesk (Zendesk / Intercom / Freshdesk)** | `helpdesk-sync` → `support_tickets`; `HelpdeskConnectorPanel` | PARCIAL | (1) Todos os tickets vão para a **"primeira conta"** (`helpdesk-sync/index.ts:142-147`). (2) Busca só 50 tickets, sem paginação. (3) Erro de upsert é engolido. (4) Sem cron, sem config e sem webhook. (5) 0 testes. |
| **external-db-bridge** | allowlist de 10 tabelas, JWT, `ExternalDBSettings.tsx` | PARCIAL | (1) **Sem checagem de papel** para escrita (`index.ts:278-288`). (2) A operação `rpc` não tem allowlist (`:233-238`). (3) Nenhum consumidor funcional. (4) 0 testes. |
| **V4 / PromoGifts (cotações)** | `receive-quote-sync` (HMAC), `receive-quote-webhook`, `notify-v4-quote-status` (cron 5min), `check-v4-callback-alerts` | PARCIAL | Funciona, mas é testada contra produção. O teste live é pulado por credencial inválida. |
| **Webhooks de saída genéricos** | `dispatch-webhook`, `WebhooksPage` | NÃO INICIADO (produtor) | Só dispara o `test.ping` (`src/hooks/useWebhooks.ts:170-180`); **nenhum evento de negócio emite webhook**. |
| **Webhooks Win/Loss** | dispatcher, replay, replay-batch, timeline, health-monitor, DLQ | NÃO INICIADO (produtor) | Só é chamado por replay, teste e `RetryTestStatusPage.tsx`; nenhum evento real dispara. |
| **Crons de integração** | 18 `cron.schedule` nas migrations | NÃO INICIADO / NÃO VERIFICADO | Sem cron para bitrix24-sync, helpdesk-sync, process-scheduled-sends, sequence-runner, scheduled-reports-runner, qbr-scheduler, renewal-automation, check-quote-expiration. 7 migrations dependem de `_internal_secrets.functions_base_url`, que `IDENTIDADE_BANCO_2026-09-13.md:94` registra como **inexistente**. |

### G.5 Staging, DR, backup e release

| Item | Fonte | Estado | Evidência / o que falta |
|---|---|---|---|
| Staging | `docs/STAGING.md:3,65-69` | NÃO INICIADO | Existe um único projeto Supabase; `supabase/config.staging.toml` não é usado. |
| E2E, quote-to-sale e invariantes em produção | `pr-checks.yml`, `quote-to-sale-e2e.yml` | DIVERGENTE | Gravam e apagam vendas no banco oficial. |
| Previews da Vercel batem em produção | `src/integrations/supabase/env.ts:4-12` | DIVERGENTE | Sem env, o build cai no default de produção, contrariando `STAGING.md:49`. |
| Backup diário | `db-backup.yml`; `docs/SIZING.md:10` | DIVERGENTE | 100% de falha, embora o `SIZING.md` diga que o backup "já roda". |
| **Artifacts em repositório público** | `db-backup.yml:66-72`; `pr-checks.yml:511-517`; `quote-to-sale-e2e.yml:182-188` | RISCO | Relatórios Playwright e HAR com dados de produção ficam disponíveis por 30 dias. Quando o backup funcionar, o **dump completo do banco** ficará baixável por qualquer usuário logado no GitHub. |
| PITR | `docs/DR_PLAN.md:6,15-16` vs `SIZING.md` | DIVERGENTE | O DR diz "PITR habilitado", mas o SIZING indica plano Free. |
| Teste de restore trimestral | `DR_PLAN.md:57-59,64` | NÃO INICIADO | "Primeira execução pendente". |
| Segundo admin (bus factor) | `CODEOWNERS`; `DR_PLAN.md` | NÃO INICIADO | `@promo-ops` não existe. |
| RPO e região secundária | `DR_PLAN.md:22-25` | NÃO INICIADO | RPO não definido. |
| Release automatizado | `release-please*` | DIVERGENTE | Falha sempre; 0 tags. Manifesto em `1.0.0`, enquanto `RELEASE_NOTES.md` diz "v2.1.0". |
| Cadeia release → deploy | `release-please.yml:3-6`; `deploy.yml:38-40` | DIVERGENTE | Tag criada com `GITHUB_TOKEN` não dispara workflow: o `deploy.yml` **nunca rodou**. |
| Credenciais de CI | secrets do repo | DIVERGENTE | Service role com "Invalid API key"; `SUPABASE_DB_URL` aponta para outro ref. |

### G.6 Deploy (Vercel, Lovable e Supabase)

| Item | Fonte | Estado | Evidência / o que falta |
|---|---|---|---|
| Qual frontend é o de produção | `CLAUDE.md` §2 (Vercel) vs `docs/DEPLOYMENT.md:11-23` e `deploy.yml` (Lovable) | DIVERGENTE | A Vercel publica `main`, mas os docs mandam fazer "Publish" no Lovable. |
| Vercel acessível ao usuário final | API do projeto Vercel | DIVERGENTE | `ssoProtection: all_except_custom_domains` e nenhum domínio custom: a URL de produção exige login na Vercel. |
| `vercel.json` | raiz (inexistente) | NÃO INICIADO | Sem rewrites de SPA e sem headers de segurança; a CSP existe só em `<meta>` (`index.html:56`). |
| Versão do Node | Vercel 24.x vs `.nvmrc` 22 | DIVERGENTE | Produção roda em versão diferente da testada no CI. |
| `deploy.yml`: aprovação | env `Production` | DIVERGENTE | `protection_rules: []`, ou seja, sem gate de aprovação. |
| `deploy.yml`: edge functions | `deploy.yml:122-131` | DIVERGENTE | Publica as 172, mas o plano limita a 100. Não há manifesto de quais 100 estão no ar. |
| `deploy.yml`: migrations | `deploy.yml:133-144` | DIVERGENTE | `db push`, proibido pela regra do `CLAUDE.md`. Como `schema_migrations` está incompleta, tentaria reaplicar centenas. |
| Smoke pós-deploy | `deploy.yml:154-163` | PARCIAL | Só emite warning; os scripts de smoke existentes não são usados. |
| `_internal_secrets.functions_base_url` | 7 migrations | NÃO VERIFICADO | Se a chave continua ausente, os crons HTTP e o broadcast de venda falham sem alarde. |
