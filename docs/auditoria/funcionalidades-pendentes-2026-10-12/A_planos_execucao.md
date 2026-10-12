# Anexo A — Planos, auditorias e execução: estado real verificado

> Verificação em 2026-10-11/12 sobre `main` @ `6f6b94a` (repo local, 644 migrations, 172 diretórios de Edge Function + `_shared`).
> **Limites:** não houve acesso ao banco canônico `usyxfpqlsspldubptrdl` (o conector MCP do projeto não está disponível nesta sessão) nem ao runtime/painéis; `node_modules` ausente, então lint/vitest/tsc **não foram reexecutados**. O estado de itens "vivos" (banco, deploy, secrets) foi julgado só pelo artefato versionado. Quando um doc afirma aplicação ao vivo sem prova reproduzível no repo, isso é dito explicitamente.
> Legenda: **C** = CONCLUÍDO (só contado) · **P** = PARCIAL · **NI** = NÃO INICIADO · **D** = DIVERGENTE (o doc afirma feito, o código não confirma).

---

## A.1 `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md` — plano canônico de 100 etapas (Fases A–J)

Mesma numeração reproduzida em `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md` §4. Ali só 81 e 82 estavam ✅; nenhuma etapa marcada ✅ pelo STATUS ficou sem confirmação no código (não há D aqui).

**Contagem: C 11 · P 53 · NI 36 · D 0**

