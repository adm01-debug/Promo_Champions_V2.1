# Anexo B — Funcionalidades prometidas × código (docs de funcionalidades, gaps e débito)

Escopo lido: FUNCIONALIDADES_COMPLETAS, FUNCIONALIDADES_SEM_UI, FUNCIONALIDADES_SISTEMA, FEATURE_SUMMARY, GAPS_CLASSE_MUNDIAL, TECH_DEBT, TYPE_DEBT, DEAD_TABLES, DOCUMENTACAO_SISTEMA, REPORTING_BI_COMPLETE, TELEMETRY_MODULE_DOCS, benchmark/RAMPER_2026-07, reports/*, README, CHANGELOG, RELEASE_NOTES, AGENTS, CLAUDE.md §3-5 (com notas de §1/§2/§6 quando afetam a verificação), decisions/ADR-001..010, LGPD, DATA_RETENTION, accessibility-checklist, soft-delete, DESIGN_SYSTEM.

Método: grep e leitura de trechos em `src/`, `supabase/functions/`, `supabase/migrations/`, `tests/`, `scripts/`. Sem acesso ao banco: contagem de linhas, crons criados fora de migration e estado de deploy **não foram verificados**. "Sem cron" significa "nenhuma migration agenda". Os 25 jobs versionados são: auto-task-queue-hourly, campaign-health-alert-30min, check-v4-callback-alerts-every-5min, cleanup-stale-logs-daily, cleanup-webhook-dedupe, cron-failure-alerter-10min, data-retention-purge-daily, deal-risk-digest-daily, detect-client-churn-alerts-hourly, edge-retry-threshold-alert-15min, email-bulk-retry-15min, enforce-telemetry-retention-daily, gc-call-recording-ingest-jobs, notify-v4-quote-status-every-5min, process-call-recording-ingest-1min, purge-telemetry-retention-daily, refresh-views, reindex-tables, reset-pg-stat-statements-weekly, wal-health-alert-5min, webvitals-regression-alert-daily, weekly-league-reset, weekly-matchmaking, winloss-webhook-health-monitor-15min.

Os itens que verifiquei como completos não aparecem nas tabelas; só entram na contagem final.

**Achado transversal sobre CLAUDE.md §4:** as **172** edge functions citadas existem todas em `supabase/functions/`, sem nenhuma ausente. O problema é outro: várias delas **não têm chamador** (nem no `src`, nem em cron, nem em outra function). Estão marcadas como DIVERGENTE nos domínios.

---

## 1. CRM

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Mapa interativo de territórios com polígonos | FUNCIONALIDADES_SEM_UI.md:66,159 | PARCIAL | `/territorios` → `src/pages/Territorios.tsx:2` usa `TerritoriesBoard.tsx`; não usa Leaflet/Polygon (grep `polygon|MapContainer` em `components/territories` = 0) | Editor de polígonos no mapa |
| Transferência de leads em massa com preview de carga | FUNCIONALIDADES_SEM_UI.md:64 | PARCIAL | `useLeadAssignment` só é usado em `components/lead-routing/CapacityDashboard.tsx` | Modal de transferência em massa |
| Gerenciador de filtros salvos (renomear/excluir/compartilhar) | FUNCIONALIDADES_SEM_UI.md:67 | PARCIAL | `SavedFiltersBar` em `pages/Vendas.tsx` e `QuoteCadenceFilters.tsx`, sem tela de gestão | Tela de gestão e compartilhamento |
| Editor de campos customizados por vendedor | FUNCIONALIDADES_SEM_UI.md:68,161 | PARCIAL | Só existe leitura: `salespeople/CustomFieldsDisplay.tsx` (em `VendedorHeader.tsx`) | Editor visual no admin |
| Tour de onboarding interativo | FUNCIONALIDADES_SEM_UI.md:69 | PARCIAL | `onboarding/OnboardingChecklist.tsx` em `pages/Index.tsx`; é um checklist estático, sem tour | Tour passo a passo |
| Lixeira (restaurar/purgar soft delete) | soft-delete.md:114-115 | PARCIAL | `restore_deleted_record`, `hard_delete_record` e `cleanup_deleted_records` têm 0 usos em `src` e functions. O soft delete em si está aplicado (`useQuotes.ts:266`, `tasks/useTaskQueries.ts:29`) | UI admin de lixeira |
| ABM: hierarquia, whitespace e campanhas ABM | GAPS_CLASSE_MUNDIAL.md:77-82 | PARCIAL | `hooks/abm/useAccounts.ts:15` (`parent_account_id`), `:70` (`account_plans`), `/abm`. Não há análise de whitespace nem campanha ABM | Whitespace/cross-sell por conta; campanhas |
| @mentions em deals/clientes com notificação | GAPS_CLASSE_MUNDIAL.md:137 | PARCIAL | `collaboration/MentionInput.tsx` existe com **0 consumidores** | Plugar no detalhe de deal/cliente e notificar |
| Comentários em thread, deal rooms, vídeo, documentos colaborativos | GAPS_CLASSE_MUNDIAL.md:138-143 | NÃO INICIADO | ausente: procurei `parent_comment_id|ThreadedComment|deal.?room|loom|vidyard` e não achei nada | Tudo |
| Co-selling com split de comissão | GAPS_CLASSE_MUNDIAL.md:141 | NÃO INICIADO | ausente: procurei `co.?selling|commission_split|deal_split` e não achei nada | Múltiplos donos e split |
| Custom objects, validation rules, custom apps, app builder | GAPS_CLASSE_MUNDIAL.md:147-152 | NÃO INICIADO | ausente: procurei `custom_objects|validation_rules` e não achei nada | Tudo |
| Layouts de página por perfil | GAPS_CLASSE_MUNDIAL.md:146 | PARCIAL | Só o `/dashboard-custom` e o layout do win-loss por usuário (`hooks/win-loss/useUserDashboardLayout.ts`) | Layout de registro por perfil |
| Histórico de campos | GAPS_CLASSE_MUNDIAL.md:158 | PARCIAL | `entity_versions` é escrita por trigger e não tem leitor (DEAD_TABLES.md:55) | UI de histórico por campo |
| Segurança por campo (FLS) | GAPS_CLASSE_MUNDIAL.md:159 | PARCIAL | Só a máscara de custo na view `sales_with_markup` | FLS genérica |
| Dashboard de qualidade de dados | GAPS_CLASSE_MUNDIAL.md:157 | NÃO INICIADO | ausente: procurei `data.?quality` (só aparece em `competitive/ImprovementPlan.tsx`, outro contexto) | Dashboard |
| CPQ / motor de regras de preço | GAPS_CLASSE_MUNDIAL.md:104-105 | NÃO INICIADO | `pricing_rules` e `price_protection_rules` não têm produtor nem leitor (DEAD_TABLES.md:34-35) | Motor de regras |
| CLM, faturamento, reconhecimento de receita, MRR/ARR | GAPS_CLASSE_MUNDIAL.md:107-111 | NÃO INICIADO | ausente: procurei `stripe|recurly|contract_lifecycle|subscription_` e não achei integração | Tudo |
| Multi-moeda com FX | GAPS_CLASSE_MUNDIAL.md:109,161 | NÃO INICIADO | ausente: procurei `exchange_rate|fx_rate|multi_currency` (só aparece em `src/test/factories.ts`) | Tudo |
| Multi-fuso horário | GAPS_CLASSE_MUNDIAL.md:162 | PARCIAL | `timezone` só na configuração de cadência (`sales/cadence/CadenceAlertConfig.tsx`) | Fuso por usuário/conta |
| i18n | GAPS_CLASSE_MUNDIAL.md:160; FEATURE_SUMMARY.md:79 | NÃO INICIADO | Nenhum framework (`i18next|react-intl|lingui` = 0) | Framework e extração de strings |
| App nativo, offline robusto, scanner de cartão, notas de voz, check-in geo, rotas | GAPS_CLASSE_MUNDIAL.md:114-120 | NÃO INICIADO | Só PWA (`vite.config.ts:12` VitePWA); `navigator.geolocation`, `MediaRecorder` e OCR = 0 | Tudo |
| Push mobile com deep link | GAPS_CLASSE_MUNDIAL.md:121 | PARCIAL | `public/sw.js:34` trata `notificationclick`. Mas `send-push-notification` só é chamada por `new-device-alert`, que não tem chamador | Disparar push em eventos de negócio |
| Rotas citadas no mapa de funcionalidades | FUNCIONALIDADES_COMPLETAS.md:70,84,128,162,226,252,273,282-298,321,459,514,518,539,582 | DIVERGENTE | 19 rotas não existem em `AppRoutes.tsx` (ex.: `/smart-search`, `/client-health`, `/approval-workflows`, `/forecast-ponderado`, `/security`). Não há redirects: o único `Navigate` está em `AppRoutes.tsx:275` | Atualizar o doc ou criar redirects |
| Contagens dos docs (88 páginas, 35 functions, 150+ tabelas) | FUNCIONALIDADES_COMPLETAS.md:12-15,709; GAPS_CLASSE_MUNDIAL.md:282 | DIVERGENTE | Real: 175 `path=` em `AppRoutes.tsx`, 172 functions, 397 tabelas (DEAD_TABLES.md:4) | Regenerar os docs |

## 2. SDR / Cadências / E-mail

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Motor de sequências agendado | RAMPER_2026-07.md:49; CLAUDE.md:69,103 | DIVERGENTE | `sequence-runner` não está em nenhuma migration. Só roda pelo botão em `SequencesPage` (`hooks/sequences/useEnrollContacts.ts`) | Cron versionado |
| Smoke test E2E do motor (W1.1) | RAMPER_2026-07.md:22,60,162,190 | NÃO INICIADO | Nenhum teste em `tests/` cita `sequence-runner|sequence_enrollments|SequenceBuilder`. O uso em produção (0 linhas) não foi verificado | Sequência → inscrição → runner → `outbound_messages` |
| Pixel de abertura e rastreio de clique | RAMPER_2026-07.md:19,66-67,163,196 | NÃO INICIADO | `email_tracking_events` não tem nenhum INSERT em `src` nem em functions; só leitores (`email-engagement-scorer`, `send-time-optimizer`) | Endpoint público com token assinado |
| Score de engajamento e STO com dados reais | RAMPER_2026-07.md:54,70; GAPS_CLASSE_MUNDIAL.md:42-43 | PARCIAL | As functions existem, mas leem uma tabela sem produtor (item anterior) | Depende do pixel/clique |
| Envio no horário ótimo | CLAUDE.md:80,105 | DIVERGENTE | `schedule-optimal-send` grava `scheduled_sends` (`index.ts:66`). `process-scheduled-sends` consome a fila, mas **não tem cron nem chamador** (só testes) | Agendar `process-scheduled-sends` |
| Opt-out em WhatsApp/SMS | RAMPER_2026-07.md:85,164 | PARCIAL | E-mail está resolvido: `email_opt_outs`, `email-unsubscribe` e `send-transactional-email/index.ts:116,267` (filterOptedOut, 409). Em `send-multichannel-message`, `opt|consent` = 0 | Supressão e consentimento por canal |
| Setup de SPF/DKIM/DMARC | RAMPER_2026-07.md:71,166,197 | NÃO INICIADO | ausente: procurei `spf|dkim|dmarc` e não achei nada | Setup guiado em `/admin/conexoes` |
| Aquecimento de caixa (warm-up) | RAMPER_2026-07.md:72 | NÃO INICIADO | ausente: procurei `warm.?up` e não achei nada | Tudo |
| Limite diário por remetente | RAMPER_2026-07.md:73,170,193 | NÃO INICIADO | Nada em `sequence-runner`. `send-transactional-email` só tem rate limit genérico (`index.ts:10,210`) | Limite configurável |
| Painel de deliverability | RAMPER_2026-07.md:198 | PARCIAL | `admin/InboundReplyLogPanel.tsx` (respostas/bounces) e `EmailMetricsDashboard`, mas sem visão consolidada por sequência | Painel por sequência |
| Enriquecimento de lead | RAMPER_2026-07.md:36; CLAUDE.md:101; GAPS_CLASSE_MUNDIAL.md:124 | DIVERGENTE | `enrich-lead/index.ts:34-48` sempre retorna **503 `enrichment_provider_not_configured`** (é um stub). O Ramper diz "Sim, sob demanda" | Provedor real |
| Base de empresas / captura no LinkedIn | RAMPER_2026-07.md:34-35,167; GAPS_CLASSE_MUNDIAL.md:54 | NÃO INICIADO | `linkedin` só aparece como tipo de atividade; `linkedin.com/|sales.?navigator` = 0 | Fornecedor externo |
| Landing pages e formulários públicos | RAMPER_2026-07.md:79-80,165,202; GAPS_CLASSE_MUNDIAL.md:86-87 | NÃO INICIADO | As únicas rotas públicas são `AppRoutes.tsx:243,244,247,251,260` (auth, reset, embed, TV/espectador) | Forms, submissions e anti-spam |
| Coletor de visitantes do site | RAMPER_2026-07.md:83,168,199 | NÃO INICIADO | `website_visitor_logs` só aparece em `types.ts:20714`; não há script de coleta | Coletor com consentimento |
| E-mail marketing / nutrição | RAMPER_2026-07.md:81-82,203; GAPS_CLASSE_MUNDIAL.md:85,88 | PARCIAL | `email-bulk-send`, `/engagement/bulk-composer`, `/workflow-builder` | Drip por segmento (`saved_filters`) |
| Atribuição multi-touch e lead magnets | GAPS_CLASSE_MUNDIAL.md:90-91 | NÃO INICIADO | ausente: procurei `attribution|first_touch|u_shape` (só falsos positivos) | Tudo |
| Qualificação MQL (evidência do benchmark) | RAMPER_2026-07.md:42 | DIVERGENTE | `sdr/MQLQualificationForm.tsx:77-78` grava em `sales`. `mql_qualifications` não tem produtor (DEAD_TABLES.md:31) | Corrigir o benchmark ou usar a tabela |
| Power dialer paralelo (3-5 linhas) | GAPS_CLASSE_MUNDIAL.md:45 | PARCIAL | `hooks/dialer/usePowerDialer.ts:139` faz `next_dialer_item` sequencial | Discagem paralela |
| Alertas SDR/metas/desafios "Ativa (CRON)" | FUNCIONALIDADES_SEM_UI.md:99-101 | DIVERGENTE | `sdr-consecutive-alerts`, `activity-goal-alerts` e `challenge-expiration-alerts` aparecem em 0 migrations. `admin/AdminSystemStatus.tsx:29-35` exibe "8h diário/15h diário/Horário"; só há disparo manual (`BackendAutomationMonitor`, `TestSDRAlertButton`) | Cron versionado |
| Limites de alerta SDR configuráveis pelo gestor | FUNCIONALIDADES_SEM_UI.md:99 | NÃO INICIADO | `sdr_performance_settings` não tem leitor (DEAD_TABLES.md:39) | UI de configuração |
| SLA de lead e reatribuição automática | CLAUDE.md:66,71 | DIVERGENTE | `check-lead-sla` e `auto-reassign-inactive` não têm cron. A UI mostra "6h diário/Configurável" (`AdminSystemStatus.tsx:33,35`) | Cron |
| Auto-enroll em cadência | CLAUDE.md:69 | PARCIAL | Só é disparado por `cadences/EnrollmentRulesDialog.tsx`; não há cron nem trigger | Disparo por evento ou cron |
| `sequence-record-reply` | CLAUDE.md:103; RAMPER_2026-07.md:52 | DIVERGENTE | 0 chamadores. A pausa real vem de `inbound-email-webhook/index.ts:159` (`auto_pause_enrollment`) | Remover ou plugar; corrigir o benchmark |

## 3. IA / Coaching

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Painel "Meu Coach IA" | FUNCIONALIDADES_SEM_UI.md:98,157 | PARCIAL | `salesperson-coaching` só existe como aba do Analytics (`pages/Analytics.tsx:107`) e em `/coaching-inteligente` | Painel pessoal persistente |
| Copiloto `ai-copilot` | CLAUDE.md:79; FUNCIONALIDADES_COMPLETAS.md:360; FUNCIONALIDADES_SEM_UI.md:55 | DIVERGENTE | 0 chamadores em `src` (só `execute-workflow/contracts_test.ts`). `useAICopilot` não existe. O copiloto real é `assistant/PersonalAssistantDrawer` com `personal-assistant-stream` | Remover ou plugar; corrigir docs |
| `generate-loss-coaching` | CLAUDE.md:78,111 | DIVERGENTE | 0 chamadores; consta em `scripts/deno-typecheck-baseline.json:26` com erro TS2339 | Plugar no win-loss ou remover |
| `elevenlabs-stt` | CLAUDE.md:107,134 | DIVERGENTE | 0 chamadores (src, migrations e functions) | Plugar ou remover |
| Gravação automática Zoom/Meet/Teams | GAPS_CLASSE_MUNDIAL.md:29,56,227 | NÃO INICIADO | `zoom|meet.google|graph.microsoft` = 0. A ingestão vem só de upload (`hooks/conversational/useUploadCallRecording.ts:85`) e da gravação Twilio | Integrações de reunião |
| Agentes de IA autônomos | GAPS_CLASSE_MUNDIAL.md:170 | PARCIAL | `ai-agent-orchestrator/index.ts:177-189` exige aprovação humana (`requires_approval`); existe `/agentes` | Autonomia controlada (resposta a lead) |
| Próxima melhor ação persistente em todas as telas | FUNCIONALIDADES_SEM_UI.md:58 | PARCIAL | `useNextBestAction` tem 4 consumidores (`ai/NextBestActionCard.tsx`); não aparece em todas as telas operacionais | Card persistente |

## 4. Forecast / BI / Relatórios

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Relatórios agendados com "cron diário" | REPORTING_BI_COMPLETE.md:13,27 | DIVERGENTE | `scheduled-reports-runner` não tem cron; só roda via `scheduled-report-trigger/index.ts:52` (manual) | Cron |
| Rotas do módulo de reporting | REPORTING_BI_COMPLETE.md:32-37,47 | DIVERGENTE | `/relatorios/builder`, `/relatorios/funnel`, `/scheduled-reports` e `/dashboard-personalizado` não existem. As reais são `/relatorios-custom`, `/relatorios/funil`, `/relatorios-agendados` e `/dashboard-custom` | Atualizar o doc |
| `cohort_analyses` e RPC `compute_cohort_retention` | REPORTING_BI_COMPLETE.md:9,12,21; RAMPER_2026-07.md:108 | DIVERGENTE | A tabela não tem produtor (DEAD_TABLES.md:28). O heatmap calcula no cliente (`hooks/reporting/useCohortRetention.ts:24-29`, a partir de clients/sales). A RPC não é chamada no `src` | Alinhar doc e código |
| Dashboard builder drag-and-drop | GAPS_CLASSE_MUNDIAL.md:174 | PARCIAL | `dashboard/CustomizableDashboard.tsx` adiciona widgets mas não usa `@dnd-kit`; o dnd só existe em pipeline/tasks | Arrastar e redimensionar |
| QBR automático | GAPS_CLASSE_MUNDIAL.md:70,102 | PARCIAL | `qbr-generator` e `QBRGeneratorPanel` existem. `qbr-scheduler` não tem cron; é disparado por botão em `HelpdeskConnectorPanel` | Cron |
| Snapshots de forecast para medir acurácia | CLAUDE.md:82 | PARCIAL | `snapshot-forecast` só é chamado por `hooks/revenue-intelligence/useForecastAccuracy.ts`; não tem cron | Snapshot periódico |
| Inspeção de pipeline auditável | GAPS_CLASSE_MUNDIAL.md:67,236 | PARCIAL | `revenue-intelligence/PipelineInspectionTable.tsx` existe; `pipeline_inspections` não tem produtor (DEAD_TABLES.md:33) | Trilha por estágio |
| Conectores de BI (Tableau/PowerBI/Looker) | GAPS_CLASSE_MUNDIAL.md:57 | NÃO INICIADO | ausente: procurei `powerbi|tableau|looker` e não achei nada | Tudo |
| Rate limit do embed público | reports/BACKEND_ANALYSIS_REPORT.md:595-606 | PARCIAL | `report-embed-public/index.ts:38` usa um `Map` em memória (por isolate) | Rate limit persistente |
| Suíte de testes e página de telemetria | TELEMETRY_MODULE_DOCS.md:70,684-687,799 | DIVERGENTE | `tests/lib/telemetry-logic.test.ts`, `tests/components/TelemetryCharts.test.tsx`, `tests/pages/AdminTelemetriaPage.test.tsx`, `tests/lib/external-db-bridge-telemetry.test.ts` e `src/pages/admin/AdminTelemetriaPage.tsx` **não existem**. A página real é `AdminTelemetria` em `/admin/telemetria` | Criar os testes ou corrigir o doc |

## 5. Gamificação

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Roleta de prêmios: histórico e configuração pelo admin | FUNCIONALIDADES_SEM_UI.md:43 | PARCIAL | `competitive/PrizeWheel.tsx` em `ArenaCompetitiva`/`CompetitionModule`; não há tela admin nem histórico | Admin de prêmios e histórico de spins |
| Ranking semanal em painel dedicado com prêmios | FUNCIONALIDADES_SEM_UI.md:48 | PARCIAL | `WeeklyRanking` é só uma aba em `pages/ArenaCompetitiva.tsx` | Painel e prêmios semanais |
| `ranking-api`: consumidor e playground | CLAUDE.md:89,113; FUNCIONALIDADES_SEM_UI.md:106 | NÃO INICIADO | 0 chamadores no app; só `scripts/load/k6-smoke.js:26` | Playground ou consumidor |
| Rotação diária de desafios | CLAUDE.md:88,113 | PARCIAL | `rotate-daily-challenges` não tem cron; é disparado on-demand por `DailyChallengesCard`/`HistoricoDesafiosDiarios` | Cron diário |

## 6. Win-Loss

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Replay em lote de webhooks | CLAUDE.md:121 | PARCIAL | `winloss-webhook-replay-batch` tem 0 chamadores; só operação manual descrita em `docs/runbooks/winloss-webhooks.md:28` | Botão em `/admin/webhooks-dead-letters` |

## 7. Customer Success

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Pesquisas CSAT/CES | GAPS_CLASSE_MUNDIAL.md:100 | PARCIAL | `csat-ces-trigger` só insere em `csat_ces_surveys`; não envia nada e não há rota pública de resposta | Envio e coleta de resposta |
| Rastreamento de uso do produto | GAPS_CLASSE_MUNDIAL.md:97 | NÃO INICIADO | `product_usage_events` não tem produtor (DEAD_TABLES.md:37) | Coleta |
| Renovação e expansão automáticas | GAPS_CLASSE_MUNDIAL.md:96,99 | PARCIAL | `renewal-automation` e `expansion-detector` só rodam por botão em `HelpdeskConnectorPanel`; não têm cron | Cron |
| Integração com helpdesk | GAPS_CLASSE_MUNDIAL.md:95 | PARCIAL | `helpdesk-sync/index.ts:8,126-129` (Zendesk/Intercom/Freshdesk via env); sync manual | Credencial por tenant e sync agendado |
| Onboarding de novos clientes | GAPS_CLASSE_MUNDIAL.md:98 | PARCIAL | `onboarding-launcher` só é chamado por `HelpdeskConnectorPanel`; existe `/onboarding-tracking` | Disparo automático no fechamento |

## 8. Integrações / Plataforma

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Sync bidirecional Gmail/Outlook e de calendário | GAPS_CLASSE_MUNDIAL.md:52-53,221 | NÃO INICIADO | ausente: procurei `gmail|outlook|google.?calendar|text/calendar` e não achei nada | Tudo |
| Slack/Teams (notificações e comandos) | GAPS_CLASSE_MUNDIAL.md:55 | PARCIAL | Slack só envia webhooks de alerta de ops (`wal-health-alert/index.ts:102`, `deal-risk-digest/index.ts:20`); não há comandos nem Teams | Notificações de negócio e comandos |
| Marketplace, Zapier/Make, ERP, LinkedIn Sales Navigator | GAPS_CLASSE_MUNDIAL.md:51,54,58-59 | NÃO INICIADO | `zapier|make.com|totvs|sap_` = 0 | Tudo |
| WhatsApp "via Evolution" | CLAUDE.md:137 | DIVERGENTE | `send-multichannel-message` usa Twilio (`:89`), Meta Cloud (`:126`) e Z-API (`:158`); não há nenhuma referência a Evolution | Corrigir o doc |
| Tokens Bitrix24 criptografados | reports/BACKEND_ANALYSIS_REPORT.md:558-578 | NÃO INICIADO | `bitrix24-oauth/index.ts:160-161,283-284` grava `access_token` em texto plano nas settings | Vault/pgcrypto |
| API pública documentada (OpenAPI/SDK/GraphQL) | RAMPER_2026-07.md:133,171; GAPS_CLASSE_MUNDIAL.md:208-212 | PARCIAL | `docs/API.md` (800 l.), `settings/ApiIntegrationSettings.tsx`; `validate_api_token` só em `ranking-api`; sem OpenAPI nem SDK | Spec OpenAPI e SDK |
| Analytics de uso da API | GAPS_CLASSE_MUNDIAL.md:214 | NÃO INICIADO | Só existe `api_tokens`; não há métrica de uso | Dashboard |
| Envio de orçamento ao cliente | CLAUDE.md:68 | DIVERGENTE | `send-quote-to-client` não tem chamador real (só `authz_test`/`cors_lint_test`) | Plugar em `/orcamentos` |
| Expiração de cotações (edge) | CLAUDE.md:68 | DIVERGENTE | A edge `check-quote-expiration` tem 0 chamadores. Quem faz o trabalho é o SQL `check_quote_expirations` (migration `20260619144542:10`) | Remover a edge ou corrigir o doc |
| 172 functions vs limite de 100 deployadas | CLAUDE.md:95 | PARCIAL | No mínimo 72 functions ficam necessariamente fora do ar. Não há manifesto de deploy (`deployed.txt` foi removido, CHANGELOG.md:26) | Lista versionada de quais estão no ar |
| Libs de export Excel/PDF | CLAUDE.md:56 | DIVERGENTE | `package.json` tem `exceljs` e `jspdf`; não tem `xlsx` nem `pdf-lib` | Corrigir o doc |
| Canal de deploy | CLAUDE.md:57 vs RELEASE_NOTES.md:73 | DIVERGENTE | CLAUDE diz Vercel; RELEASE_NOTES diz "Release = publish no Lovable"; não há `vercel.json` | Unificar |

## 9. Segurança / LGPD / Retenção / ADRs

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| LGPD: aplicação em produção | LGPD.md:3-5,106-132 | PARCIAL | O doc cita `20261001150000_lgpd_…`, mas a migration real é `20261001150100_lgpd_consent_and_anonymization.sql` (a `…150000` é `_rls_user_2fa_log.sql`). Os tipos gerados já têm `consent_records`/`data_subject_requests` (`types.ts:5544,6323`). A verificação do §6 não foi registrada | Rodar o §6 e corrigir o nome no doc |
| UI de direitos do titular (acesso, eliminação, portabilidade) | LGPD.md:40-60; GAPS_CLASSE_MUNDIAL.md:187 | NÃO INICIADO | `data_subject_requests` e `anonymize_data_subject` têm 0 refs em `src` e functions | Fila admin e portal do titular |
| Gestão de consentimento | LGPD.md:26-38; GAPS_CLASSE_MUNDIAL.md:189 | PARCIAL | `consent_records` e `has_active_consent` existem só no banco, com 0 usos em `src` e functions | Captura e revogação na UI; checagem nos envios |
| Consentimento antes de gravar chamada | LGPD.md:102-104 | NÃO INICIADO | `twilio-call-twiml/index.ts:122` grava com `record="record-from-answer"` sem checar consentimento; o upload (`useUploadCallRecording`) também não checa | Checar `has_active_consent(...,'voice_recording')` |
| Export mensal de logs para storage frio | ADR-007-log-retention.md:22 | NÃO INICIADO | ausente: nenhuma function ou cron de export | Job de arquivamento |
| Verificação da CSP em browser real | ADR-009-session-storage-e-csp.md:93-97 | NÃO INICIADO | Nenhum registro ou teste de violação de CSP | Checar no browser com evidência |
| Headers HTTP reais (HSTS, frame-ancestors, X-Frame) | ADR-009-session-storage-e-csp.md:98-103 | NÃO INICIADO | Não há `vercel.json`/`_headers` no repo; `index.html:48` só tem um comentário dizendo que o hosting aplica | Configurar no host |
| Remover `'unsafe-eval'` | ADR-009-session-storage-e-csp.md:104-107 | NÃO INICIADO | `index.html:56` ainda tem `script-src 'self' 'unsafe-eval'` | Validar exports sem eval |
| Baseline da camada de dados (ADR-010) | ADR-010-service-layer.md:66-70,84-88 | PARCIAL | `scripts/baselines/data-layer.txt` tem 134 linhas (o doc cita 132 arquivos) | Migração incremental |
| MFA por SMS | FEATURE_SUMMARY.md:55 | DIVERGENTE | `setup_sms_mfa` (migration `20260321195552`) gera o código mas **não envia**: "-- In production: send SMS via Twilio/etc" | Envio real ou remover a opção |
| Gerenciamento de sessões | FEATURE_SUMMARY.md:63; DOCUMENTACAO_SISTEMA.md:176 | DIVERGENTE | `SessionManager.tsx` e `useSessionManagement.ts` não existem; `active_sessions`, `validate_session` e `refresh_session` têm 0 usos em `src` | UI de sessões ativas e revogação |
| Papel "Sales Ops" (RBAC com 4 papéis) | DOCUMENTACAO_SISTEMA.md:71-78,191 | DIVERGENTE | O enum `app_role` tem só admin/manager/salesperson (ADR-001); `src/types/index.ts:66` ainda tipa `'sales_rep'|'sales_ops'` | Corrigir o doc e o tipo |
| Login com passkey | FUNCIONALIDADES_SEM_UI.md:82,163 | PARCIAL | `loginWithPasskey` (`hooks/useWebAuthn.ts:128`) não é usado; a tela de Auth não tem o botão; `PasskeySettings` só aparece em Configurações | Botão no login |
| Nota de DEAD_TABLES sobre webauthn ("edge retorna 503") | DEAD_TABLES.md:43-44 | DIVERGENTE | O ADR-010 reativou: `useWebAuthn.ts:24` (`PASSKEYS_AVAILABLE = true`) e `webauthn/index.ts:319` (`verifyAuthenticationResponse`). **Risco de drop indevido** de `webauthn_*` | Retirar da lista de candidatas |
| Drop das tabelas mortas | DEAD_TABLES.md:10-13,75-87 | NÃO INICIADO | Não há migration `*_drop_dead_*`; a última é `20261005220000` | Observar 30 dias e dropar |
| Criptografia por campo, templates de DPA, dashboard de compliance | GAPS_CLASSE_MUNDIAL.md:188-191 | NÃO INICIADO | `pgsodium|pgp_sym_encrypt` em src/functions = 0; não há página de compliance | Tudo |
| `simulate-load` (SSRF/abuso) | reports/BACKEND_ANALYSIS_REPORT.md:63-89 | PARCIAL | Hoje exige usuário autenticado e bloqueia IP privado (`index.ts:29,55`), mas qualquer vendedor ainda gera carga contra qualquer URL pública | Restringir a admin |
| Rastreio de IP real via edge | FEATURE_SUMMARY.md:65 | DIVERGENTE | `get-client-ip` tem 0 chamadores | Plugar no login/audit ou remover |
| Migration de RLS `20260902221500` | CHANGELOG.md:12 | PARCIAL | O arquivo existe; o próprio doc diz "aplicação no banco pendente" e não verifiquei no banco | Confirmar no banco |

## 10. A11y / UX / Design System

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Checklist de a11y (17 itens, todos `[ ]`) | accessibility-checklist.md:4-26 | PARCIAL | `SkipLinks` montado (`templates/MainLayout.tsx:141`); `FocusTrap` em só 2 usos; `aria-live` em 23 arquivos; motion-safe/reduced-motion em 26; cerca de 28 `<div onClick>` em 27 arquivos (ex.: `VictoryFeedPage.tsx`, `WebhooksPage.tsx`); varredura axe em `tests/a11y/axe-sweep.spec.ts` + `a11y-sweep.yml` | Validar e marcar os itens; trocar `div onClick` |
| Regra "NUNCA use cores diretas" | DESIGN_SYSTEM.md:847 | PARCIAL | 614 ocorrências de `text-white|bg-black|text-gray-*|bg-gray-*` em 159 arquivos | Migrar para tokens |
| Central de preferências de push | FUNCIONALIDADES_SEM_UI.md:104,162 | PARCIAL | `settings/BrowserPushSettings.tsx` em `Notificacoes.tsx`; não tem categorias nem horários | Categorias e janela de silêncio |

## 11. Outros (débito técnico, docs, infra)

| item | fonte (doc:linha) | estado | evidência | o que falta |
|---|---|---|---|---|
| Ratchet de `as unknown` | TYPE_DEBT.md:35-38; TECH_DEBT.md:14 | DIVERGENTE | Hoje há **168** ocorrências em 127 arquivos do `src` (TYPE_DEBT diz 155/122, TECH_DEBT diz 214); `supabase/functions` tem 22 (doc: 20). Os docs se contradizem e o ratchet subiu | Recontar e aplicar `parseRows` |
| Flags estritas (882 erros) | TYPE_DEBT.md:64-90 | PARCIAL | `tsconfig.strict.json` + `scripts/typecheck-baseline.json`; nenhuma flag foi promovida para `tsconfig.app.json` | Zerar por domínio |
| Literais de status soltos (~35) | TYPE_DEBT.md:92-103 | PARCIAL | Encontrei 70 ocorrências de `status === 'completed|won|lost|pending'` fora de testes | Constantes por domínio |
| Cobertura de testes (meta 5%) | TECH_DEBT.md:9 | PARCIAL | `coverage-baseline.json`: lines 3,99%, branches 3,31%, functions 2,92% | Subir |
| `eslint-disable` | TECH_DEBT.md:11-13 | PARCIAL | Total 219 (doc: 270, melhorou); `no-restricted-syntax` 162; `exhaustive-deps` 51 (meta -10/mês, sem progresso) | Corrigir as deps |
| Crons HTTP dependem de `_internal_secrets.functions_base_url` | CLAUDE.md:15-20 (§1); docs/estado/IDENTIDADE_BANCO_2026-09-13.md:93-94 | DIVERGENTE | `trigger_internal_edge_job` (`20261002010000`) e o cron de churn (`20260831163000`) fazem RAISE se a chave faltar. O próprio repo declara que a chave **não existe** no banco, então os cerca de 11 jobs HTTP versionados provavelmente falham | Gravar a chave e checar `cron.job_run_details` |
| Functions duplicadas ou sobrepostas | CLAUDE.md:99,103,108 | PARCIAL | Pares ativos: `calibrate-win-probabilities`/`-probability`, `recompute-`/`refresh-stage-baselines`, `execute-workflow`/`workflow-executor`, `generate-revenue-forecast`/`revenue-forecast-ai` | Consolidar (pesa no limite de 100) |
| "Nenhuma funcionalidade fantasma" / "100% implementado" | FUNCIONALIDADES_SISTEMA.md:545-553; FUNCIONALIDADES_COMPLETAS.md:709 | DIVERGENTE | Contradito por `enrich-lead` (stub 503), SMS MFA sem envio, 11+ functions sem chamador e crons ausentes | Rebaixar o claim |
| FEATURE_SUMMARY desatualizado nos dois sentidos | FEATURE_SUMMARY.md:79-84,89 | DIVERGENTE | Diz "sem feature flags/A-B/WhatsApp/E2E", mas existem: `useFeatureFlags.ts:66` (rollout), `cadence_ab_tests`, `send-multichannel-message`, `tests/e2e` (51 arquivos). Diz "Type Safety 100% strict", mas há 882 erros na baseline estrita | Reescrever |
| Diretórios de componentes citados | CLAUDE.md:149,151 (§6) | DIVERGENTE | `src/components/copilot`, `crm` e `scoring` não existem | Corrigir o doc |

---

## Contagem

| Domínio | PARCIAL | NÃO INICIADO | DIVERGENTE | Total |
|---|---|---|---|---|
| CRM | 13 | 9 | 2 | 24 |
| SDR/Cadências/E-mail | 6 | 10 | 7 | 23 |
| IA/Coaching | 3 | 1 | 3 | 7 |
| Forecast/BI | 5 | 1 | 4 | 10 |
| Gamificação | 3 | 1 | 0 | 4 |
| Win-Loss | 1 | 0 | 0 | 1 |
| Customer Success | 4 | 1 | 0 | 5 |
| Integrações/Plataforma | 3 | 4 | 5 | 12 |
| Segurança/LGPD/ADRs | 6 | 8 | 5 | 19 |
| A11y/UX/DS | 3 | 0 | 0 | 3 |
| Outros | 5 | 0 | 5 | 10 |
| **Total** | **52** | **35** | **31** | **118** |

**Completos (só contados): cerca de 62.**
- 23 itens de FUNCIONALIDADES_SEM_UI foram resolvidos, com página ou consumidor real: `/competencias`, `/perfil-gamer`, `/gamificacao/badges`, `/analytics/{abc,closing-time,deal-velocity,evolution,objections,win-loss,emails}`, feature flags com rollout, kudos, batalhas em realtime, brackets, streaks, chat competitivo, missões no dashboard, deals parados em `/tarefas`, visual search em SmartSearch, painel do external-db-bridge, `/admin/regras-inatividade` e os helpers órfãos (removidos ou já consumidos).
- 3 itens do Ramper foram resolvidos: opt-out de e-mail (G3), supressão por bounce (G8) e pausa por resposta.
- 28 gaps "classe mundial" já existem: forecast categories, deal risk, mapa de buying committee, win rate breakdown, pipeline coverage, battle cards/menções de concorrente, talk ratio/sentimento, biblioteca de chamadas, transcrição/diarização, resumo de reunião, e-mail com IA, NLQ, busca semântica, explicação de score, report builder com joins, embed, cohort heatmap, funil, webhooks com DLQ/replay, click-to-call, A/B de sequência, health score, aprovações, workflow builder visual, deduplicação, skill gaps, hub de enablement e quiz gamificado.
- Cerca de 8 itens de segurança/ADR estão implementados: WebAuthn com verificação real, soft delete nos hooks, purge e retenção versionados, desafio TOTP no login, bloqueio de IP/geo, circuit breaker em 12 functions, `v_platform_slo` e idempotência quote→sale.

---

## Top 15 por impacto de negócio

1. **O motor de cadência não roda sozinho.** `sequence-runner` não tem cron e só roda por botão. Toda a "paridade" de cadências do benchmark Ramper é teórica.
2. **Envio em horário ótimo fica preso na fila.** `schedule-optimal-send` enfileira em `scheduled_sends`, mas `process-scheduled-sends` não tem cron nem chamador; nada é despachado.
3. **Não há pixel de abertura nem rastreio de clique.** `email_tracking_events` não tem produtor. Engagement scorer, send-time optimizer e relatórios de e-mail operam sobre dados vazios.
4. **Jobs vendidos como "CRON" não estão agendados.** É o caso de alertas SDR, metas, desafios, SLA de lead, reatribuição, relatórios agendados, QBR, renovação, expansão e snapshot de forecast. Além disso, os jobs HTTP versionados dependem de `functions_base_url`, que o próprio repo diz não existir. A UI de admin exibe horários que ninguém cumpre.
5. **Ligações Twilio são gravadas sem consentimento.** `record-from-answer` sem checar `voice_recording` é risco jurídico de LGPD direto.
6. **LGPD existe só no banco.** Não há UI de direitos do titular, de consentimento nem de anonimização; o fluxo de 15 dias de SLA legal é manual via SQL.
7. **Enriquecimento de lead é um stub.** `enrich-lead` sempre retorna 503, embora docs e benchmark o tratem como funcional.
8. **Não há porta de entrada inbound.** Sem landing pages, formulários públicos e coletor de visitantes, o pilar inbound inteiro fica fora (gap G4 do Ramper).
9. **Envio de orçamento ao cliente está órfão.** `send-quote-to-client` é prometido no CLAUDE §3.1 e não tem chamador, num fluxo central para quem vende brindes.
10. **Deliverability é incompleta.** Faltam SPF/DKIM guiado, limite diário por remetente, warm-up e opt-out em WhatsApp/SMS, o que arrisca bloqueio de domínio no primeiro envio em massa.
11. **Os headers HTTP de segurança não existem e a CSP mantém `'unsafe-eval'`.** Sem HSTS e sem frame-ancestors, a proteção contra clickjacking é inócua (ADR-009).
12. **MFA por SMS e gerenciador de sessões não funcionam como prometido.** O código SMS nunca é enviado e a UI de sessões não existe.
13. **Tokens do Bitrix24 estão em texto plano.** Integração com o CRM legado sem criptografia.
14. **Não sabemos o que está no ar.** São 172 functions para um limite de 100 deployadas e não há manifesto de deploy. Qualquer feature "pronta" no repo pode não existir em produção.
15. **O CS está pela metade.** CSAT/CES sem envio nem resposta, uso de produto sem coleta, renovação, expansão e QBR só por botão. O gap de Customer Success segue praticamente aberto.

> Ressalva: estados de produção (linhas em tabelas, crons criados fora de migration, functions deployadas) não foram verificados, porque não tive acesso ao banco nesta fatia. Onde isso importa, o item diz "sem cron versionado" ou "não verificado".