**Concluídas (11):** 9 (WebAuthn: verificação criptográfica real em `supabase/functions/webauthn/index.ts:20-22,221,319` + `docs/decisions/ADR-010-webauthn-simplewebauthn.md`; o bloqueio provisório foi superado), 14 (todos os refs ativos apontam para `usyxfpqlsspldubptrdl`: `supabase/config.toml:1`, `supabase/.temp/linked-project.json`, `index.html:45-46`, `src/integrations/supabase/env.ts`, workflows; `rapjs…` só sobra em migrations históricas e na de correção `20260903000002`), 17 (`.nvmrc`=22, Deno `v2.9.x` fixado em `pr-checks.yml:259`, verificação de drift do `deno.lock` em `pr-checks.yml:261-266`), 18 (só existe `package-lock.json`; `bun.lockb`/`yarn.lock` foram removidos), 41 (nenhum erro de parser TS1xxx em `scripts/deno-typecheck-baseline.json`), 42 (`_shared/retry.ts` fora da baseline; testes `_shared/retry.test.ts`, `retry_test.ts`), 63 (`src/pages/FollowUpAudit.tsx:236` mostra erro honesto, sem mock), 64 (`src/hooks/admin/useUsageAnalytics.ts:25` lê `page_analytics`, gravada por `src/lib/analytics.ts:92`), 72 (`src/lib/supabase/chunkedIn.ts` + guarda `all-in-calls.test.ts`), 81 e 82 (gates `lint --max-warnings 0` e vitest em `pr-checks.yml:78,201`; não reexecutados aqui).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 1 | Abrir incidente de credenciais | NI | ausente: procurei "incidente" em `docs/postmortems/` (só `2026-08-30_cron_outage.md`) e `docs/SECRETS_ROTATION.md` | Ticket formal com owners e cadeia de custódia |
| 2 | Congelar deploys destrutivos | NI | nenhuma janela registrada; migrations continuaram até `20261005220000_*` | Registro formal (ou declarar a etapa obsoleta) |
| 3 | ADR de topologia | P | decisão de fato em `docs/estado/IDENTIDADE_BANCO_2026-09-13.md` §Veredito e `CLAUDE.md` §1 | ADR em `docs/decisions/` (ADR-001…010 não tratam disso); decidir o destino de `rapjs…`, que segue com functions publicadas (IDENTIDADE §3) |
| 4 | Desativar migrate-helper na origem | P | `supabase/functions/migrate-helper` ausente; `supabase/config.toml:74` | Prova de 404 no runtime de `rapjswienfhkobhlamxb`. IDENTIDADE §3 diz que esse projeto "ainda tem todas as edge functions publicadas" |
| 5 | Rotacionar chave fixa da migrate-helper | NI | `docs/SECRETS_ROTATION.md:128`: "Nenhuma rotação registrada até… 2026-10-01" | Rotação + inventário de consumidores |
| 6 | Rotacionar service_role do destino | NI | idem; segredo segue no histórico Git (STATUS §3.2, commit `b722848dd5`) | Rotação + smoke |
| 7 | Rotacionar credenciais da origem | NI | idem | Rotação após análise de logs |
| 8 | Investigar uso indevido | NI | nenhum relatório de impacto no repo | Consulta a logs Auth/Edge/PostgREST |
| 10 | Scorecard de prontidão real | P | matriz em STATUS §4 (08-30) e `docs/estado/ESTADO_ATUAL.md` (medição de 08-16, ainda sobre `rapjs`) | Painel vermelho/amarelo/verde atualizado |
| 11 | Conector SQL somente leitura | P | gateway MCP descrito em IDENTIDADE §1 (fora do repo; tem escrita) | Credencial realmente RO e auditável |
| 12 | Snapshots de catálogo origem+destino | P | `scripts/graphify/catalog-adapter.mjs` (só banco descartável, lote C) | Manifestos assinados dos dois projetos |
| 13 | Fingerprints dos projetos | P | `supabase/.temp/{postgres,rest,gotrue}-version`. Região contraditória: STATUS diz `sa-east-1`, `VALIDACAO_SINCRONIA…09-10.md:6` diz `us-east-2` | Inventário canônico único |
| 15 | ADR de migrations | P | `docs/execucao/MIGRATION_RENAME_MAP.md`; gate `scripts/check-migrations.mjs` (nomes de 14 dígitos únicos, sem duplicatas no diretório) | ADR formal; reparo do ledger vivo, não executado (`VALIDACAO_SINCRONIA…` §8; IDENTIDADE §3: `20260903000002` "nunca foi aplicada") |
| 16 | Tipos por ambiente | P | `src/integrations/supabase/types.ts` regenerado do destino (`VALIDACAO_SINCRONIA…` §2) | Ainda faltam objetos usados pelo código (`auth_users_view`, `leads`, `team_members`, `enqueue_email`) |
| 19 | Baseline de presença Edge | NI | só a contagem pontual de 08-31 (`HARDENING_CANONICO…:111-123`: 81×200 / 85×404) | Manifesto por ambiente (local 172 × limite de 100 deployadas) |
| 20 | Baseline de tráfego/erros | NI | ausente | Inventário de consumidores reais de 30–90 dias |
| 21–29 | Comparar schemas, colunas, constraints, índices, RLS, policies, rotinas, triggers/views/MVs, enums/extensões entre origem e destino | NI (9 etapas) | não há matriz origem×destino no repo; `VALIDACAO_SINCRONIA…` compara repo×destino, não origem×destino | Matrizes assinadas, ou declarar a fase obsoleta pela decisão de topologia |
| 30 | Comparar privilégios, jobs e ledger | NI | idem | Idem |
| 31 | RLS na partição `p2026_11` | NI | ausente: `p2026_11` não aparece em `supabase/migrations/` (objeto da origem) | Migration ou declaração de N/A |
| 32 | Corrigir job 297 (VACUUM) | NI | job da origem; `20260831130001_repair_cron_and_fk_indexes.sql` trata outros jobs (destino) | Idem |
| 33 | Implementar log de preço | NI | ausente: `fn_log_price_change` não está em nenhuma migration | Idem |
| 34 | Fechar default ACLs | P | `20260902121000_fix_default_privileges_truncate_and_battle_score_search_path.sql` | Revogar `FOR ROLE supabase_admin` (não há migration; `VALIDACAO_SINCRONIA…` §8) |
| 35 | Reduzir grants de tabelas/sequences | P | REVOKEs em `20260831130000_harden_public_access_and_privileged_rpcs.sql` e `20261001203300_deny_dead_tables_revoke_anon_grants.sql` | Matriz mínima por role testada |
| 36 | Revisar policies `true` | P | 5 placeholders removidos (HARDENING §Segurança) | Classificar as 176 USING / 48 CHECK |
| 37 | Minimizar façades públicas | P | 9 views passaram a `security_invoker` (`20260831130000`) | `v_products_public` (origem) sem artefato |
| 38 | MVs/publicações Realtime | NI | ausente: `mv_product_leaf_category` não está no repo | Decisão sobre Realtime/`auth.users` |
| 39 | Endurecer SECURITY DEFINER | P | `docs/decisions/ADR-008-anon-executable-security-definer.md`; 26 migrations após 09-10 com `SET search_path`; `tests/e2e/security-definer-rpc-access.spec.ts` | 15/204 grants de RPC e 8 funções do Advisor não tratados (`VALIDACAO_SINCRONIA…` §8) |
| 40 | Resolver stubs de banco | NI | os no-ops do Apêndice A da MATRIZ_FORENSE (`fn_force_user_logout` etc.) não aparecem em migrations | Decisão por rotina |
| 43 | Zerar as outras falhas TS das Edge | P | 58 diagnósticos em 30 arquivos (`scripts/deno-typecheck-baseline.json`) | Zerar a baseline |
| 44 | Type check bloqueante | P | ratchet `scripts/check-deno-types.mjs` (`pr-checks.yml:276-277`): bloqueia só erro **novo** | Bloquear qualquer erro |
| 45 | Reconciliar tabelas/RPCs das Edges | P | `lead_routing_assignments` resolvido. Seguem sem tabela/RPC em migrations e tipos: `leads` (`sequence-runner/index.ts:366`, `ai-agent-orchestrator/index.ts:300`), `team_members` (`ranking-api/index.ts:89,167,186`), `enqueue_email` (`email-bulk-send/index.ts:128`, `email-bulk-retry`, `send-churn-alert-email`) | Criar objetos ou trocar chamadas |
| 46 | Unificar `sales.status` | P | `20261001220100_sales_status_canonico.sql` (status canônico; `deal_status` vira GENERATED) | DROP de `deal_status` adiado; fixtures |
| 47 | Autenticação de endpoints externos | P | `_shared/webhook-auth.ts`, `oauth-state.ts`, `cron-request-auth.ts`, `rate-limit.ts` | Threat model (ausente: procurei "threat model/STRIDE" em `docs/`) |
| 48 | Autorização nas funções service-role | P | `docs/SEC-08_SERVICE_ROLE_AUDIT.md` (07-11, ~140 funções); `_shared/auth-client.ts` | Matriz função→papel→escopo das 172; `run-retry-tests` sem guarda própria |
| 49 | Consertar envio de quote | P | `send-transactional-email` agora existe; `send-quote-to-client/index.ts:179` o invoca | Evidência quote→e-mail/WhatsApp em staging |
| 50 | Remover simulação persistida como sucesso | P | `enrich-lead/index.ts:35-40` não grava mais dados; `send-multichannel-message/index.ts:185-186` recusa mock | `workflow-executor/index.ts:136-157` ainda registra "Ação … executada (simulado)" com `status: "success"` |
| 51 | Parametrizar scripts com segredo | P | `scripts/lib/requireSupabaseAdminEnv.ts` (env + `CONFIRM_SUPABASE_ADMIN_WRITE`); nenhum JWT service_role no HEAD (varredura local) | Modo dry-run; gitleaks no CI (hoje o scanner é próprio: `scripts/security/check-no-committed-service-role.ts`) |
| 52 | Planejar expurgo do histórico | NI | ausente: procurei "filter-repo/BFG" em `docs/` | Runbook e janela |
| 53 | Roleta em RPC atômica | P | `20260830000001_secure_prize_wheel_spins.sql` (`FOR UPDATE`, `request_id` idempotente, sem anon); `usePrizeWheel.ts:77` | Teste concorrente/adversarial automatizado (só asserção SQL) |
| 54 | Isolar mocks produtivos | P | removidos: enrich-lead, FollowUpAudit, BI-setor (RPC). Remanescentes: `ApprovalQueue.tsx:54` (MOCK_PENDING), `SDRConversationInsights.tsx:6`, `LiveIntelligenceFeed.tsx:21`, `ArenaAITips.tsx:27`, `Speedometer.tsx:288`, `EliteCadenceAnalytics.tsx:95,112`, `useClientBI.ts:54` | Modo DEMO com banner ou dados reais |
| 55 | Consertar assinatura digital | P | `useDigitalSignatures.ts:123-146` agora falha de forma honesta ("indisponível") | Provedor, callbacks e E2E |
| 56 | Contratos quebrados do front | NI | `FollowUpTerritoryRules.tsx:61,83` consulta `auth_users_view` (ausente de types.ts e de todas as migrations); `usePurchaseHistory.ts:54-60` com cast e `profiles:user_id` | Criar a view ou mudar a consulta; tirar os casts |
| 57 | Lead routing no backend | P | RPC transacional `route_unassigned_client_portfolio` (`useLeadRouting.ts:42`, `useClientPortfolio.ts:224`); sem localStorage | `auto_assign_lead` (`20260830000002:312`) sem nenhum consumidor; teste multiusuário real |
| 58 | Navegação de pedidos | P | fallback `/meus-pedidos`→`/acompanhamento-pedidos` (`useBackNavigation.ts:15`) | `OrderDetailPage.tsx:49` ainda tem `<Link to="/meus-pedidos">`, rota inexistente (só `/meus-pedidos/:id`, `AppRoutes.tsx:1116`) |
| 59 | Privacidade da rota espectador | NI | `race_spectator_view` (`20260830000000:97-118`) expõe a anon nome, vendas e negócios | Pseudonimização e link expirável (nenhum produtor de link) |
| 60 | Semântica única de venda ganha | P | `src/constants/index.ts:88` `WON_SALE_STATUSES` (60 consumidores) | 7 `eq('status','completed')` crus em `src`; Edge com listas próprias (`generate-urgent-client-tasks/index.ts:12` inclui `paid`/`delivered`/`closed_won`) |
| 61 | Inventário de ações sem efeito | NI | sem matriz; `ApprovalQueue.tsx:56-63` ainda diz "aprovada e enviada" sem backend | Matriz botão→efeito |
| 62 | Persistir onboarding | NI | `src/pages/OnboardingTracking.tsx:42` usa só `useState` | Modelo no banco ou remover a promessa |
| 65 | BI/SDR/pricing com fonte | P | `useClientVsIndustry.ts:28` usa RPC; `PriceElasticityChart.tsx:95` mostra estado vazio honesto | `EliteCadenceAnalytics.tsx:95,112` ("15% acima", "+22%"), `useClientBI.ts:54` (confiança 90 fixa), SDR mock |
| 66 | Conversational Intelligence | NI | `useUploadCallRecording`, `useTranscribeRecording`, `useDiarizeRecording` e `pages/ConversationalIntelligence.tsx` existem mas nada os importa | Ligar o fluxo E2E |
| 67 | Buckets faltantes | P | `call-recordings`, `quote-pdfs`, `report-snapshots` com limites/MIME (`20260831130002_harden_storage_buckets.sql:19-37`) | Antivírus e retenção |
| 68 | Workflows e multicanal reais | P | idem 50 | Ações reais, DLQ, estados fiéis |
| 69 | Reconciliar integrações externas | P | runbooks `docs/runbooks/{bitrix24,twilio,elevenlabs,email-transacional,whatsapp-multichannel}.md`; inventário em `SECRETS_ROTATION.md` | Matriz configured/degraded/disabled com health |
| 70 | DoD por rota | NI | ausente (`docs/estado/01_FRONTEND_ROTAS.md` é de 08-16) | Catálogo 175/175 |
| 71 | Paginar consultas | P | 292 `select('*')` em `src`, 17 `.range(`, `src/lib/supabase/fetchAllRows.ts` | Limites/cursor nas telas grandes |
| 73 | Eliminar N+1 / agregação no cliente | P | RPCs de ranking/portfólio | Orçamento de queries por tela |
| 74 | Validar índices por workload | NI | nenhum `DROP INDEX` depois de `20260712212637`; duplicados mantidos (HARDENING §Jobs) | Parecer por índice |
| 75 | Partições e retenção | NI | ausente | Teste da próxima partição |
| 76 | Jobs observáveis | P | `cron-failure-alerter`, `.github/workflows/cron-monitoring.yml`, `docs/runbooks/cron-failures.md`, `20260913150000_restore_sql_maintenance_crons.sql` | Owner/SLA/timeout por job; IDENTIDADE §3 achou `cron.job` vazio |
| 77 | Concorrência segura | P | roleta, lead routing (advisory lock), dedupe de webhooks (`20260827000001`), `20261002010100_transition_expected_version.sql`, 6 specs E2E de concorrência quote-to-sale | Cadências/workflows; testes de corrida rodando no CI |
| 78 | Retenção de auditoria/telemetria | P | `ADR-007-log-retention.md`, `docs/DATA_RETENTION.md`, `20261001151000_log_retention_indexes_and_purge.sql` | Aprovação jurídica |
| 79 | SLOs e tracing ponta a ponta | P | `ADR-006-request-id-strategy.md`, `edge-functions-request-id.yml`, `20261002000100_slo_burn_rate.sql` | Dashboards; tracing browser→PostgREST |
| 80 | Backup e restore testado | P | `.github/workflows/db-backup.yml` (não há passo de restore), `docs/DR_PLAN.md` | Restore drill com RPO/RTO medidos |
| 83 | Cobertura real | P | `vitest.config.ts:38` inclui `src/**`; piso global 3,99% de linhas (`coverage-baseline.json`) | Subir rumo à meta de 85% |
| 84 | E2E autenticado no CI | P | job `e2e` (`pr-checks.yml:411-510`) é pulado se faltar segredo | Segredos inválidos desde ≥2026-09-28 (`SECRETS_ROTATION.md:59`): E2E não roda de fato |
| 85 | Acessibilidade ampla | P | `tests/a11y/routes.ts` cobre 10 rotas; ignora `color-contrast` e `svg-img-alt` | 175 rotas |
| 86 | Testes Edge automatizados | P | 90 arquivos de teste em 31 diretórios (de 172 funções); job `deno-tests` | Cobertura por função |
| 87 | Supply chain | P | `npm audit` (`pr-checks.yml:168`, fora dos checks obrigatórios), `.github/dependabot.yml`, actions fixadas por SHA | SBOM, gitleaks |
| 88 | CSP e storage do browser | P | `index.html:56`: `script-src 'self' 'unsafe-eval'` (sem `unsafe-inline`); sessão em `localStorage` (`client.ts:11`; ADR-009 "parcial") | Remover `unsafe-eval`; CSP por header |
| 89 | Budgets de performance | P | `scripts/check-bundle-budget.mjs`, `.lighthouserc.json`, job lighthouse | Budgets de queries e memória |
| 90 | Carga e caos | P | `scripts/load/k6-smoke.js` (job é pulado sem `K6_TARGET_BASE_URL`) | Caos e DLQ |
| 91 | Manifesto de candidatos | P | `CANDIDATOS_DE_LIMPEZA_2026-08-26.md` (5 itens, sem hash nem owner) | Manifesto completo |
| 92 | Validar módulos não alcançados | P | 7 dos ~27 listados removidos (`useAICopilot`, `useRevenueIntelligence`, `useGoals`, `sessionHelpers`, `useSessionManagement`, `lib/bi/mockData`, `utils/fuzzing`) | Decisão registrada para os ~20 restantes |
| 93 | Consolidar duplicatas | P | scripts `remove-demos*` não existem mais | `components/atoms/badge.tsx`≡`ui/badge.tsx` e `atoms/input.tsx`≡`ui/input.tsx` (`cmp` idênticos); 7 arquivos importam `atoms/` |
| 94 | Limpar artefatos de tooling | P | `bundle-stats` e `supabase/functions/graphify-out` removidos | `supabase/.temp/*` ainda versionado (8 arquivos) |
| 95 | Normalizar locks e docs históricos | P | lock único | Cabeçalhos de validade (ex.: `ESTADO_ATUAL.md` ainda descreve `rapjs` como produção) |
| 96 | Deprecar antes de remover objetos | NI | ausente | Processo de observação |
| 97 | Lote de remoção ao proprietário | NI | ausente | Aprovação nominal |
| 98 | Canário com rollback automático | NI | `deploy.yml` tem só gate de aprovação; front publicado pela Lovable (`deploy.yml:24`) | Canário |
| 99 | Smoke E2E em produção | P | `scripts/smoke-target-backend.ts`, `docs/runbooks/smoke-target-backend.md`, `scripts/prod-health-check.ts` | Evidência assinada de execução |
| 100 | Certificar prontidão | NI | ausente | Ata go/no-go |

---

## A.2 `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md` (Fases 1–10) ≡ `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md` §13 (P001–P100)

O handoff (§13) é o índice operacional desta mesma lista: `P0nn` = etapa nn. Todos os checkboxes do handoff seguem `[ ]` (§20: "nenhuma etapa considerada concluída"). O estado abaixo vale para os dois documentos. A numeração é **diferente** da do plano de 26/08 (divergência já registrada em STATUS §5.1).

**Contagem: C 17 · P 52 · NI 31 · D 0**

**Concluídas (17):** 8 (9 views passam a `security_invoker` e perdem acesso de anon: `20260831130000_harden_public_access_and_privileged_rpcs.sql`), 12 (`migrate-helper` não existe mais no repo; CLAUDE.md §1 e `config.toml:74` estão coerentes), 31 (=8), 32 (`mv_competitive_ranking` sem anon: `20260831130000:44-45`), 34 (`salesperson_xp`, `maintenance_log` e `login_attempts` corrigidos: `20260831130000:94-109` + RPCs de pré-login, HARDENING §Segurança), 36 (`soft_delete_record`, `restore_deleted_record`, `get_deleted_records`, `restore_record` reescritas: `20260831130000:442-615`), 38 (`claim_pending_cadence_tasks` restrita a `service_role`: `:640-642`), 44 (índices nas 11 FKs: `20260831130001_repair_cron_and_fk_indexes.sql`), 58 (`types.ts` regenerado e já contendo objetos de outubro como `geocode_cache` e `status_transitions`), 61 (sem erros de parser na baseline Deno), 64 (`deno lint` bloqueante: `pr-checks.yml:270`; testes `_shared/unsubscribe_test.ts`, `retry_test.ts`), 71 (enrich-lead não grava mais dados fabricados), 72 (UsageAnalytics lê `page_analytics`), 75 (`PriceElasticityChart.tsx:95` com estado vazio honesto; sem rótulo "Live Model"), 80 (assinatura honestamente indisponível em `useDigitalSignatures.ts:123-146`; WebAuthn real), 85 (gate `format:check` em `pr-checks.yml:93`), 93 (entregas em PRs pequenos por domínio, ex.: #238–#240).

| ID (P0nn) | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 1 | Congelar releases | NI | sem registro | Registro de exceções |
| 2 | Bloquear uso da migrate-helper | P | removida do repo | Prova no runtime da origem (IDENTIDADE §3) |
| 3 | Rotacionar chave fixa | NI | `SECRETS_ROTATION.md:128` | Rotação |
| 4 | Rotacionar credenciais da origem | NI | idem | Rotação |
| 5 | Resposta segura e remoção do deploy | P | diretório removido | 404 comprovado em `rapjs` |
| 6 | Ampliar scanner de segredos | P | `scripts/security/check-no-committed-service-role.ts:17-20` (JWT, `sb_secret_`, hex/base64 em `const *SECRET/TOKEN`) | URLs de banco (`postgres://`) não detectadas; nenhum teste de regressão do scanner |
| 7 | Auditar logs de acesso | NI | ausente | Linha do tempo |
| 9 | Conter funções mutáveis anon | P | REVOKEs em `20260831130000` | 15/204 grants de RPC ainda a revisar (`VALIDACAO_SINCRONIA…` §8) |
| 10 | Baseline imutável | P | inventário de `VALIDACAO_SINCRONIA…` §3 | Snapshot versionado com hash |
| 11 | Matriz canônica de ambientes | P | IDENTIDADE_BANCO; `docs/STAGING.md` (só guia) | Staging real; matriz aprovada |
| 13 | Manifesto versionado de deploy | P | `docs/API.md` gerado por `scripts/gen-api-catalog.mjs` | Hash e data de deploy por função |
| 14 | Fingerprint de projeto nas pipelines | P | `--project-ref usyxf…` em `deploy.yml` | Guarda de ref nos scripts (`requireSupabaseAdminEnv` não confere o ref) |
| 15 | Inventário de Edge implantadas | P | pontual em HARDENING (08-31) | Inventário recorrente; 71 functions sem publicar (`VALIDACAO_SINCRONIA…` §8) |
| 16 | Matriz verify_jwt | P | 20 `verify_jwt=false` em `config.toml`; `docs/API.md:14-33` | Coluna "implantado" |
| 17 | Owners e criticidade | P | `.github/CODEOWNERS` (`@promo-ops` ainda a provisionar) | Catálogo com SLA |
| 18 | Drift em CI | P | `.github/workflows/migrations-drift.yml` (só versões; só avisa sem token) | Drift de policy, grant, cron, storage e deploy |
| 19 | Restore testado | P | `docs/DR_PLAN.md`, `db-backup.yml` | Execução de restore |
| 20 | Gates formais de alteração | NI | `.github/pull_request_template.md` sem backup/dry-run/rollback (grep vazio) | Checklist |
| 21–27 | Reconciliação de dados origem/destino (hash por PK, quotes_inbound 155→154, logs, retenção, crescimento, colunas exclusivas, 137 colunas nulas) | NI (7) | não há artefato no repo | Matrizes, ou declarar obsoleto |
| 28 | Owner das 304 tabelas vazias | P | `docs/DEAD_TABLES.md`; `20261001203300_deny_dead_tables_revoke_anon_grants.sql` | Owner e prazo |
| 29 | 31 relações exclusivas | NI | ausente | Decisão individual |
| 30 | Contratos de storage | P | `20260831130002_harden_storage_buckets.sql` | Owner-folder em todos os buckets |
| 33 | Tirar `raw_user_meta_data` das policies | NI | `"Admins can manage webhooks"` (`20260104143931_webhooks_system.sql:30,37`), `"Admins can view webhook logs"` (`:42,49`), `"Admins can view all audit logs"` (`20260104143930_audit_trail.sql:25,32`): nenhuma migration faz DROP dessas policies | Migration trocando por `user_roles`/helper |
| 35 | Auditar 30 SECURITY DEFINER anon | P | `ADR-008` | Justificativa por função |
| 37 | Bypass por NULL nos mutadores de XP | P | anon revogado (`20260831130000:669-677`) | Corpo de `add_league_weekly_xp`, `increment_combo`, `increment_goal_progress` não reescrito |
| 39 | Reduzir grants e default ACLs | P | idem A.1#34–35 | `FOR ROLE supabase_admin` |
| 40 | Suíte SQL de segurança no CI | P | `supabase/tests/*.sql`; job `sql-tests` (`pr-checks.yml:328-360`) | O nível remoto exige `SUPABASE_DB_URL` |
| 41 | `tr_log_lead_stage_transition` | NI | última menção em `20260814210000_fix_clients_update_triggers.sql` (anterior à auditoria) | Decisão |
| 42 | Validar 1.350 constraints | NI | ausente | — |
| 43 | Índices duplicados | NI | nenhum DROP INDEX depois de 07/2026 | Parecer e autorização |
| 45 | Índice parcial × global de quotes | NI | ausente | Benchmark |
| 46 | 4 contratos de cron quebrados | P | `20260831130001` + `20260913150000_restore_sql_maintenance_crons.sql` | Prova operacional (HARDENING:163-168 registrou falha pós-deploy; IDENTIDADE §3: `cron.job` vazio) |
| 47 | Validar 25 jobs | P | `cron-failure-alerter` | Owner/timeout por job |
| 48 | 69 tabelas em Realtime | NI | último `ALTER PUBLICATION … DROP` em `20260402111117` | Decisão por tabela |
| 49 | Qualificar schemas de extensões | P | `extensions.digest`/`pg_stat_statements_reset` (HARDENING §Jobs) | Varredura completa |
| 50 | Runbook de manutenção | P | `docs/RUNBOOK.md`, `docs/runbooks/cron-failures.md` | Refresh de MV e vacuum medidos |
| 51 | Baseline canônico do banco vivo | NI | ausente (só tipos) | Dump de schema |
| 52 | Reconciliar ledger | P | `docs/execucao/MIGRATION_RENAME_MAP.md` | Executar o mapa no ledger vivo |
| 53 | Catalogar nomes não conformes sem renomear | P | os arquivos **foram renomeados** (MIGRATION_RENAME_MAP), ao contrário do previsto | Executar o mapa de compatibilidade em produção |
| 54 | Timestamps duplicados | P | não há duplicatas no diretório (`check-migrations.mjs` regra 2) | Ledger vivo |
| 55 | `CREATE POLICY IF NOT EXISTS` | P | ainda 1 arquivo: `20260530000002_enable_rls_and_remove_env_risk.sql` | Corrigir |
| 56 | Gate para migrations destrutivas | NI | `scripts/check-migrations.mjs` não tem regra de DROP/TRUNCATE/DELETE | Regra |
| 57 | Replay em banco efêmero | NI | `scripts/run-sql-tests.sh` só tem `static` e `remote` (banco real) | Replay do zero no CI |
| 59 | Contrato .from/.rpc × objetos | P | tsc tipado; `npm run graphify:contracts` | Casts `as unknown as` contornam (ex.: `FollowUpTerritoryRules.tsx:29`) |
| 60 | Bloquear merge com drift | P | `migrations-drift.yml` tolerante | Gate obrigatório |
| 62 | 34 Edge com typecheck quebrado | P | 58 diagnósticos / 30 arquivos | Zerar |
| 63 | 28 testes Deno falhos | P | job `deno-tests` (`pr-checks.yml:286-321`), nível live "nunca bloqueia" | Suíte determinística verde |
| 65 | Matriz authz das funções | P | `docs/API.md` (heurística, segundo `gen-api-catalog.mjs:7-10`) | Matriz revisada com escopo |
| 66 | Ownership em deal-probability, lead-scoring, CS-360, pipeline-pulse | P | `deal-probability` usa cliente do usuário (RLS); CS-360/pulse exigem `is_admin_or_manager` | `lead-scoring/index.ts:24,35-36` autentica e depois usa service_role sem checar ownership |
| 67 | CORS dinâmico | P | `getCorsHeaders` em 149/172 functions | Volta a `*` sem `ALLOWED_ORIGINS` (`_shared/cors.ts:7`); `report-embed-public` com `*` literal |
| 68 | Timeout, breaker, idempotência, request-id | P | `_shared/circuit-breaker.ts`, `fetch-with-timeout.ts`, `request-id.ts` + lint workflow | Aplicar por criticidade |
| 69 | Relações e RPCs ausentes | P | idem A.1#45 | `leads`, `team_members`, `enqueue_email` |
| 70 | verify_jwt × código × deploy | P | `docs/API.md` | Comparar com o deploy real |
| 73 | LiveIntelligenceFeed real × demo | NI | `src/components/conversational/LiveIntelligenceFeed.tsx:21,50` (`mockInsights`) | Separar ou rotular |
| 74 | RecordingSummaryDrawer com dados reais | NI | `src/components/conversational/RecordingSummaryDrawer.tsx:46-57` (`confidence: 0.85/0.92`, "mock timestamp") | Usar a análise real |
| 76 | WhatsApp com provedor real | P | Twilio real (`send-multichannel-message/index.ts:82-100`) | Grava `"sent"` no aceite do provedor (`:320`), não na entrega |
| 77 | Aleatoriedade em dicas/velocímetro | P | — | `ArenaAITips.tsx:27`, `Speedometer.tsx:288` |
| 78 | PDF verdadeiro de win/loss | NI | `export-winloss-pdf/index.ts:70,89-98` grava `.md` com `text/markdown` | Gerar PDF (pdf-lib) |
| 79 | Modelo relacional em CS-360/pulse | NI | `customer-success-360/index.ts:73-76` ainda faz `account_id: o.user_id // Assuming…` | Join real |
| 81 | Cobertura dos fluxos P0/P1 | P | piso global 3,99% | Testes de authz e persistência |
| 82 | Ambiente do E2E no CI | P | validação de configuração (`pr-checks.yml:441-468`) | Segredos inválidos (`SECRETS_ROTATION.md:59`) |
| 83 | Triar 483 testes Playwright | P | 51 specs em `tests/e2e`; `tests/flaky-quarantine.json` | Smoke verde comprovado |
| 84 | a11y autenticada nas 175 rotas | P | 10 rotas | — |
| 86 | 14 vulnerabilidades npm | P | `npm audit` fora dos checks obrigatórios | Não verificável (sem `node_modules`) |
| 87 | Ciclos de chunk e budgets App/WinLoss | P | `scripts/check-bundle-budget.mjs:18-40` | Ciclos |
| 88 | 8 módulos órfãos | P | removidos: `ui/sonner.tsx`, `lib/schemas/commercial.ts`, `lib/bi/mockData.ts`, `utils/fuzzing.ts` | Indicadores Animated sem decisão registrada |
| 89 | Lockfile e artefatos gerados | P | lock único; `graphify-out` com política no `.gitignore` (54-67) | `supabase/.temp/*` versionado |
| 90 | Consolidar docs | P | `docs/estado/README.md` | `ESTADO_ATUAL.md` desatualizado (08-16/`rapjs`) |
| 91 | Limpezas nominais aprovadas | P | os 5 itens de `CANDIDATOS_DE_LIMPEZA` resolvidos | Registro de aprovação |
| 92 | Deprecar objetos de banco | P | `20261001203300_deny_dead_tables_revoke_anon_grants.sql` | Janela e telemetria |
| 94 | Staging e dry-run ponta a ponta | NI | `docs/STAGING.md:3` "Hoje existe um único projeto Supabase" | Criar staging |
| 95 | Canário | NI | ausente | — |
| 96 | Observabilidade/SLO | P | `20261002000100_slo_burn_rate.sql`, `docs/runbooks/alertas-operacionais.md` | Dashboards com owner; `SLACK_CI_WEBHOOK_URL` não criado (`SECRETS_ROTATION.md:63`) |
| 97 | Carga e degradação | P | k6 smoke (pulado sem alvo) | Execução |
| 98 | UAT | NI | ausente | — |
| 99 | Backup restaurável e go/no-go | NI | ausente | — |
| 100 | Implantação gradual com tráfego real | NI | ausente | — |

---

### A.2.1 Itens próprios do handoff (fora da numeração P001–P100)

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| §14.1 | PR documental/CI para P006, P010, P012, P013, P014 | P | P012 C; P006/P013/P014 P (ver acima) | Scanner de URL de banco; manifesto de deploy |
| §14.2–3 | Autorização e contenção da migrate-helper | P | removida do repo | Runtime da origem |
| §14.4 | Pacotes SQL de views e funções anônimas | C | `20260831130000_harden_public_access_and_privileged_rpcs.sql` | — |
| §14.5 | Suíte SQL de segurança no CI | P | `supabase/tests/*.sql`; job `sql-tests` | O nível remoto depende de `SUPABASE_DB_URL` |
| §14.6 | Compilação Edge em lotes | P | parser zerado; 58 diagnósticos TS | — |
| §14.7 | Ambiente CI/E2E confiável | P | validação de configuração | Segredos inválidos (`SECRETS_ROTATION.md:59`) |
| §16 | "Conclusão Pxxx" por etapa | NI | nenhum registro "Conclusão P0nn" em `docs/` | Registro por etapa |
| §18 | Definição final de pronto (10 critérios) | NI | P0/P1 abertos (ver A.5), sem restore, canário ou aceite | — |

---

## A.3 `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md` — itens próprios (§6–§8)

A matriz §4 é a mesma de A.1 (sem divergências). Itens adicionais:

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| §6 Lote 1 (41, 42) | Erros de parser + `_shared/retry.ts` | C | baseline sem TS1xxx; testes de retry | — |
| §6 Lote 1 (43, 44) | Zerar TS das Edge; gate bloqueante | P | ratchet com 58 diagnósticos | Zerar; tornar estrito |
| §6 Lote 1 (81, 82) | Manter lint/vitest verdes | C | gates em `pr-checks.yml` | — |
| §6 Lote 1 (89) | Orçamentos de desempenho | P | `check-bundle-budget.mjs`, lighthouse | LCP/INP como gate |
| §7.1–2 | Token Management API / DSN RO | P | gateway MCP descrito em IDENTIDADE §1; deploy ainda bloqueado (403, VALIDACAO_ADVERSARIAL) | Credencial de deploy |
| §7.3 | Identidade do self-hosted `10.0.1.132` | NI | nenhuma conclusão registrada | — |
| §7.5–6 | Acesso Lovable; painéis Stripe/Resend/MailerSend/OpenRouter para rotação | NI | `SECRETS_ROTATION.md:128` | — |
| §8 D-01 | Banco acessível ≠ destino | C | IDENTIDADE_BANCO resolve com o gateway | — |
| §8 D-02 | Ledger × arquivos | P | arquivos normalizados (644, sem duplicatas) | Ledger vivo |
| §8 D-03 | Contagens do gitleaks | NI | ausente: não há gitleaks nem config no repo/CI (`npm run security:secrets` é scanner próprio) | Fixar ferramenta |

---

## A.4 `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md` — plano de 50 etapas

**Contagem: C 34 · P 13 · NI 3 · D 0.** A seção "Estado atual" (fases 3–5 "pendentes") está **desatualizada**: boa parte da remediação aconteceu depois, fora do registro.

**Concluídas (34):** 1–25 (descoberta e triagem materializadas em `RELATORIO_FALHAS.md`), 28–30 ("Temas estruturais", "Cobertura e limitações", relatório publicado), 31 (job de build no CI), 32 (`TEST_QUALITY_REPORT.md` reescrito com números medidos), 34 (vitest no CI), 41 (WebAuthn real; papel padrão sem fallback em `usePermissions.ts:36-43`), 42 (`20260718000001_fix_sync_quote_no_status_downgrade.sql`; claim atômico de cadência), 43 (Bitrix `20260718000002_fix_portfolio_settings_rls_credential_leak.sql`; multicanal autenticado `send-multichannel-message/index.ts:9,197`; assinatura Twilio `twilio-call-status/index.ts:3,118`).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 26 | Esforço S/M/L por achado | NI | ausente: 0 ocorrências de "Esforço" em `RELATORIO_FALHAS.md` | — |
| 27 | Lista de quick wins | NI | ausente: 0 ocorrências de "quick win" no relatório (só em AUDITORIA_TECNICA 09-02) | — |
| 33 | Credenciais E2E | P | secrets existem | Inválidas desde ≥09-28 |
| 35 | Rodar Playwright do fluxo crítico | P | `quote-to-sale-e2e.yml` + 23 specs `quote-to-sale-*` | Execução bloqueada pelos secrets |
| 36 | E2E para cada CRÍTICO/ALTO | P | specs RLS/SECURITY DEFINER/quote-to-sale | Cadência, CSV, roleta, prompt |
| 37 | Matriz RLS por papel | P | `supabase/tests/canonical_role_simulation.sql`, `tests/e2e/rls-*.spec.ts` | — |
| 38 | Fuzz das Edge de escrita | P | `_shared/fuzz_test.ts`, `request-id-fuzz_test.ts` | Funções de escrita |
| 39 | Testes de CSV injection | P | só `src/lib/revenueForecast/csvExport.test.ts` | Teste de `sanitizeCsvCell`/runner |
| 40 | `RELATORIO_E2E.md` | NI | ausente: `docs/auditoria/RELATORIO_E2E.md` | — |
| 44 | ALTOS de vazamento | P | ver A.5 (508, 514) | — |
| 45 | XSS e injeção | P | CSV corrigido | Prompt injection e sanitizador de markdown (A.5) |
| 46 | Fim da cobertura ilusória | P | cobertura de todo `src`, audit sem `\|\|true` | E2E ainda pulado |
| 47 | Corrigir MÉDIOS | P | 22 de 59 reverificados corrigidos | — |
| 48 | Regressão verde (typecheck+lint+test+e2e) | P | gates existem | E2E não executa |
| 49 | Revisão de segurança pós-correção | P | `VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md` | Recontagem final |
| 50 | Relatório final + PR | P | vários docs parciais | Consolidado |

---

## A.5 `docs/auditoria/RELATORIO_FALHAS.md` — 129 achados (10 críticos, 32 altos, 87 médio/baixo/info)

**Críticos (10): C 9 · P 1.** **Altos (32): C 15 · P 10 · NI 7.** **Médio/baixo/info: 59 reverificados → C 22 · P 14 · NI 23; 28 não reverificados nesta passada** (os da Frente 6 de hooks/realtime de baixo risco, linhas 47–118 e 249–277, e os de forecast 567/572/587).

**Críticos concluídos (9):** WebAuthn (#1); `tr_sync_quote_to_sale` rebaixando venda (#2: `20260718000001_fix_sync_quote_no_status_downgrade.sql`); tokens Bitrix legíveis (#3: `20260718000002`; os tokens seguem em texto puro em `portfolio_settings`, `bitrix24-oauth/index.ts:160-165`); multicanal sem auth (#4); cadência pausada enviando (#5: `process-cadence-tasks/index.ts:92-95,145-147`); envio duplicado (#6: RPC `claim_pending_cadence_tasks` e `sequence-runner/index.ts:86` `claimDueEnrollment`); CSV no runner (#7: `scheduled-reports-runner/index.ts:27`); CSV nos relatórios (#8: `src/utils/reportDownload.ts:4,75`); relatório de qualidade fabricado (#9: `scripts/generate-quality-report.ts` removido; `TEST_QUALITY_REPORT.md` com números medidos).

**Altos concluídos (15):** papel padrão (L16), XSS do snippet (L70: `CallLibrarySearch.tsx:23`), `actor_id` forjável (L127: `20261001193100_audit_log_canonical.sql:10`), `search_path` (L134: `20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql`), roleta (L222), cobertura de 17 arquivos (L301), `npm audit \|\| true` (L306), job e2e-simulation (L323, removido), push (L399), execute-workflow (L404), enrich-lead (L410), hubs (L415: `customer-success-360/index.ts:17-25`, `pipeline-pulse-aggregator/index.ts:62-77`), Excel (L498: `src/lib/excelExporter.ts:19-25`), export SDR (L503: `activities/exportUtils.ts:7,23`), broadcast (L678).

| Linha/sev. | Achado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| L295 CRÍTICO | E2E quote-to-sale passa verde vazio | P | job valida a configuração e pula com aviso; workflow dedicado `quote-to-sale-e2e.yml` | Secrets inválidos: a suíte não roda |
| L184 ALTO | Itens de fonte divergente; webhook não converte pela RPC | P | `20261001200000_atomic_quote_sync_rpc.sql` | `trg_convert_quote_to_order` mantido (`:22`); total do webhook sem reconciliação |
| L190 ALTO | Três caminhos quote→sale | P | ADR-005; RPC atômica | Trigger legado coexistindo |
| L228 ALTO | Lost-update em reações | NI | `src/hooks/useCompetitiveChat.ts:118-138` ainda faz SELECT→muta→UPDATE do JSON | RPC atômica |
| L311 ALTO | Type safety desligada | P | `tsconfig.app.json:14` `strict: true`; `noUncheckedIndexedAccess: false`; ratchet `tsconfig.strict.json` | Zerar o ratchet |
| L317 ALTO | exhaustive-deps silenciado | P | `eslint.config.js:35` ainda `warn`; 51 disables em `src` | Promover a `error` |
| L421 ALTO | ranking-api sem escopo | P | escopo por `team_id` (`ranking-api/index.ts:87-163`) | Revisão de PUT/score (L706) |
| L508 ALTO | Runner agendado sem filtro de dono | NI | `scheduled-reports-runner/index.ts:37-50`: `admin.from(entity).select(cols).limit(limit)` | Filtrar por `created_by`/RLS |
| L514 ALTO | export-winloss-pdf sem autorização | P | `getUserClient` (`:22`) | Leitura com service client sem filtro de dono |
| L519 ALTO | Mensagem `system` injetada via `conversationHistory` | NI | `sales-assistant-chat/index.ts:55` (só tamanho), `:372-375` repassa `msg.role` | Filtrar papéis para user/assistant |
| L525 ALTO | Prompt injection de 2ª ordem | NI | `sales-assistant-chat/index.ts:56` só limita tamanho | Delimitar e sanitizar dados |
| L531 ALTO | Orquestrador executa saída da IA | P | `auto_execute = false` por padrão (`ai-agent-orchestrator/index.ts:177-181`) | Validar tool calls |
| L537 ALTO | "Neural Insights" fabricados | NI | `src/hooks/bi/useABCAnalysis.ts:122-135` ("Simulated Neural Insights", "cresceu 14%") | Remover ou rotular |
| L612 ALTO | Listagens sem filtro de owner | P | depende de RLS | Filtros explícitos |
| L618 ALTO | Sem opt-out antes de enviar | P | e-mail usa `_shared/unsubscribe.ts` (bulk-send, retry, transactional) | WhatsApp/cadências sem checagem; `consent_records` (`20261001150100`) sem uso no envio |
| L666 ALTO | Power-ups auto-concedidos | NI | policies `insert_own_powerups`/`update_own_powerups` (`20260418104126:72-74`) nunca removidas | Restringir |
| L672 ALTO | process-race-event sem idempotência/dono | P | `getUserClient` (`:22`) | Dono e dedupe |
| L684 ALTO | Comissão ignora faixa/categoria | NI | `private.handle_sale_commissions` (`20260619145322:138-197`, `ORDER BY priority DESC LIMIT 1` em `:177`) inalterada | Corrigir regra |
| L35 MÉDIO | Cache de permissões entre usuários | NI | `usePermissions.ts:20` `queryKey: ['user-permissions']` | Incluir o user id |
| L41 MÉDIO | Tokens em localStorage | NI | `client.ts:11` (aceito em ADR-009) | — |
| L62 INFO | Mensagem de senha inconsistente | NI | `ResetPassword.tsx:20` (min 8) × `:122` ("6 caracteres") | — |
| L78 MÉDIO | Sanitizador de markdown contornável | NI | `briefingHelpers.ts:87-88` (regex `<[^>]*>`) + `BriefingNarrative.tsx:17` com `dangerouslySetInnerHTML` | DOMPurify/escape |
| L84/L90 MÉDIO | Modais sem foco/Escape/ARIA | NI | 0 ocorrências em `SlideOverPanel.tsx` e `level-up-celebration.tsx` | — |
| L95 MÉDIO | ErrorBoundary único | P | 3 boundaries em `AppRoutes.tsx` | Por rota |
| L141 MÉDIO | Desempenho nominal para anon | P | MV sem anon | `race_spectator_view` com anon |
| L202 MÉDIO | Retry trata constraint errada | NI | `fn_convert_quote_to_sale` inalterada desde `20260710142606:115` | — |
| L207 MÉDIO | Webhook confia no `total` | NI | `receive-quote-webhook/index.ts:205-206` repassa `quote.total` | Reconciliar com itens |
| L234 MÉDIO | Interval sem cleanup (Bitrix) | P | `useBitrix24.ts:112-121` | Cleanup no unmount |
| L244 MÉDIO | Canais realtime com nome estático | NI | `useRankNotifications.ts:49`, `admin/useV4Callbacks.ts:31`, `useKudos.ts:60` | — |
| L368 BAIXO | pre-commit sem tipos/testes | NI | `.husky/pre-commit` = `npx lint-staged` | — |
| L432 MÉDIO | Webhooks sem assinatura | P | Twilio e multichannel verificam | Conferir `inbound-email-webhook` |
| L443 MÉDIO | external-db-bridge sem escopo | P | allowlist de tabelas (`:81-82`) | Escopo por usuário; vaza `err.message` (`:317,337`) |
| L454 MÉDIO | report-embed `select *` | NI | `report-embed-public/index.ts:191-193` (padrão `"*"`) e `:120` | — |
| L459 MÉDIO | CORS `*` padrão | P | ver A.2#67 | `ALLOWED_ORIGINS` |
| L465 BAIXO | Rate limit por isolate | NI | `_shared/rate-limit.ts:2,10` (memória) | Limitador persistente |
| L470 BAIXO | IA sem rate limit | P | `enforceRateLimit` em 59 functions | Restantes |
| L474 BAIXO | Vazamento de erro interno | P | `request-id.ts:111` genérico | `external-db-bridge:317,337` |
| L543 MÉDIO | Injeção via `context.page/extra` | NI | `ai-copilot/index.ts:192-202` | — |
| L553/L558 MÉDIO | Loop de 500 chamadas de IA; gateway sem timeout | P | `analyze-win-loss` usa `fetchWithTimeout`; `_shared/ai-gateway.ts` só define a URL | Timeout/breaker central |
| L562 MÉDIO | `group_by` quebrado | NI | `report-builder-execute/index.ts:235-246` só `_count`; demais colunas vêm da 1ª linha | Agregação real |
| L577 MÉDIO | useClientBI com mock | P | RPCs reais | `confidence: 90` fixo (`:54`) |
| L624 MÉDIO | Sem paginação | P | ver A.1#71 | — |
| L630 MÉDIO | Timezone de cadência | P | backend `toBusinessDate` | Front com data local (`useProspectCadenceMutations.ts:19`) |
| L640 BAIXO | `createClient` com `user_id` arbitrário | NI | `src/services/clientService.ts:95` | — |
| L645 BAIXO | `maybeSingle()` sem filtro | NI | `useFollowUpData.ts:14-17` | — |
| L650 INFO | `CREATE POLICY IF NOT EXISTS` | NI | `20260530000002_enable_rls_and_remove_env_risk.sql` | — |
| L690/L695/L733 | Comissões sobrepostas, duplicadas e SDR em dobro | NI | mesma função de L684 | — |
| L706 MÉDIO | ranking-api edita score fora do time | P | escopo parcial | — |
| L722 MÉDIO | PDFs de orçamento públicos | NI | `receive-quote-webhook/index.ts:253` `getPublicUrl`; `20260831130002:20-23` só limite/MIME | Bucket privado + URL assinada |
| L728 BAIXO | Dupla coleta de power-up | NI | `collect-race-powerup/index.ts:109-112` faz update sem condição `used_at IS NULL` | — |
| L738 BAIXO | XP inserido pelo cliente | NI | `useSalespersonXP.ts:297-308` | RPC |

Médio/baixo/info **concluídos (22):** L29 (rate limit de login no servidor: `useLoginRateLimiter.ts:28,64-67`), L57+L338 (`.env.example:14`), L147 (`20260513191625`), L196 (`useQuotes.ts` via RPC), L213 (`quote-to-sale-won-path.spec.ts:50,82`), L333, L343, L348 (`deno.json:3`), L353, L358, L364, L372 (arquivos removidos), L427, L438, L448/L717 (`_shared/oauth-state.ts`), L582 (contrato compartilhado em `severityFromScore.ts`), L635 (`20261001213000_status_transitions_state_machine.sql`), L700, L712, L743 (`useCommissions.ts:93-95`).

---

## A.6 `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md` — top 10 por ROI e roadmap de 3 ondas

**Top 10: C 4 · P 5 · NI 1 · D 0.** Concluídos: branch protection (ruleset `main-protection` ativo com `pull_request` + check obrigatório "CI Gate", via `gh api …/rulesets`), assinatura Twilio (`twilio-call-status/index.ts:3,118`; `twilio-call-twiml/index.ts:3,10`; ambos em `config.toml`), `err.message` 500 (`_shared/request-id.ts:111`) e RLS nas 8 tabelas (`20260902221500`).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| T1 (P0) | Repo privado, sem template, seed sem PII | P | `gh api repos/adm01-debug/Promo_Champions_V2.1` → `"private": false, "visibility": "public"`, `is_template: false`; `scripts/seed-real-people.ts` contém 8 e-mails `@promobrindes.com.br` | **Tornar privado** e anonimizar o seed |
| T6 (P1) | Rotacionar anon keys e limpar `cron.job` | NI | `SECRETS_ROTATION.md:128`; 5 JWTs anon seguem em migrations históricas (ex.: `20260512214007_*`, `20260726202421_*`) | Rotação. A centralização em `20261001160000` remove literais futuros |
| T7 (P1) | Auditoria viva das policies USING(true) | P | 5 placeholders removidos | Query viva + lista de exceções |
| T8 (P1) | Allowlist de CORS | P | codemod em 149/172 | `ALLOWED_ORIGINS` não aparece em `SECRETS_ROTATION.md` nem em `.env.example` |
| T9 (P2) | Paginação + PDF fora do entry | P | 17 `.range(` | `useInfiniteQuery` em só 2 lugares |
| T10 (P2) | Zod nas 10 functions críticas + cobertura real | P | E.164 em `twilio-click-to-call/index.ts:20-28`; cobertura de todo `src` | `ranking-api`, `email-bulk-send`, `sequence-enroll` sem schema; `scripts/input-validation-lint-allowlist.txt` com 133 linhas |
| Onda Quick Wins | Apagar artefatos fabricados/mortos; lockfile único | C | `quality-gate.sh`, `.eslintrc.json`, `migrate-helper/`, `deployed.txt`/`local.txt`, `remove-demos*` ausentes | — |
| Sprint 1 | `security:secrets` + `deno lint` no CI; notificação de falha; MFA no login; rate limit em ranking/twilio | P | `pr-checks.yml:101-102,270`; `enforceRateLimit` (`ranking-api:5`, `twilio-click-to-call:9`); MFA nativo em `useAuthForm.ts` | `SLACK_CI_WEBHOOK_URL` não criado (`SECRETS_ROTATION.md:63`) |
| Sprint 2 | React 19, vitest 3; dedupe; audit triggers; `callAI`; drop de 8 procedures órfãs; Sentry | P | vitest `^5.0.3`, `@testing-library/react ^16.3.3`, Sentry lazy (`errorTracking.ts:37-46`), `audit_log_row_change` (`20261001193100`) | React segue `^18.3.1`; sem wrapper `callAI` com retry/breaker; procedures não removidas |
| Backlog | Camada de dados, `as unknown as`, SLOs, pen test, procedimento de incidente | P | `ADR-010-service-layer.md`, `docs/HOTFIX.md`, `20261002000100_slo_burn_rate.sql` | 165 `as unknown as` em `src`; pen test ausente |
| Pendências vivas 1–7 | Queries de verificação no banco vivo | NI (exceto #4) | #4 (search_path) coberto por asserção em `20260902221500` | Executar e registrar #1–3 e #5–7 |

---

## A.7 `docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md`

**C 7 · P 3 · NI 1 · D 0.** Concluídos: as 5 correções declaradas (`20260902120000_revoke_anon_truncate_and_fix_battle_score.sql`; `TEST_QUALITY_REPORT.md`; `src/lib/validators/brDocuments.ts` ligado em `Fornecedores.tsx:28,36`; `SECURITY.md:20`) e 2 das pendências: validação de transição de stage (`20261001213000_status_transitions_state_machine.sql`) e WebAuthn real (ADR-010).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| Pend. 1 | CORS wildcard / `ALLOWED_ORIGINS` | P | codemod feito | Configurar a env |
| Pend. 2 | Deploy de Edge bloqueado (403) | NI | `deploy.yml:19-21` exige `SUPABASE_ACCESS_TOKEN`; não há evidência de publicação | Credencial e publicação |
| Pend. 3 | `20260831130003` (campaign-health) | P | substituída por `20261001160000_centralize_internal_edge_calls.sql` | Depende de `_internal_secrets.functions_base_url`, chave que o `CLAUDE.md` §1 afirma **não existir** no banco: provável falha silenciosa |
| Pend. 4 | Consolidar ~31 triggers de `sales` | P | 5 triggers recriados em `20261001220100` | Consolidação |

---

## A.8 `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md` §8 — itens "não executados no banco/runtime"

**C 0 · P 2 · NI 6.**

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 1 | Revogar default grants de `supabase_admin` | NI | ausente: nenhuma migration com `FOR ROLE supabase_admin` | Migration |
| 2 | 15/204 grants de execução de RPC | P | `20261001203300_deny_dead_tables_revoke_anon_grants.sql` | Revisão completa |
| 3 | 8 funções do Advisor | P | 26 migrations com `SET search_path` depois de 09-10 | Confirmar no Advisor |
| 4 | Exposição de materialized view | NI | nenhum REVOKE de MV depois de 09-10 | — |
| 5 | Proteção contra senha vazada | NI | sem evidência (config de painel) | — |
| 6 | 6 índices duplicados | NI | nenhum DROP INDEX depois de 07/2026 | — |
| 7 | Aplicar/reparar ledger | NI | IDENTIDADE §3: `20260903000002` "nunca foi aplicada" | — |
| 8 | Publicar 71 Edge Functions | NI | sem evidência; CLAUDE.md §4: limite de 100 deployadas para 172 | Escolher quais publicar |

---

## A.9 `docs/execucao/HARDENING_CANONICO_2026-08-31.md`, `ROLLBACK_HARDENING_CANONICO_2026-08-31.md`, `RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md`

**C 5 · P 4 · NI 5 · D 0.** Concluídos: as 8 migrations do lote existem (`20260827000001`, `20260830000000/01/02`, `20260831130000/01/02/03`); simulador e asserções (`scripts/db/simulate-migrations-via-mcp.ts`, `supabase/tests/canonical_post_migration_assertions.sql`, `canonical_role_simulation.sql`); runbook de rollback documentado; critério "PR mergeado" (#82/#69); a reconciliação do GitHub (§7) refletida no repo.

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 10/10 #2 | Migrations aplicadas no ledger | P | o doc afirma 7 MD5 iguais (não reproduzível sem acesso) | `20260903000002` não aplicada (IDENTIDADE §3) |
| 10/10 #3 | Edge Functions publicadas | NI | 85×404 em 08-31; deploy bloqueado | — |
| 10/10 #4 | Zero 404/500 nos jobs ativos | NI | os 10 jobs HTTP não foram restaurados (`20260913150000_restore_sql_maintenance_crons.sql:16-18`) | Reagendar com o ref correto |
| 10/10 #5 | Zero falha SQL de cron em 24h | NI | HARDENING:163-168 registrou falha `digest`; IDENTIDADE §3: `cron.job` vazio em 09-13 | Observação registrada |
| 10/10 #6 | Smoke por role no ambiente vivo | P | `canonical_role_simulation.sql` | Execução recorrente |
| 10/10 #7 | Tráfego real sem regressão | NI | ESTADO_ATUAL: base de demonstração | — |
| Reconc. §8 (9 passos) | Identidade → catálogo → diff → SQL → autorização → staging → testes → aplicação | P | passos 1–5 e 9 declarados no HARDENING | Passo 7 (staging) inexistente (`docs/STAGING.md:3`) |
| Hardening §Jobs | 42 pares de índices duplicados | NI | mantidos de propósito | Parecer nominal |
| Hardening §Jobs | UPDATE lento de `sales` (388 ms, triggers/RLS) | P | — | Profiling dos triggers |

---

## A.10 Documentos de onda e contrato de 26–27/08 (`EXECUCAO_ONDA_0`, `SIMULACAO_CENARIOS_ONDA_0`, `VALIDACAO_EXAUSTIVA_ONDA_0/1`, `CONTENCAO_INTEGRIDADE_WEBHOOKS`, `CONTRATO_ROTEAMENTO_LEADS`, `RECONCILIACAO_MIGRATIONS`, `MATRIZ_FORENSE…`, `CATALOGO_BANCO_ORIGEM`, `CANDIDATOS_DE_LIMPEZA`)

**C 13 · P 9 · NI 16 · D 0.** Concluídos: os 5 itens de `CANDIDATOS_DE_LIMPEZA` (`deno.lock` versionado; `supabase/.temp/cli-latest` fora do Git; `supabase/functions/graphify-out` removido; `bun.lockb` removido; `graphify-out/` com política em `.gitignore:54-67`); dedupe persistente de inbound (`20260827000001:3-4`, `uq_inbound_reply_events_provider_message_id`); dedupe de alerta de campanha (`:12`); policy de UPDATE de `client_portfolio` removida (`:18`); `campaign-health-alert` valida antes de inserir (`index.ts:260-272`); prova de identidade do banco (MATRIZ gate 1; RECONC_MIGRATIONS 1); WebAuthn real (ONDA_0 próximo #6); migrate-helper/WebAuthn não publicáveis (SIMULAÇÃO barreira 2); decisão sobre arquivos históricos inválidos (RECONC_MIGRATIONS 6, via `MIGRATION_RENAME_MAP`).

| Fonte / ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| ONDA_0 bloq. 1 / MATRIZ gate 2 / RECONC 2–3 | Catálogo RO e manifests dos dois ambientes | P | gateway MCP | Manifests versionados |
| ONDA_0 bloq. 2 | Aplicar migrations e credencial de cron | P | lote 08-31 | Crons HTTP não restaurados |
| ONDA_0 bloq. 3 / ROTEAMENTO | Regra para carteira `inactive` após reatribuição | NI | decisão ausente | — |
| ONDA_0 bloq. 4 / CONTENÇÃO | Idempotência de envio e exactly-once | P | inbound único | `outbound_messages.provider_message_id` sem UNIQUE; sem RPC transacional |
| ONDA_0 bloq. 5 | Coluna de e-mail em `leads` | NI | tabela `leads` ausente de types e migrations | — |
| ONDA_0 bloq. 6 / SIMUL. 1 | Rotação e expurgo do histórico | NI | `SECRETS_ROTATION.md:128` | — |
| ONDA_0 bloq. 7 / SIMUL. 7 | Remover a sonda `__probe__` | NI | sem registro | — |
| ONDA_0 bloq. 8 / SIMUL. 8 | Claim persistente no `email-bulk-retry` | NI | `email-bulk-retry/index.ts:100-134` (SELECT `sent_at IS NULL` → UPDATE, sem claim) | RPC de claim |
| ONDA_0 bloq. 9 / SIMUL. 9 | Efeito de domínio da roleta | NI | `spin_prize_wheel` grava "+50 XP"/"Badge" em `prize_wheel_spins` (`20260830000001:137-145`) **sem** conceder XP/badge | Conceder ou não anunciar |
| ONDA_0 bloq. 10 | `ALLOWED_ORIGINS` | NI | ver A.6 T8 | — |
| SIMUL. 3 | Roleta validada em staging com concorrência | P | PG17 efêmero local | Staging |
| SIMUL. 6 / ONDA_1 #4 / ONDA_0 #4 | Replay sem duplicatas | P | sem duplicatas no diretório | Replay em banco limpo |
| ONDA_0 #1 / ONDA_1 #1 | a11y do login e tela branca do preview | P | a11y sweep | Sem registro de correção do preview |
| ONDA_0 #5 / ONDA_1 #5 | Testes de concorrência/RLS (roleta, roteamento, portfólio, inbound) | P | unitários com mock (`useLeadRouting.test.tsx`) | Integração real |
| ROTEAMENTO | Regra "Top Performer Premium" sem `filter_min_value` | NI | dado de configuração | — |
| ROTEAMENTO | `filter_state`/`filter_role` sem mapeamento | NI | — | — |
| ROTEAMENTO | Quick action `route-pending-leads` → `smart-lead-router` | NI | `src/hooks/pipeline-pulse/useQuickAction.ts:21` aponta para function inexistente | Implementar ou remover |
| ROTEAMENTO | `weighted`/`territory` sem RPC | NI | `useLeadAssignment.ts` só prévia | — |
| ROTEAMENTO | Unicidade de `lead_assignments.sale_id` | NI | nenhum UNIQUE em migrations | — |
| ROTEAMENTO | Policy de INSERT em `lead_routing_log` | NI | não alterada | — |
| ROTEAMENTO | Agendamento de `auto-reassign-inactive` | NI | nenhum `cron.schedule` no repo; só comentário em `20260830000002:197` | Job |
| MATRIZ gate 3 | ADR de topologia | P | IDENTIDADE | ADR |
| MATRIZ gate 4 | P0/P1 por migrations aditivas em staging | P | aditivas sim | Staging não existe |
| MATRIZ gate 5 / RECONC 4–5 | Matriz origem×destino×repo; baseline aditiva | NI | — | — |
| CATALOGO_BANCO_ORIGEM | Reconciliação com a origem | NI | origem rebaixada a "projeto antigo" (IDENTIDADE) | Declarar o encerramento |

---

## A.11 `docs/execucao/MIGRATION_RENAME_MAP.md`

**C 3 · NI 6.** Concluídos: §1 renomeações (ex.: `supabase/migrations/20250102000001_audit_log.sql`), §2 remoções e §3 testes movidos para `tests/migrations/` (3 arquivos).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| §4–§8 (passos 1–5) | Reconciliar `schema_migrations` em produção (versões de 8 dígitos, com letras, removidas e duplicadas) | NI ×5 | não há registro de execução; `migrations-drift.yml` só avisa sem token | Executar **antes** do próximo `db push` |
| §9 | Verificação pós-reconciliação | NI | idem | — |

---

## A.12 `docs/estado/15_PLANO_COBERTURA_MODULOS.md`

**C 5 · P 2 · NI 0 · D 1.** Concluídos: escada travada no estado atual (`coverage-ladder-baseline.json` + `pr-checks.yml:238`); meta `markupHelpers` ≥80% (100%); meta `hooks/reports` ≥50% (82,7%); dívida "services ≥18,7%" (20,65%); queda de piso proibida (`check-coverage-ladder.mjs`).

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| Tabela "Módulos cobertos" | `src/lib/schemas/` com piso de 90% | D | o doc lista o módulo, mas `src/lib/schemas/` **não existe** (removido no PR #209, conforme o próprio histórico do doc); `LADDER_MODULES` ainda o declara (`scripts/update-coverage-baseline.mjs:26`) | Tirar da tabela e da lista |
| Meta services 40%→60% | `src/services/` | P | 20,65% | `knownDeviceService.ts` e `clientService.ts` sem teste |
| Dívida useMonthlySalesBenchmark | Cobrir o hook | P | sem arquivo de teste (`src/hooks/reports/useMonthlySalesBenchmark.ts`) | Teste |

---

## A.13 `docs/auditoria_enterprise_v5.md`

**C 17 · P 3 · NI 5 · D 2.** Das 16 funcionalidades "implementadas", 15 têm o código citado presente (ressalvas: `useAuditLogs` está em `src/hooks/admin/`; a Race Arena roteada é `RaceArenaHub` (`lazyPages.ts:224`), não o `pages/RaceArena.tsx` citado, que não é roteado). Circuit breaker existe (`_shared/circuit-breaker.ts`) e o ranking usa MV.

| ID | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 2.2 "Conversational Intelligence implementada" | Transcrição/sentimento | D | `useTranscribeRecording` só é usado por `TranscribeButton`, que só é importado por `src/pages/ConversationalIntelligence.tsx`; essa página **não é roteada** (a rota usa `ConversationalIntelligenceHub`, `lazyPages.ts:73-75`) | Rotear o fluxo |
| 4 Mitigação "MFA obrigatório" | — | D | MFA nativo opcional (`useAuthForm.ts`; `20261001203500_mfa_native_migration_flag.sql`); `totp_secret` em texto puro ainda não removido | Obrigatoriedade |
| 1 Riscos | `any` em metadados; locks/filas | P | 165 `as unknown as` | — |
| 3 Backlog | ROI de IA | P | `src/pages/ROIDashboard.tsx` genérico | Métrica de valor da IA |
| 3 Backlog | Offline sync PWA | P | só shell offline (`vite.config.ts:17-30`) | Fila offline de atividades |
| 3 Backlog | Branding multi-tenant | NI | ausente | — |
| 5 Checklist | Rotinas semanal/mensal/trimestral/tempo real | NI ×4 | sem registro de execução (inclusive teste de PITR) | — |

---

## A.14 `docs/planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md` + `docs/graphify/*`

**Contagem: C 17 · P 19 · NI 13 · D 1.** Concluídas: 01 (`docs/graphify/BASELINE_AST_SRC_2026-09-11.md`), 02, 06 (`tools/graphify/pyproject.toml`+`uv.lock`, `uv sync --locked` no CI), 07 (`scripts/graphify/extract-code-only.mjs`), 08 (`.graphifyignore`), 09 (`snapshot.json` com commit/digest, lotes B/D/F), 11, 14 (`static-contracts.mjs`), 16 (`multigraph.mjs`), 17, 18 (staging/promoção atômica), 26 (`docs-index.mjs`), 31 (`npm run graphify:*`), 33 (`.claude/CLAUDE.md`), 36 (`.github/workflows/graphify.yml`, sem segredos), 41 (cenários hostis dos lotes B/F), 45.

| Etapa | Item planejado | Estado | Evidência | O que falta |
|---|---|---|---|---|
| 03 | Perguntas de negócio e métricas | NI | ausente em `docs/graphify/` | Conjunto de avaliação |
| 04 | Decisão local-first | P | plano e README | ADR em `docs/decisions/` |
| 05 | Modelo de ameaças | P | controles nos lotes A/F | Documento formal |
| 10 | Corpus sintético de referência | P | fixtures dentro dos `*.test.mjs` | `tests/graphify/` previsto não existe |
| 12 | Aliases e imports lazy | P | 5.595 endpoints de import não materializados (`BASELINE_AST…` §Achados 2) | Resolução |
| 13 | Edge Functions e deps Deno | P | contratos estáticos | Extração dedicada |
| 15 | Ligar front/Edge/RPC/entidades | P | chamadas literais | Dinâmicas como lacuna |
| 19 | Cache e atualização incremental | NI | bloqueado (lote D: `graphify update` grava cache na origem) | — |
| 20 | Cobertura e escala por domínio | P | CI só em `src/lib/revenueForecast` | Demais domínios |
| 21 | Identidade/acesso RO ao banco | NI | README: "O coletor do catálogo canônico não está habilitado" | — |
| 22–24 | Coletar estrutura, segurança, storage e automações | P ×3 | adaptador testado com fixture (lote C) | Coleta real |
| 25 | Comparar código×migrations×catálogo | P | `reconcile-catalog.mjs` (recusa catálogo não atestado) | Catálogo atestado |
| 27 | Avaliar enriquecimento semântico | NI | — | — |
| 28 | Matriz de funcionalidades e ligações | NI | — | — |
| 29 | Priorizar achados | NI | — | — |
| 30 | Relatório coerente e auditável | P | `graphify-out/GRAPH_REPORT.md` diz "Built from commit `a133634e`", commit inexistente no histórico de `main` (HEAD `6f6b94a`) | Relatório amarrado a um SHA real |
| 32 | Impacto por diff | P | `impact-report.mjs:36` só aceita `--changed <id>` | Entrada por diff Git |
| 34 | Avaliar MCP local e coexistência com Husky | D | o README proíbe "hook automático", mas `.husky/post-commit` e `.husky/post-checkout` foram instalados por `graphify hook install` (commit `5d19dc5`, PR #221) sem avaliação documentada | Decisão e teste de coexistência |
| 35 | Visualização privada | NI | `graph.html` ignorado; nenhuma alternativa | — |
| 37 | Proteger caches/artefatos e retenção | P | workflow não publica artefato | Política de retenção |
| 38 | Atualizar após merge e detectar obsolescência | P | hook auto-rebuild + "auto-sync N8N" (CLAUDE.md) | Relatório versionado aponta SHA inexistente |
| 39 | Calibrar alertas | NI | — | — |
| 40 | Manutenção de dependências | P | `.github/dependabot.yml` só cobre npm e github-actions | Ecossistema pip/uv de `tools/graphify` |
| 42 | Adaptador de catálogo em banco descartável | P | fixture JSON, não banco real | — |
| 43 | Recuperação, concorrência, equivalência | NI | — | — |
| 44 | Qualidade das respostas e benefício | NI | — | — |
| 46 | Piloto em revisão real | NI | — | — |
| 47 | Expandir domínios e registrar bloqueios | P | bloqueios registrados no README | Expansão |
| 48 | Runbook, incidentes e rollback | P | README §Limites | Rollback |
| 49 | Handoff e treinamento | NI | — | — |
| 50 | Auditar as 50 etapas | NI | o plano segue sem tabela de status por etapa | — |

`docs/graphify/EXECUCAO_LOTE_A…F` e `README.md`: as entregas declaradas conferem com os arquivos de `scripts/graphify/` e `tools/graphify/` (nenhuma D). "Próximos gates" de `BASELINE_AST_SRC`: adaptador multigrafo **C**; migrations em lote separado **C** (`static-contracts.mjs`); ligação com o catálogo canônico **NI**.

---
