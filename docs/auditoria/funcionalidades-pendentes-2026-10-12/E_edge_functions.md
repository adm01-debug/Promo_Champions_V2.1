# Anexo E — Edge Functions (supabase/functions/*)

> Medição estática no commit `6f6b94a` (2026-10-11), sem acesso ao banco nem ao painel de deploy. Escopo: 172 pastas de function (+ `_shared`, `README.md` = 174 entradas), `supabase/config.toml`, 644 migrations, `src/`, `scripts/`, `.github/`, `tests/`.
> Como medi: script node temporário da sessão de auditoria (não versionado) cruzou o nome literal de cada function contra `functions.invoke(...)`/`/functions/v1/...` em `src/`, `fetch`/`invoke` entre functions, `cron.schedule`/`net.http_post`/`trigger_internal_edge_job('...')` nas migrations, além de scripts e workflows. Para cada caso também foi checado se o arquivo que chama é alcançável a partir de `pages/` ou `routes/` (com até 6 níveis de import, inclusive `import()` dinâmico). As tabelas e RPCs (`.from('x')`, `.rpc('y')`) foram cruzadas com `CREATE/DROP/RENAME` nas migrations e com `src/integrations/supabase/types.ts`. Os secrets saíram de `Deno.env.get` (da própria function e de `_shared/`). O estado de cada function foi classificado lendo o código. Os casos duvidosos foram conferidos à mão.
>
> **Não verificável estaticamente**: quais functions estão de fato deployadas em `usyxfpqlsspldubptrdl`. O plano limita a 100 functions e o repo tem 172. Segundo `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:88-90`, as functions ainda não tinham sido publicadas no usyxf. Também não é possível verificar o valor dos secrets.

## 0. Números

| Métrica | Valor |
|---|---|
| Functions | 172 |
| Com chamador no front (literal) | 137 (1 deles só por componente morto: `predict-deal-velocity`) |
| Chamadas por cron/trigger SQL | 15 (13 cron via `trigger_internal_edge_job`/funções `trigger_*` e 2 triggers de tabela) |
| Webhooks/callbacks externos | 9 (`receive-quote-sync`, `receive-quote-webhook`, `inbound-email-webhook`, `multichannel-status-webhook`, `twilio-call-status`, `twilio-call-twiml`, `email-unsubscribe`, `report-embed-public`, `health`) |
| Sem nenhum chamador de produção | 14 diretas e mais 3 transitivas/front morto (ver §3) |
| Estado | REAL 124 · PARCIAL 23 · ÓRFÃ 15 · QUEBRADA 5 · STUB 2 · mistos 3 (ÓRFÃ+PARCIAL, ÓRFÃ+QUEBRADA, PARCIAL+QUEBRADA) |
| Dependem de `LOVABLE_API_KEY` (gateway `ai.gateway.lovable.dev`) | **46** (todo o pilar de IA/coaching; `_shared/ai-gateway.ts:4-6`) |
| Leem `_internal_secrets` (tabela fora das migrations, presente em `types.ts:42`) | 25 |
| Com `verify_jwt=false` no `config.toml` | 20 (`supabase/config.toml:3-78`). Todas são webhooks/cron com auth própria no handler. |
| Marcadores literais TODO/FIXME/mock | 0 TODO/FIXME. `Math.random` aparece em 8 functions, mas só `stress-test-contracts` o usa para gerar dado simulado. Nas outras é jitter/backoff, Monte Carlo, sorteio de template ou cor de carro. Em `auto-reassign-inactive` produz um "round robin" que na verdade é sorteio. |

Legenda de estado:
- **REAL**: lógica real, com chamador vivo.
- **PARCIAL**: funciona, mas falta agendamento, entrega ou dado real (ou usa valor inventado).
- **STUB**: retorno fixo ou simulação.
- **ÓRFÃ**: nada a chama.
- **QUEBRADA**: depende de tabela, RPC ou constraint inexistente, ou a cadeia de chamada não funciona.

## 1. Tabela completa

Prefixos da coluna de chamador: "FE" é caminho relativo a `src/`, "mig" é `supabase/migrations/`, "FN" é outra function. A evidência sem prefixo é relativa a `supabase/functions/`.

| function | chamador(es) | estado | evidência (arquivo:linha) | secrets (além de SUPABASE_*) | o que falta / observação |
|---|---|---|---|---|---|
| `access-denied-alerts` | FE components/settings/AccessDeniedLogs.tsx:45 | **PARCIAL** | access-denied-alerts/index.ts:159-161 (exige JWT admin); AdminSystemStatus.tsx:32 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) | Só roda pelo botão "testar alerta"; exige JWT de admin, logo nem aceitaria cron; UI AdminSystemStatus.tsx:32 diz "Horário" (falso). |
| `account-engagement-aggregator` | FE hooks/engagement/useAccountEngagement.ts:94 | **REAL** | account-engagement-aggregator/index.ts:114 | — (só SUPABASE_*) | — |
| `activity-goal-alerts` | FE components/admin/BackendAutomationMonitor.tsx:34 | **PARCIAL** | activity-goal-alerts/index.ts:37 (cron-auth); AdminSystemStatus.tsx:31 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Desenhada p/ cron (cron-request-auth) mas sem cron.schedule; UI AdminSystemStatus.tsx:31 diz "15h diário" (falso). Agendar. |
| `admin-conversion-trail` | **nenhum** | **ÓRFÃ** | admin-conversion-trail/index.ts:50 (rpc fn_admin_conversion_trail) | — (só SUPABASE_*) | Nenhum chamador no front/cron. Usa `corsHeaders` estático (sem allowlist de origem). |
| `aggregate-coaching-scorecard` | FE hooks/conversational/useCoachingScorecard.ts:70, hooks/conversational/useTranscribeRecording.ts:99 | **REAL** | aggregate-coaching-scorecard/index.ts:155 | — (só SUPABASE_*) | Erro de tipo legado (deno-typecheck-baseline.json). |
| `ai-agent-orchestrator` | FE hooks/agents/useStartAgentRun.ts:22 | **PARCIAL** | ai-agent-orchestrator/index.ts:199,300 | LOVABLE_API_KEY | Entidade "lead" mapeia para tabela `leads` inexistente → contexto vazio e tool update_lead_score falha. |
| `ai-copilot` | só script scripts/load/k6-smoke.js:27 | **ÓRFÃ** | src/components/templates/MainLayout.tsx:213-216 | LOVABLE_API_KEY | Nenhum chamador no front (o "AI Copilot" do MainLayout.tsx:213 usa personal-assistant-stream). Só k6. É o único chamador de generate-coaching-actions. |
| `ai-email-composer` | FE components/sales/AIEmailDialog.tsx:24, hooks/email/useComposeEmail.ts:42 (+1) | **REAL** | ai-email-composer/index.ts:199 | LOVABLE_API_KEY | LOVABLE_API_KEY. |
| `analyze-call` | FE hooks/conversational/useCallRecordings.ts:180 | **REAL** | analyze-call/index.ts:58 | LOVABLE_API_KEY | Sobreposição com analyze-conversation/summarize-call-recording. |
| `analyze-conversation` | FE hooks/conversation-intelligence/useAnalyzeConversation.ts:20, hooks/pipeline-pulse/useQuickAction.ts:31 | **REAL** | analyze-conversation/index.ts:137 | LOVABLE_API_KEY | Grava em conversation_analyses (paralelo a call_insights de analyze-call). |
| `analyze-conversation-metrics` | FE hooks/conversational/useConversationMetrics.ts:85, hooks/conversational/useTranscribeRecording.ts:70 | **REAL** | analyze-conversation-metrics/index.ts:108 | — (só SUPABASE_*) | Heurística determinística (sem IA). |
| `analyze-objection-handling` | FE hooks/conversational/useObjectionAnalysis.ts:114, hooks/conversational/useTranscribeRecording.ts:89 | **REAL** | analyze-objection-handling/index.ts:244 | — (só SUPABASE_*) | Heurística por regex (sem IA). |
| `analyze-pipeline-coverage` | **nenhum** | **ÓRFÃ+PARCIAL** | analyze-pipeline-coverage/index.ts:91 | LOVABLE_API_KEY | Sem chamador. Quota inventada: max(fechado×1,2; R$50.000) em vez de sales_goals/salespeople.monthly_goal. |
| `analyze-question-quality` | FE hooks/conversational/useQuestionAnalysis.ts:117, hooks/conversational/useTranscribeRecording.ts:79 | **REAL** | analyze-question-quality/index.ts:148 | — (só SUPABASE_*) | Heurística por listas de palavras (index.ts:13-17). |
| `analyze-sentiment-timeline` | FE hooks/conversational/useSentimentTimeline.ts:28, hooks/conversational/useTranscribeRecording.ts:53 | **REAL** | analyze-sentiment-timeline/index.ts:240 | LOVABLE_API_KEY | — |
| `analyze-skill-gaps` | FE hooks/coaching/useSkillGapAnalyzer.ts:131 | **REAL** | analyze-skill-gaps/index.ts:274 | LOVABLE_API_KEY | — |
| `analyze-stage-conversion` | FE hooks/deal-intelligence/useStageConversion.ts:68 | **REAL** | analyze-stage-conversion/index.ts:308 | LOVABLE_API_KEY | — |
| `analyze-win-loss` | FE hooks/deal-intelligence/useWinLoss.ts:122, hooks/win-loss/useInsightExplanation.ts:45 (+1) | **REAL** | analyze-win-loss/index.ts:265 | LOVABLE_API_KEY | — |
| `auto-enroll-cadence` | FE components/cadences/EnrollmentRulesDialog.tsx:104 | **REAL** | auto-enroll-cadence/index.ts:138 | — (só SUPABASE_*) | Só manual (EnrollmentRulesDialog); sem gatilho automático em novo deal. |
| `auto-reassign-inactive` | FE components/admin/BackendAutomationMonitor.tsx:59 | **PARCIAL** | auto-reassign-inactive/index.ts:64 (cron-auth), :250 (shuffle) | — (só SUPABASE_*) | Sem cron (UI diz "6h diário" — AdminSystemStatus.tsx:33). Estratégia "round_robin" é shuffle Math.random, não rodízio. |
| `automation-suggestions` | FE hooks/automation/useAutomationIntelligence.ts:41 | **REAL** | automation-suggestions/index.ts:64 | — (só SUPABASE_*) | Regras fixas condicionadas a dados (não IA). |
| `behavioral-analysis` | FE hooks/useBehavioralAnalysis.ts:45 | **REAL** | behavioral-analysis/index.ts:129 | LOVABLE_API_KEY | IA sobre texto enviado pelo cliente; não lê banco. |
| `bitrix24-oauth` | FE hooks/useBitrix24.ts:46, hooks/useBitrix24.ts:88 (+1); FN test-integration-connection/index.ts:78 | **REAL** | bitrix24-oauth/index.ts:157 | BITRIX24_CLIENT_ID, BITRIX24_CLIENT_SECRET, BITRIX24_DOMAIN, BITRIX24_STATE_SECRET | fatia de integrações (só listada) |
| `bitrix24-sync` | FE hooks/useBitrix24.ts:133 | **PARCIAL** | bitrix24-sync/index.ts:69 | BITRIX24_CLIENT_ID, BITRIX24_CLIENT_SECRET, BITRIX24_DOMAIN +_internal_secrets (tabela) | fatia de integrações (só listada). Sem cron (UI diz "Horário"). |
| `broadcast-sale-notification` | trigger AFTER sales→completed (mig 20261001160000:130, net.http_post :96) | **REAL** | broadcast-sale-notification/index.ts:230 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Depende de _internal_secrets.functions_base_url/anon_key (não criados por migration). |
| `calculate-committee-coverage` | FE hooks/deal-intelligence/useCommitteeCoverage.ts:193, hooks/deal-intelligence/useDealStakeholders.ts:107 (+1); FN extract-committee-from-call/index.ts:250, extract-deal-stakeholders/index.ts:261 | **REAL** | calculate-committee-coverage/index.ts:92 | — (só SUPABASE_*) | — |
| `calculate-deal-health` | FE hooks/deal-intelligence/useDealHealth.ts:138 | **REAL** | calculate-deal-health/index.ts:351 | LOVABLE_API_KEY | Fallback determinístico sem LOVABLE_API_KEY (index.ts:143,254). |
| `calibrate-win-probabilities` | FE hooks/revenue/useWinProbabilityCalibrator.ts:111 | **REAL** | calibrate-win-probabilities/index.ts:147 | — (só SUPABASE_*) | DUPLICATA de calibrate-win-probability (tabelas diferentes). |
| `calibrate-win-probability` | FE hooks/revenue/useWinProbabilityCalibration.ts:114 | **REAL** | calibrate-win-probability/index.ts:127 | — (só SUPABASE_*) | DUPLICATA de calibrate-win-probabilities. |
| `campaign-health-alert` | cron */30min via trigger_campaign_health_alert (mig 20260726202421:34; fn redefinida 20261001160000:136) | **REAL** | campaign-health-alert/index.ts:233 | CAMPAIGN_ALERT_COOLDOWN_HOURS, CAMPAIGN_ALERT_LOOKBACK_DAYS +_internal_secrets (tabela) | Depende de _internal_secrets (functions_base_url/anon_key). |
| `challenge-expiration-alerts` | FE components/admin/BackendAutomationMonitor.tsx:51 | **PARCIAL** | challenge-expiration-alerts/index.ts:21 (cron-auth) | +_internal_secrets (tabela) | Desenhada p/ cron, sem cron.schedule — só botão manual. |
| `check-lead-sla` | FE components/admin/BackendAutomationMonitor.tsx:43 | **PARCIAL** | check-lead-sla/index.ts:36 (cron-auth); AdminSystemStatus.tsx:35 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Desenhada p/ cron, sem cron.schedule — SLA de leads só verificado manualmente. |
| `check-quote-expiration` | **nenhum** | **ÓRFÃ** | check-quote-expiration/index.ts:101-102 | +_internal_secrets (tabela) | Expira cotações + notifica, mas nada a chama (sem cron). Cotações nunca expiram automaticamente. |
| `check-v4-callback-alerts` | cron */5min (mig 20260910153000:78) | **REAL** | check-v4-callback-alerts/index.ts:123 | +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `coaching-impact-summary` | FE hooks/coaching/useCoachingImpact.ts:40 | **REAL** | coaching-impact-summary/index.ts:42 | — (só SUPABASE_*) | Só agrega coaching_impact_metrics (RLS do usuário). |
| `coaching-intelligence` | FE hooks/useCoachingIntelligence.ts:36 | **PARCIAL** | coaching-intelligence/index.ts:61 | — (só SUPABASE_*) | Score de receita com teto fixo R$50k ("50k = max"). |
| `coaching-session-prep` | FE hooks/coaching/useCoachingSessions.ts:60 | **REAL** | coaching-session-prep/index.ts:154 | LOVABLE_API_KEY | — |
| `collect-race-powerup` | FE hooks/race/useRacePowerups.ts:68 | **REAL** | collect-race-powerup/index.ts:115 | — (só SUPABASE_*) | — |
| `compute-forecast-accuracy` | FE hooks/revenue-intelligence/useForecastAccuracy.ts:137 | **PARCIAL** | compute-forecast-accuracy/index.ts:96 | — (só SUPABASE_*) | Só manual (useForecastAccuracy); acurácia exige snapshots periódicos — sem cron. |
| `conversational-intelligence` | FE hooks/useConversationalIntelligence.ts:48 | **REAL** | conversational-intelligence/index.ts:57 | — (só SUPABASE_*) | Agregação de call_recordings/call_insights (sem IA apesar do nome). |
| `create-stagnant-tasks` | FE hooks/useStagnantTasks.ts:19 | **REAL** | create-stagnant-tasks/index.ts:139 | — (só SUPABASE_*) | Só manual (useStagnantTasks); sem cron. |
| `cron-failure-alerter` | cron */10min (mig 20260910153000:86) | **REAL** | cron-failure-alerter/index.ts:149 | +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +METRICS_INGEST_* +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `csat-ces-trigger` | FE components/customer-success/SurveyTriggerDialog.tsx:55 | **PARCIAL** | csat-ces-trigger/index.ts:76-83 | — (só SUPABASE_*) | Grava pesquisa com sent_at=now() mas não envia nada ao contato (sem e-mail/link). |
| `customer-success-360` | FE hooks/customer-success/useCustomerSuccess360.ts:139 | **REAL** | customer-success-360/index.ts:54 | — (só SUPABASE_*) | Sobreposição com customer-success-hub. |
| `customer-success-hub` | FE hooks/useCustomerSuccess.ts:46 | **REAL** | customer-success-hub/index.ts:71 | — (só SUPABASE_*) | Sobreposição com customer-success-360. |
| `deal-probability` | FE hooks/useDealProbability.ts:7, hooks/useDealProbability.ts:11 (+1); FN _shared/deal-probability-calc.ts:3 | **REAL** | deal-probability/index.ts:35 | — (só SUPABASE_*) | Erros de tipo legados (3). |
| `deal-risk-digest` | cron diário 11:00 UTC (mig 20260910153000:103) | **REAL** | deal-risk-digest/index.ts:246 | SLACK_DIGEST_WEBHOOK_URL +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Depende de _internal_secrets + SLACK_DIGEST_WEBHOOK_URL. |
| `demand-forecast` | FE components/analytics/SalesForecast.tsx:78, hooks/useDemandForecast.ts:49 | **REAL** | demand-forecast/index.ts:197 | — (só SUPABASE_*) | Chamador SalesForecast.tsx:78 é código morto; o vivo é useDemandForecast.ts:49. |
| `detect-at-risk-deals` | FE hooks/deal-intelligence/useAtRiskDeals.ts:175 | **REAL** | detect-at-risk-deals/index.ts:163 | LOVABLE_API_KEY | Sobreposição com detect-stuck-deals/detect-winloss-at-risk/deal-risk-digest. |
| `detect-client-churn-alerts` | cron horário :15 (mig 20260831163000:107); FE pages/AdminAlertasChurn.tsx:135 | **REAL** | detect-client-churn-alerts/index.ts:303 | +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `detect-coaching-opportunities` | FE hooks/coaching/useCoachingOpportunities.ts:104 | **REAL** | detect-coaching-opportunities/index.ts:191 | LOVABLE_API_KEY | — |
| `detect-competitor-mentions` | FE hooks/conversational/useCompetitorMentions.ts:38, hooks/conversational/useTranscribeRecording.ts:37 | **REAL** | detect-competitor-mentions/index.ts:148 | — (só SUPABASE_*) | Lista de concorrentes vem de competitors_registry. |
| `detect-critical-moments` | FE hooks/conversational/useCriticalMoments.ts:72, hooks/conversational/useTranscribeRecording.ts:61 | **REAL** | detect-critical-moments/index.ts:202 | LOVABLE_API_KEY | — |
| `detect-stuck-deals` | FE hooks/deal-intelligence/useStageVelocity.ts:151 | **REAL** | detect-stuck-deals/index.ts:91 | — (só SUPABASE_*) | Só manual; depende de stage_velocity_baselines (ver refresh-stage-baselines). |
| `detect-winloss-at-risk` | FE hooks/win-loss/useAtRiskFromPatterns.ts:73, hooks/win-loss/useAtRiskFromPatterns.ts:85; FN _shared/winloss-contract.ts:5 | **REAL** | detect-winloss-at-risk/index.ts:52 | — (só SUPABASE_*) | Scoring determinístico; não persiste. |
| `dialer-queue-builder` | FE hooks/dialer/usePowerDialer.ts:115 | **REAL** | dialer-queue-builder/index.ts:125 | — (só SUPABASE_*) | — |
| `diarize-call-recording` | FE hooks/conversational/useDiarizeRecording.ts:9, hooks/conversational/useTranscribeRecording.ts:27 | **REAL** | diarize-call-recording/index.ts:228 | LOVABLE_API_KEY | Diarização feita por LLM sobre texto, não por áudio. |
| `dispatch-webhook` | FE hooks/useWebhooks.ts:173 | **REAL** | dispatch-webhook/index.ts:254 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `edge-retry-threshold-alert` | cron */15min (mig 20260831170000:109); FE components/admin/connections/EdgeRetryThresholdCard.tsx:27 | **REAL** | edge-retry-threshold-alert/index.ts:97 | EDGE_RETRY_ALERT_WINDOW_HOURS, EDGE_RETRY_EXHAUSTED_THRESHOLD, SLACK_WEBHOOK_URL +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `elevenlabs-stt` | **nenhum** | **ÓRFÃ** | elevenlabs-stt/index.ts:81 | ELEVENLABS_API_KEY | fatia de integrações (só listada). Nenhum chamador (só teste de contrato). |
| `elevenlabs-tts` | FE components/settings/AIAssistantSettings.tsx:77 | **REAL** | elevenlabs-tts/index.ts:89 | ELEVENLABS_API_KEY | fatia de integrações (só listada) |
| `elevenlabs-voice` | FE hooks/useElevenLabsVoice.ts:128 | **REAL** | elevenlabs-voice/index.ts:69 | ELEVENLABS_API_KEY | fatia de integrações (só listada) |
| `email-bulk-retry` | cron */15min (mig 20260910153000:111); FE hooks/email/useFailedDrafts.ts:84 | **QUEBRADA** | email-bulk-retry/index.ts:193 | BULK_EMAIL_FROM +UNSUBSCRIBE_SECRET +_internal_secrets (tabela) | fatia de integrações (só listada). RPC enqueue_email não existe em migrations nem types.ts. |
| `email-bulk-send` | FE hooks/engagement/useBulkComposer.ts:170 | **QUEBRADA** | email-bulk-send/index.ts:128,148 | BULK_EMAIL_FROM +UNSUBSCRIBE_SECRET | fatia de integrações (só listada). RPC enqueue_email inexistente → job marcado failed "email_infra_missing". |
| `email-composer-bulk` | FE hooks/engagement/useBulkComposer.ts:46 | **REAL** | email-composer-bulk/index.ts:195 | LOVABLE_API_KEY | Fallback determinístico sem IA. |
| `email-engagement-scorer` | FE hooks/engagement/useEmailEngagementScore.ts:98 | **REAL** | email-engagement-scorer/index.ts:159 | — (só SUPABASE_*) | — |
| `email-unsubscribe` | link público nos e-mails (_shared/unsubscribe.ts:73); FN _shared/unsubscribe.ts:73 | **REAL** | email-unsubscribe/index.ts:92 | +UNSUBSCRIBE_SECRET | fatia de integrações (só listada) |
| `engagement-score-recompute` | FE hooks/engagement/useEngagementScore.ts:103 | **REAL** | engagement-score-recompute/index.ts:58 | — (só SUPABASE_*) | Wrapper da RPC bulk_recompute_engagement. |
| `enrich-lead` | FE hooks/useLeadEnrichment.ts:31 | **STUB** | enrich-lead/index.ts:35-47 | — (só SUPABASE_*) | Retorna sempre 503 "enrichment_provider_not_configured"; FE useLeadEnrichment.ts:31 chama. Falta provedor de dados. |
| `execute-workflow` | FE hooks/automation/useAutomationWorkflows.ts:141 | **REAL** | execute-workflow/index.ts:90 | — (só SUPABASE_*) | DUPLICATA conceitual de workflow-executor (automation_workflows vs workflows). |
| `expansion-detector` | FE components/customer-success/HelpdeskConnectorPanel.tsx:124 | **REAL** | expansion-detector/index.ts:193 | — (só SUPABASE_*) | Só manual. |
| `export-winloss-pdf` | FE components/win-loss/ExportPdfButton.tsx:18 | **PARCIAL** | export-winloss-pdf/index.ts:69-70 | — (só SUPABASE_*) | Nome promete PDF; gera Markdown (".md") — comentário admite "emit Markdown for now". |
| `external-db-bridge` | FE components/admin/ExternalDBSettings.tsx:27 | **REAL** | external-db-bridge/index.ts:57 | EXTERNAL_SUPABASE_ANON_KEY, EXTERNAL_SUPABASE_URL | fatia de integrações (só listada) |
| `extract-coaching-actions` | FE hooks/conversational/useCoachingActions.ts:65, hooks/conversational/useTranscribeRecording.ts:45 | **REAL** | extract-coaching-actions/index.ts:229 | LOVABLE_API_KEY | DUPLICATA de generate-coaching-actions (ambas gravam coaching_actions). |
| `extract-committee-from-call` | FE hooks/deal-intelligence/useCommitteeCoverage.ts:162 | **REAL** | extract-committee-from-call/index.ts:231 | LOVABLE_API_KEY | DUPLICATA parcial de extract-deal-stakeholders (ambas gravam deal_stakeholders). |
| `extract-deal-stakeholders` | FE hooks/deal-intelligence/useDealStakeholders.ts:142 | **REAL** | extract-deal-stakeholders/index.ts:246 | LOVABLE_API_KEY | DUPLICATA parcial de extract-committee-from-call. |
| `forecast-narrative` | FE components/revenue-intelligence/ForecastNarrative.tsx:28; FN ai-copilot/index.ts:84 | **REAL** | forecast-narrative/index.ts:216 | LOVABLE_API_KEY | — |
| `generate-coaching-actions` | FN ai-copilot/index.ts:106 | **ÓRFÃ** | generate-coaching-actions/index.ts:2 | LOVABLE_API_KEY +_internal_secrets (tabela) | Diz ser chamada "por trigger via pg_net" — trigger não existe em migrations; só ai-copilot (órfã) chama. Duplica extract-coaching-actions. |
| `generate-executive-briefing` | FE hooks/executive-briefing/useGenerateBriefing.ts:11 | **REAL** | generate-executive-briefing/index.ts:247 | LOVABLE_API_KEY | Chama pipeline-pulse-aggregator via HTTP (index.ts:95). |
| `generate-loss-coaching` | **nenhum** | **ÓRFÃ** | generate-loss-coaching/index.ts:26-27 | LOVABLE_API_KEY | Sem chamador. Usa service_role sem checar papel/posse do analysis_id. |
| `generate-revenue-forecast` | FE hooks/revenue-intelligence/useRevenueForecast.ts:111 | **REAL** | generate-revenue-forecast/index.ts:268 | LOVABLE_API_KEY | DUPLICATA conceitual de revenue-forecast-ai. |
| `generate-urgent-client-tasks` | cron horário (mig 20260831163000:97); FE pages/AdminFilaTarefasAutomaticas.tsx:80 | **REAL** | generate-urgent-client-tasks/index.ts:204 | +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `geocode-proxy` | FE components/map/ClientsMap.tsx:96 | **REAL** | geocode-proxy/index.ts:156 | — (só SUPABASE_*) | Nominatim + geocode_cache. |
| `get-client-ip` | só script scripts/load/k6-smoke.js:25 | **ÓRFÃ** | get-client-ip/index.ts:1 | — (só SUPABASE_*) | Só k6; nenhum uso no front. |
| `health` | monitor externo + .github/workflows/deploy.yml:154-156 + scripts/smoke-target-backend.ts:59 | **REAL** | health/index.ts:1 | APP_VERSION | Utilitário (não lê banco). |
| `helpdesk-sync` | FE components/customer-success/HelpdeskConnectorPanel.tsx:44 | **REAL** | helpdesk-sync/index.ts:164 | FRESHDESK_API_KEY, FRESHDESK_DOMAIN, INTERCOM_ACCESS_TOKEN, ZENDESK_API_TOKEN, ZENDESK_DOMAIN, ZENDESK_EMAIL +_internal_secrets (tabela) | fatia de integrações (só listada). Sem cron. |
| `inbound-email-webhook` | webhook externo (provedor de e-mail) | **REAL** | inbound-email-webhook/index.ts:110 | +UNSUBSCRIBE_SECRET | fatia de integrações (só listada) |
| `lead-scoring` | FE hooks/useLeadScoring.ts:111, hooks/useLeadScoring.ts:268 | **REAL** | lead-scoring/index.ts:216 | — (só SUPABASE_*) | Regras determinísticas; 5 erros de tipo legados. |
| `log-web-vitals` | FE lib/webVitals.ts:7 | **REAL** | log-web-vitals/index.ts:113 | — (só SUPABASE_*) | — |
| `mine-win-loss-patterns` | FE hooks/deal-intelligence/useWinLoss.ts:141, hooks/win-loss/useRunWinLossAnalysis.ts:17 | **REAL** | mine-win-loss-patterns/index.ts:309 | LOVABLE_API_KEY | — |
| `multichannel-status-webhook` | webhook externo (Evolution/WhatsApp) | **REAL** | multichannel-status-webhook/index.ts:183 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `new-device-alert` | **nenhum** | **ÓRFÃ** | new-device-alert/index.ts:253 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) | fatia de integrações (só listada). Ninguém chama; é o único chamador de send-push-notification. |
| `next-best-action` | FE hooks/useNextBestAction.ts:44 | **REAL** | next-best-action/index.ts:415 | LOVABLE_API_KEY | — |
| `nlq-query` | FE hooks/nlq/useNLQ.ts:53 | **REAL** | nlq-query/index.ts:220 | LOVABLE_API_KEY | — |
| `notify-critical-pattern` | trigger win_loss_patterns (mig 20260420210849:54-90) | **QUEBRADA** | migrations/20260420210849:65-75 | ADMIN_NOTIFICATION_EMAIL, RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) | Trigger usa GUC app.functions_url (não definido em migrations) e posta sem Authorization → 401 (verify_jwt padrão) ou no-op; erro engolido. HTML sem escape (index.ts:30). |
| `notify-quote-conversion` | FE hooks/useQuotes.ts:336 | **REAL** | notify-quote-conversion/index.ts:103 | QUOTE_CONVERSION_WEBHOOK_URL, SLACK_WEBHOOK_URL | — |
| `notify-ranking-position` | FE hooks/useRankingNotifications.ts:90 | **REAL** | notify-ranking-position/index.ts:125 | — (só SUPABASE_*) | Só manual. |
| `notify-v4-quote-status` | cron */5min (mig 20260910153000:70); FE hooks/admin/useV4Callbacks.ts:229 | **REAL** | notify-v4-quote-status/index.ts:178 | V4_CALLBACK_API_KEY, V4_CALLBACK_URL +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `onboarding-launcher` | FE components/customer-success/HelpdeskConnectorPanel.tsx:83 | **REAL** | onboarding-launcher/index.ts:151 | — (só SUPABASE_*) | — |
| `personal-assistant-stream` | FE hooks/assistant/usePersonalAssistant.ts:12 | **REAL** | personal-assistant-stream/index.ts:381 | LOVABLE_API_KEY | É o "AI Copilot" efetivo do MainLayout. |
| `pipeline-pulse-aggregator` | FE hooks/pipeline-pulse/usePipelinePulse.ts:10; FN generate-executive-briefing/index.ts:95 | **REAL** | pipeline-pulse-aggregator/index.ts:100 | — (só SUPABASE_*) | — |
| `predict-deal-velocity` | FE hooks/deal-intelligence/useDealVelocity.ts:76 | **ÓRFÃ** | src/components/deal-intelligence/DealVelocityCard.tsx:19 (componente sem import) | LOVABLE_API_KEY | Único chamador (DealVelocityCard) nunca é importado — 613 linhas inalcançáveis. |
| `predict-quota-attainment` | FE hooks/revenue/useQuotaAttainment.ts:123 | **REAL** | predict-quota-attainment/index.ts:99 | LOVABLE_API_KEY | Monte Carlo com Math.random é legítimo (index.ts:18-31). |
| `predictive-intelligence` | FE hooks/usePredictiveIntelligence.ts:60 | **REAL** | predictive-intelligence/index.ts:265 | LOVABLE_API_KEY | — |
| `predictive-scoring-explain` | FE hooks/scoring/useExplainBatch.ts:16, hooks/scoring/useLeadScoreExplanation.ts:28 | **REAL** | predictive-scoring-explain/index.ts:212 | LOVABLE_API_KEY | 7 erros de tipo legados. |
| `pricing-intelligence` | FE hooks/usePricingIntelligence.ts:80 | **REAL** | pricing-intelligence/index.ts:124 | — (só SUPABASE_*) | Heurística (sem IA apesar do nome). |
| `process-cadence-tasks` | FE pages/Cadencias.tsx:73 | **PARCIAL** | process-cadence-tasks/index.ts:56 (auth interna); src/pages/Cadencias.tsx:69-73 (useEffect) | — (só SUPABASE_*) | Só roda quando alguém abre a página Cadências (useEffect); sem cron → cadência não avança sozinha. |
| `process-call-recording-ingest` | cron 1min (mig 20260910153000:94); FE hooks/conversational/useUploadCallRecording.ts:85 | **REAL** | process-call-recording-ingest/index.ts:106 | +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `process-race-event` | FE hooks/race/useRaceTrigger.ts:9 | **PARCIAL** | src/hooks/sales/useSalesData.ts:64 | — (só SUPABASE_*) | Disparada só pelo front ao criar venda; vendas via Bitrix/import/API não atualizam a corrida (sem trigger no banco). |
| `process-scheduled-sends` | **nenhum** | **ÓRFÃ** | process-scheduled-sends/index.ts:53 | — (só SUPABASE_*) | Nenhum cron/chamador: linhas em scheduled_sends (criadas por schedule-optimal-send) nunca são enviadas. |
| `purchase-intelligence-forecast` | FE hooks/purchase-intelligence/usePurchaseIntelligence.ts:71 | **REAL** | purchase-intelligence-forecast/index.ts:50 | LOVABLE_API_KEY | — |
| `push-subscribe` | FE hooks/usePushNotifications.ts:58, hooks/usePushNotifications.ts:136 (+1) | **REAL** | push-subscribe/index.ts:128 | VAPID_PUBLIC_KEY | fatia de integrações (só listada) |
| `qbr-generator` | FE hooks/revenue/useRevenueIntelligenceHub.ts:201 | **REAL** | qbr-generator/index.ts:126 | LOVABLE_API_KEY | — |
| `qbr-scheduler` | FE components/customer-success/HelpdeskConnectorPanel.tsx:101 | **REAL** | qbr-scheduler/index.ts:168 | — (só SUPABASE_*) | Só manual. |
| `race-commentary` | FE hooks/race/useRaceCommentary.ts:77 | **REAL** | race-commentary/index.ts:118 | LOVABLE_API_KEY | IA sobre payload do cliente; não persiste. |
| `ranking-api` | só script scripts/load/k6-smoke.js:26 | **ÓRFÃ+QUEBRADA** | ranking-api/index.ts:89,167,186,262,317,382 | — (só SUPABASE_*) | Sem chamador interno (só k6). Tabela `team_members` inexistente → toda rota com token de equipe falha. |
| `receive-quote-sync` | webhook externo (V4/PromoGifts, HMAC) | **REAL** | receive-quote-sync/index.ts:79 | PROMOGIFTS_WEBHOOK_SECRET, QUOTE_SYNC_WEBHOOK_SECRET | — |
| `receive-quote-webhook` | webhook externo (gift_store, x-api-key) | **REAL** | receive-quote-webhook/index.ts:154 | QUOTE_SYNC_API_KEY | — |
| `recompute-stage-baselines` | FE hooks/deal-intelligence/useStageVelocity.ts:132 | **REAL** | recompute-stage-baselines/index.ts:66 | — (só SUPABASE_*) | DUPLICATA de refresh-stage-baselines (mesma tabela, chaves diferentes). |
| `refresh-stage-baselines` | FE hooks/deal-intelligence/useStageBaselines.ts:39 | **QUEBRADA** | refresh-stage-baselines/index.ts:117-121 | — (só SUPABASE_*) | upsert onConflict "stage,owner_id" sem constraint correspondente (índice é de expressão COALESCE — mig 20260418011827:63) e linhas por vendedor violam UNIQUE(stage,segment) (mig 20260418122634:14). Erro só vai p/ console; UI mostra sucesso. |
| `renewal-automation` | FE components/customer-success/HelpdeskConnectorPanel.tsx:61 | **REAL** | renewal-automation/index.ts:145 | — (só SUPABASE_*) | Só manual. |
| `report-builder-execute` | FE hooks/reporting/useReportExecution.ts:33 | **PARCIAL** | report-builder-execute/index.ts:30 | — (só SUPABASE_*) | Entidade "leads" permitida mas tabela não existe. |
| `report-embed-public` | embed público por token (x-embed-token); FE hooks/reporting/useEmbeddedReportPreview.ts:5 | **PARCIAL** | report-embed-public/index.ts:18,31 | — (só SUPABASE_*) | Entidade "leads" permitida mas tabela não existe. |
| `revenue-forecast-ai` | FE components/dashboard/PredictiveRevenueForecast.tsx:19, hooks/forecast/useRevenueForecast.ts:57 (+1) | **REAL** | revenue-forecast-ai/index.ts:162 | LOVABLE_API_KEY | Narrativa vazia silenciosa sem LOVABLE_API_KEY. |
| `revenue-intelligence` | FE hooks/revenue/useRevenueIntelligenceHub.ts:63 | **PARCIAL** | revenue-intelligence/index.ts:58 | — (só SUPABASE_*) | Meta inventada: max(fechado×1,2; R$50.000) — ignora sales_goals. |
| `revops-hub` | FE hooks/useRevOpsHub.ts:37 | **PARCIAL** | revops-hub/index.ts:113 | — (só SUPABASE_*) | Meta mensal inventada: fechado×1,2 ou R$100.000. |
| `rotate-daily-challenges` | FE components/gamification/DailyChallengesCard.tsx:58, pages/HistoricoDesafiosDiarios.tsx:83 | **PARCIAL** | rotate-daily-challenges/index.ts:12-20,80 | — (só SUPABASE_*) | "Rotação diária" só por botão; sem cron. Sorteio Math.random de templates fixos (index.ts:12-20,80). |
| `run-retry-tests` | FE hooks/useRetryTestRun.ts:26 | **REAL** | run-retry-tests/index.ts:1 | — (só SUPABASE_*) | Harness de teste exposto em produção (rota /retry-test-status); sem auth na função (comentário index.ts:10). |
| `sales-assistant-chat` | FE hooks/sales/useSalesAssistant.ts:191 | **REAL** | sales-assistant-chat/index.ts:391 | LOVABLE_API_KEY | — |
| `salesperson-coaching` | FE components/analytics/CoachingComparison.tsx:24 | **REAL** | salesperson-coaching/index.ts:216 | LOVABLE_API_KEY | — |
| `schedule-optimal-send` | FE hooks/sequences/useSendTimeOptimization.ts:121 | **PARCIAL** | schedule-optimal-send/index.ts:66 | — (só SUPABASE_*) | Cria scheduled_sends, mas process-scheduled-sends nunca roda. |
| `scheduled-report-trigger` | FE hooks/reporting/useTriggerScheduledReport.ts:10 | **REAL** | scheduled-report-trigger/index.ts:39 | — (só SUPABASE_*) | Disparo manual do runner. |
| `scheduled-reports-runner` | FN scheduled-report-trigger/index.ts:52 | **PARCIAL** | scheduled-reports-runner/index.ts:15,136 | +_internal_secrets (tabela) | Sem cron (só via trigger manual). `recipients` é lido e nunca usado: gera CSV/JSON no storage, não entrega a ninguém. |
| `sdr-consecutive-alerts` | FE components/sdr/TestSDRAlertButton.tsx:15 | **PARCIAL** | sdr-consecutive-alerts/index.ts:349 (cron-auth); AdminSystemStatus.tsx:30 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Desenhada p/ cron; só botão de teste (UI diz "8h diário"). |
| `semantic-coverage` | FE hooks/semantic/useSemanticCoverage.ts:20 | **REAL** | semantic-coverage/index.ts:28 | — (só SUPABASE_*) | — |
| `semantic-index-entity` | FE hooks/semantic/useIndexEntity.ts:11; FN semantic-reindex-batch/index.ts:89 | **REAL** | semantic-index-entity/index.ts:276 | LOVABLE_API_KEY | Embeddings via gateway Lovable /v1/embeddings. |
| `semantic-reindex-batch` | FE hooks/semantic/useReindexBatch.ts:26 | **REAL** | semantic-reindex-batch/index.ts:38 | — (só SUPABASE_*) | — |
| `semantic-search` | FE hooks/useSemanticSearch.ts:34 | **REAL** | semantic-search/index.ts:199 | LOVABLE_API_KEY | Busca de PRODUTOS (intenção por LLM + rpc search_products_semantic). |
| `semantic-search-universal` | FE hooks/semantic/useSemanticSearch.ts:26 | **REAL** | semantic-search-universal/index.ts:112 | LOVABLE_API_KEY | Busca vetorial multi-entidade (match_semantic). |
| `send-alert-notifications` | FE components/notifications/NotificationPreferenceCard.tsx:66 | **PARCIAL** | send-alert-notifications/index.ts:271 (cron-auth) | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Desenhada p/ cron; só botão "testar". |
| `send-churn-alert-email` | FE pages/AdminAlertasChurn.tsx:156 | **QUEBRADA** | send-churn-alert-email/index.ts:117-129 | — (só SUPABASE_*) | RPC enqueue_email inexistente → retorna 400 needsEmailSetup. |
| `send-multichannel-message` | FE hooks/multichannel/useChannelCredentials.ts:106; FN process-cadence-tasks/index.ts:174, process-scheduled-sends/index.ts:53, send-quote-to-client/index.ts:194, sequence-runner/index.ts:671 | **REAL** | send-multichannel-message/index.ts:257 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `send-password-reset` | FE components/security/PasswordResetApproval.tsx:84 | **REAL** | send-password-reset/index.ts:174 | RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) | fatia de integrações (só listada) |
| `send-push-notification` | FN new-device-alert/index.ts:253 | **ÓRFÃ** | new-device-alert/index.ts:253 | — (só SUPABASE_*) | fatia de integrações (só listada). Único chamador é new-device-alert (órfã) → push nunca é enviado. |
| `send-quote-to-client` | **nenhum** | **ÓRFÃ** | send-quote-to-client/index.ts:179,194 | — (só SUPABASE_*) | Lógica real (e-mail + WhatsApp), citada no CLAUDE.md §3.1, mas nada a chama. |
| `send-time-optimizer` | FE hooks/engagement/useSendTimeOptimization.ts:36 | **REAL** | send-time-optimizer/index.ts:160 | — (só SUPABASE_*) | — |
| `send-transactional-email` | FE hooks/email/useComposeEmail.ts:72; FN process-cadence-tasks/index.ts:162, send-quote-to-client/index.ts:179, sequence-runner/index.ts:630 | **REAL** | send-transactional-email/index.ts:149 | BULK_EMAIL_FROM, RESEND_API_KEY +UNSUBSCRIBE_SECRET | fatia de integrações (só listada) |
| `sequence-ab-promote` | FE hooks/sequences/usePromoteWinners.ts:9 | **REAL** | sequence-ab-promote/index.ts:42 | — (só SUPABASE_*) | Wrapper de RPC. |
| `sequence-enroll` | FE hooks/sequences/useEnrollContacts.ts:14 | **REAL** | sequence-enroll/index.ts:87 | — (só SUPABASE_*) | Aceita contact_type "lead" (index.ts:7) que o runner não consegue processar. |
| `sequence-record-reply` | **nenhum** | **ÓRFÃ** | sequence-record-reply/index.ts:1-60 | — (só SUPABASE_*) | Nenhum chamador (inbound-email-webhook não a invoca) → respostas nunca param a sequência/AB. |
| `sequence-runner` | FE hooks/sequences/useEnrollContacts.ts:37 | **PARCIAL+QUEBRADA** | sequence-runner/index.ts:280,366 | — (só SUPABASE_*) | Sem cron (só botão useEnrollContacts.ts:37). Matrícula com contact_type="lead" consulta `leads` inexistente → chunkedIn lança e aborta o lote inteiro. |
| `simulate-load` | **nenhum** | **ÓRFÃ** | simulate-load/index.ts:76 | — (só SUPABASE_*) | Ferramenta de carga; nenhum chamador (comentário admite). |
| `snapshot-forecast` | FE hooks/revenue-intelligence/useForecastAccuracy.ts:118 | **PARCIAL** | snapshot-forecast/index.ts:95 | — (só SUPABASE_*) | Só manual; sem cron de snapshot → compute-forecast-accuracy não tem série. |
| `start-race-season` | FE hooks/race/useStartRaceSeason.ts:24 | **REAL** | start-race-season/index.ts:95 | — (só SUPABASE_*) | Math.random só para número/cor do carro (cosmético). |
| `stress-test-contracts` | FE components/debug/WebhookSimulationPanel.tsx:43 | **STUB** | stress-test-contracts/index.ts:84 | — (só SUPABASE_*) | Simulador: cenários sorteados com Math.random, exposto no painel WebhooksPage. |
| `summarize-call-recording` | FE hooks/conversational/useSummarizeRecording.ts:10, hooks/conversational/useTranscribeRecording.ts:30 | **REAL** | summarize-call-recording/index.ts:196 | LOVABLE_API_KEY | — |
| `territory-optimization` | FE hooks/useTerritoryOptimization.ts:70 | **REAL** | territory-optimization/index.ts:131 | — (só SUPABASE_*) | Heurística (potencial = max(p75; total×1,2)). |
| `test-integration-connection` | FE hooks/admin/useIntegrationConnections.ts:130 | **REAL** | test-integration-connection/index.ts:168 | EXTERNAL_SUPABASE_ANON_KEY | — |
| `transcribe-call-recording` | FE hooks/conversational/useTranscribeRecording.ts:10 | **REAL** | transcribe-call-recording/index.ts:79 | LOVABLE_API_KEY | Áudio inteiro em base64 para Gemini via gateway Lovable (index.ts:136-164). |
| `twilio-call-status` | callback Twilio (URL montada em twilio-click-to-call:192); FN twilio-click-to-call/index.ts:192 | **REAL** | twilio-call-status/index.ts:162 | TWILIO_AUTH_TOKEN, TWILIO_CALL_STATUS_URL | fatia de integrações (só listada) |
| `twilio-call-twiml` | callback Twilio (URL montada em twilio-click-to-call:191); FN twilio-click-to-call/index.ts:191 | **REAL** | twilio-call-twiml/index.ts:76 | TWILIO_AUTH_TOKEN, TWILIO_TWIML_URL | fatia de integrações (só listada) |
| `twilio-click-to-call` | FE hooks/dialer/useClickToCall.ts:46 | **REAL** | twilio-click-to-call/index.ts:268 | TWILIO_ALLOWED_DIAL_PREFIXES | fatia de integrações (só listada) |
| `visual-search` | FE components/search/VisualSearchButton.tsx:75 | **REAL** | visual-search/index.ts:244 | LOVABLE_API_KEY | — |
| `wal-health-alert` | cron */5min (mig 20261001144000:77) | **REAL** | wal-health-alert/index.ts:131 | SLACK_WEBHOOK_URL, WAL_MAX_SLOT_LAG_BYTES, WAL_SIZE_ALERT_BYTES +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +_internal_secrets (tabela) | Depende de _internal_secrets. |
| `webauthn` | FE hooks/useWebAuthn.ts:34, hooks/useWebAuthn.ts:63 (+4) | **REAL** | webauthn/index.ts:199 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `webvitals-regression-alert` | cron diário 11:15 UTC (mig 20261002010000:82) | **REAL** | webvitals-regression-alert/index.ts:266 | SLACK_WEBHOOK_URL, WEBVITALS_MIN_BASELINE_DAYS, WEBVITALS_MIN_DAY_SAMPLES, WEBVITALS_REGRESSION_FACTOR +_internal_secrets (tabela) | Depende de _internal_secrets + SLACK_WEBHOOK_URL. |
| `winloss-webhook-dispatcher` | FN run-retry-tests/index.ts:3, run-retry-tests/index.ts:153, winloss-webhook-replay/index.ts:348 | **REAL** | winloss-webhook-dispatcher/index.ts:36 | +_internal_secrets (tabela) | fatia de integrações (só listada) |
| `winloss-webhook-health-monitor` | cron */15min (mig 20261001144000:86) | **REAL** | winloss-webhook-health-monitor/index.ts:698 | ADMIN_NOTIFICATION_EMAIL, ALERT_CONSECUTIVE_FAILURES, ALERT_MAX_ATTEMPTS, ALERT_MIN_DELIVERIES, ALERT_RETRY_RATE_THRESHOLD, ALERT_SUPPRESS_MINUTES, ALERT_WINDOW_MINUTES, RESEND_API_KEY +alert-escalation (RESEND/SLACK_ALERT/ALERT_*) +METRICS_INGEST_* +_internal_secrets (tabela) | fatia de integrações (só listada) |
| `winloss-webhook-replay` | FE hooks/win-loss/useAsyncReplayQueue.ts:62, hooks/win-loss/useWebhookDeadLetters.ts:96 (+1); FN winloss-webhook-replay-batch/index.ts:172 | **REAL** | winloss-webhook-replay/index.ts:149 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `winloss-webhook-replay-batch` | **nenhum** | **ÓRFÃ** | winloss-webhook-replay-batch/index.ts:129 | — (só SUPABASE_*) | fatia de integrações (só listada). Nenhum chamador. |
| `winloss-webhook-timeline` | FE hooks/win-loss/useWebhookTimeline.ts:72 | **REAL** | winloss-webhook-timeline/index.ts:70 | — (só SUPABASE_*) | fatia de integrações (só listada) |
| `workflow-executor` | FE hooks/useWorkflows.ts:136 | **REAL** | workflow-executor/index.ts:96 | — (só SUPABASE_*) | DUPLICATA conceitual de execute-workflow. |

## 2. Stubs, parciais e quebradas em detalhe

### 2.1 STUB (2)

| Function | Evidência | Detalhe | O que falta |
|---|---|---|---|
| `enrich-lead` | `enrich-lead/index.ts:35-47` | Autentica o usuário e responde sempre 503 `enrichment_provider_not_configured`. Pelo comentário, a versão anterior "inventava atributos aleatórios". A UI continua chamando (`src/hooks/useLeadEnrichment.ts:31`), então o botão de enriquecer lead sempre falha. | Contratar um provedor (Lusha, CNPJ.ws, Receita etc.), gravar em `clients`/`sales` e registrar a origem do dado. Outra opção é tirar o botão da UI. |
| `stress-test-contracts` | `stress-test-contracts/index.ts:84` | Simulador que sorteia cenários com `Math.random`. Está exposto em produção no `WebhookSimulationPanel` de `src/pages/WebhooksPage.tsx`. | Restringir a dev/admin, ou remover do bundle de produção. |

### 2.2 QUEBRADA (5, mais 2 mistas)

| Function | Evidência | Por que quebra | Correção |
|---|---|---|---|
| `refresh-stage-baselines` | `refresh-stage-baselines/index.ts:117-121`; `migrations/20260418011827…:63`; `migrations/20260418122634…:14` | Usa `upsert(..., {onConflict:'stage,owner_id'})`, mas não existe constraint com essas colunas: o único índice é de expressão, `(stage, COALESCE(owner_id,…))`, e o Postgres recusa o ON CONFLICT. Além disso, as linhas por vendedor herdam `segment='all'` e violam `UNIQUE(stage,segment)`. O erro só aparece no `console.error`, a resposta é 200 com `upserted:0` e a UI (`useStageBaselines.ts:34-48`) mostra o toast "Baselines atualizadas". | Unificar com `recompute-stage-baselines` (ver §5) ou criar `UNIQUE(stage, owner_id, segment)` e preencher `segment`. |
| `notify-critical-pattern` | `migrations/20260420210849…:54-90`; `notify-critical-pattern/index.ts:28-31` | O trigger em `win_loss_patterns` lê o GUC `app.functions_url`, que nenhuma migration define, então vira no-op. Se o GUC for definido, o POST sai sem `Authorization`; como a function não está no `config.toml` (verify_jwt=true), recebe 401. O `EXCEPTION WHEN OTHERS THEN NULL` esconde o erro. Há também HTML montado sem escape de `body.name`. | Migrar o trigger para `_internal_secrets` com `X-Cron-Secret` (mesmo padrão de `trigger_internal_edge_job`) e escapar o HTML. |
| `email-bulk-send`, `email-bulk-retry`, `send-churn-alert-email` | `email-bulk-send/index.ts:128,148`; `email-bulk-retry/index.ts:193`; `send-churn-alert-email/index.ts:117-129` | Chamam a RPC `enqueue_email` (infra de e-mail do Lovable), que não existe em nenhuma migration nem em `types.ts`. O código já prevê isso: marca o job como `failed/email_infra_missing` ou responde 400 `needsEmailSetup`. O e-mail em massa e o alerta de churn por e-mail nunca saem. | Fatia de e-mail. Trocar por `send-transactional-email` (Resend direto) ou criar a fila. |
| `sequence-runner` (PARCIAL+QUEBRADA) | `sequence-runner/index.ts:280,366`; `_shared/chunked-in.ts:50,58`; `sequence-enroll/index.ts:7` | `sequence-enroll` aceita `contact_type='lead'`. O runner então consulta a tabela `leads`, que não existe, e `chunkedIn` lança exceção, abortando o lote inteiro: um único contato "lead" trava todas as sequências do ciclo. Além disso, o runner não tem cron e só roda pelo botão em `useEnrollContacts.ts:37`. | Mapear "lead" para `sales`/`clients` (ou bloquear no enroll) e agendar o runner por cron. |
| `ranking-api` (ÓRFÃ+QUEBRADA) | `ranking-api/index.ts:89,167,186,262,317,382` | É a API pública por token. Toda rota com `tokenData.team_id` consulta `team_members`, que não existe (só existe `race_team_members`). Não há chamador interno, só o k6. | Apontar para a tabela real de equipes ou remover. |

### 2.3 PARCIAL: feitas para cron, mas sem agendamento

Todas aceitam `X-Cron-Secret` (`_shared/cron-request-auth.ts`) ou auth interna, mas **não há `cron.schedule` para elas nas 644 migrations**. Só rodam quando alguém clica em "testar" ou "rodar agora". `src/components/admin/AdminSystemStatus.tsx:29-36` exibe agendas que não existem ("8h diário", "15h diário", "Horário", "6h diário").

| Function | Única forma de disparo hoje | Impacto |
|---|---|---|
| `check-lead-sla` | `BackendAutomationMonitor.tsx:43` | O SLA de leads não é vigiado. |
| `sdr-consecutive-alerts` | `TestSDRAlertButton.tsx:15` | Alertas de SDR não saem. |
| `activity-goal-alerts` | `BackendAutomationMonitor.tsx:34` | Alertas de meta de atividade não saem. |
| `challenge-expiration-alerts` | `BackendAutomationMonitor.tsx:51` | Gamificação sem aviso de expiração. |
| `auto-reassign-inactive` | `BackendAutomationMonitor.tsx:59` | Carteiras inativas não são redistribuídas. Além disso, o "round_robin" é `sort(()=>Math.random()-0.5)` (`index.ts:250`). |
| `send-alert-notifications` | `NotificationPreferenceCard.tsx:66` (botão de teste) | Os alertas críticos configurados pelo usuário não disparam. |
| `access-denied-alerts` | `AccessDeniedLogs.tsx:45` | Exige JWT de admin (`index.ts:159-161`), então nem poderia ir para cron como está. |
| `process-cadence-tasks` | `useEffect` ao abrir `src/pages/Cadencias.tsx:69-73` | A cadência só avança quando alguém abre a página. |
| `sequence-runner` | botão (`useEnrollContacts.ts:37`) | As sequências não avançam sozinhas. |
| `process-scheduled-sends` | nenhuma | Ver §3. Os envios agendados nunca saem. |
| `check-quote-expiration` | nenhuma | Ver §3. |
| `scheduled-reports-runner` | `scheduled-report-trigger` (manual) | Relatórios "agendados" não rodam no horário. |
| `rotate-daily-challenges` | botão (`DailyChallengesCard.tsx:58`) | A "rotação diária" só acontece se alguém clicar. |
| `snapshot-forecast` e `compute-forecast-accuracy` | botões (`useForecastAccuracy.ts:118,137`) | O painel de acurácia de forecast fica sem série temporal. |
| `bitrix24-sync`, `helpdesk-sync` | botões | Fatia de integrações. A UI diz "Horário". |
| `renewal-automation`, `qbr-scheduler`, `expansion-detector`, `create-stagnant-tasks`, `notify-ranking-position`, `auto-enroll-cadence` | botões | São automações de CS, pipeline e ranking que só rodam à mão. Estão como REAL na tabela porque a lógica está completa. |

### 2.4 PARCIAL: metas e parâmetros inventados

| Function | Evidência | Valor inventado |
|---|---|---|
| `revenue-intelligence` | `revenue-intelligence/index.ts:58` | `target = max(fechado × 1,2; 50.000)`. Ignora `sales_goals` e `salespeople.monthly_goal`, que existem e são usados em `generate-revenue-forecast:125` e `predict-quota-attainment:155`. |
| `revops-hub` | `revops-hub/index.ts:113` | `monthlyTarget = fechado × 1,2 ou 100.000`. |
| `analyze-pipeline-coverage` | `analyze-pipeline-coverage/index.ts:66,91` | Quota por dono = `max(período anterior × 1,2; 50.000)`. |
| `coaching-intelligence` | `coaching-intelligence/index.ts:61` | O score de receita satura em R$50k ("50k = max"), igual para qualquer vendedor. |

### 2.5 PARCIAL: a entrega prometida não acontece

| Function | Evidência | Detalhe |
|---|---|---|
| `csat-ces-trigger` | `csat-ces-trigger/index.ts:76-83` | Insere em `csat_ces_surveys` com `sent_at=now()`, mas não envia e-mail, link nem WhatsApp. A pesquisa nunca chega ao cliente. |
| `scheduled-reports-runner` | `scheduled-reports-runner/index.ts:15,64-71,136` | Lê `recipients` e nunca usa. Gera CSV/JSON no storage e não entrega a ninguém. Formatos aceitos: só csv/json. |
| `export-winloss-pdf` | `export-winloss-pdf/index.ts:69-70,88` | Promete PDF e gera `.md`; o comentário diz "emit Markdown for now". |
| `schedule-optimal-send` | cria `scheduled_sends` | Nada consome a fila (`process-scheduled-sends` é órfã). |
| `process-race-event` | `src/hooks/sales/useSalesData.ts:64` | Só é disparada pelo front quando a venda é criada na UI. Vendas vindas de Bitrix, `receive-quote-*` ou import não movem a corrida, porque não há trigger SQL. |

### 2.6 PARCIAL: tabela inexistente em parte do fluxo

| Function | Evidência | Tabela ausente |
|---|---|---|
| `ai-agent-orchestrator` | `ai-agent-orchestrator/index.ts:199,262,300` | `leads`. Contexto de lead vazio, e a tool `update_lead_score` falha. |
| `report-builder-execute` | `report-builder-execute/index.ts:30` | `leads` está na allowlist de entidades. |
| `report-embed-public` | `report-embed-public/index.ts:18,31` | idem. |

### 2.7 Riscos transversais (afetam funções marcadas REAL)

1. **Cadeia cron/trigger → edge depende de chaves que nenhuma migration cria.** `trigger_internal_edge_job` (`migrations/20261002010000…:14-70`), `trigger_campaign_health_alert` (`20261001160000:136`), `broadcast_sale_completed` (`20261001160000:41-130`) e `trigger_generate_urgent_client_tasks` / `trigger_detect_client_churn_alerts` (`20260831163000:5-90`) leem `_internal_secrets.functions_base_url` e `anon_key` e lançam `*_secrets_missing` quando faltam. Nenhuma migration grava essas chaves (grep vazio). `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:93-97` registra que `functions_base_url` "ainda não existe na tabela". Se continuar assim, **14 das 15 automações SQL→edge de §0 falham todas em silêncio** (a 15ª, `notify-critical-pattern`, está quebrada por outro motivo, ver §2.2), e o `cron-failure-alerter`, que também é HTTP, cai junto.
2. **46 functions de IA dependem de `LOVABLE_API_KEY`** e do host `ai.gateway.lovable.dev` (`_shared/ai-gateway.ts:4-9`). O projeto saiu do Lovable Cloud. Sem a chave, algumas functions lançam erro, como `behavioral-analysis` e `generate-loss-coaching`. Outras degradam em silêncio, como `revenue-forecast-ai`, que devolve narrativa vazia. Os embeddings (`/v1/embeddings`, `google/text-embedding-004`) também passam pelo gateway.
3. **Limite de 100 functions deployadas contra 172 no repo.** O `deploy.yml:131` faz `supabase functions deploy` de todas. Pelo menos 72 não sobem, e não há manifesto do que é prioritário. As 17 órfãs de §3 são as candidatas óbvias a sair.
4. **58 erros de tipo legados** em 29 functions (`scripts/deno-typecheck-baseline.json`). Eles não impedem o runtime: conferi que `getClaims` existe em `@supabase/auth-js@2.69.1`, resolvido pelo pin `supabase-js@2.49.4`.

## 3. Órfãs

| Function | Evidência de ausência de chamador | O que faz de fato | Recomendação |
|---|---|---|---|
| `check-quote-expiration` | Zero referências em src, migrations, functions e scripts | Expira cotações e cria notificações (`index.ts:88-102`) | **Agendar** (está no CLAUDE.md §3.1 como operação de venda). |
| `send-quote-to-client` | Zero referências | Envia a cotação por e-mail e WhatsApp (`index.ts:179,194`) | Ligar ao botão de enviar cotação, ou remover do CLAUDE.md. |
| `process-scheduled-sends` | Zero | Consome `scheduled_sends` e chama `send-multichannel-message` (`index.ts:53`) | **Agendar**. Sem ela, `schedule-optimal-send` e `send-time-optimizer` não servem para nada. |
| `sequence-record-reply` | Zero (`inbound-email-webhook` não a chama) | Marca a resposta na execução/variante da sequência (A/B) | Chamar a partir de `inbound-email-webhook`. |
| `analyze-pipeline-coverage` | Zero | Cobertura de pipeline + IA, gravando `pipeline_coverage_snapshots` | Ligar à UI depois de trocar a quota inventada, ou remover. |
| `generate-loss-coaching` | Zero | Lições de deals perdidos em `coaching_sessions`. Usa service_role sem checar papel | Remover, ou ligar a `analyze-win-loss` com authz. |
| `admin-conversion-trail` | Zero | Trilha de conversão quote→sale via RPC | Ligar a uma tela de admin ou remover. |
| `ai-copilot` | Só `scripts/load/k6-smoke.js:27` | Copilot com ações `forecast_narrative`/`coaching_plan`. O copilot real da UI é `personal-assistant-stream` (`MainLayout.tsx:213-216`) | Remover. O CLAUDE.md §3.2 está desatualizado. |
| `generate-coaching-actions` (transitiva) | Só `ai-copilot/index.ts:106`. O "trigger via pg_net" do cabeçalho (`index.ts:2`) não existe | Duplica `extract-coaching-actions` | Remover. |
| `predict-deal-velocity` (front morto) | Único chamador é `DealVelocityCard.tsx:19`, que nenhum arquivo importa | 613 linhas de previsão de velocidade | Montar o card no `AccountDetail`/pipeline, ou remover. |
| `ranking-api` | Só k6 | API pública de ranking, quebrada (§2.2) | Corrigir `team_members` ou remover. |
| `new-device-alert` | Zero | Alerta de novo dispositivo, chama `send-push-notification` | Fatia de segurança/push. |
| `send-push-notification` (transitiva) | Só `new-device-alert/index.ts:253` | Envio de Web Push | Hoje nenhum push é enviado em produção. |
| `winloss-webhook-replay-batch` | Zero | Replay em lote | Fatia de integrações. |
| `elevenlabs-stt` | Só teste de contrato | STT | Fatia de integrações. |
| `get-client-ip` | Só k6 | Devolve o IP | Remover. |
| `simulate-load` | Zero (o comentário admite) | Gera carga | Remover do deploy. |

## 4. Invocações para functions inexistentes

| Origem | Nome invocado | Efeito |
|---|---|---|
| `src/hooks/pipeline-pulse/useQuickAction.ts:16` (`fn: 'deal-health-scorer'`), invocado em `:42`, botão "Recomputar Health Scores" em `src/components/pipeline-pulse/QuickActionsPanel.tsx:17-20`, montado no `PipelinePulseHub` | `deal-health-scorer` | O botão sempre falha com 404. A function equivalente é `calculate-deal-health`. |
| `src/hooks/pipeline-pulse/useQuickAction.ts:21` (`fn: 'smart-lead-router'`), botão "Rotear leads pendentes" em `QuickActionsPanel.tsx:23-26` | `smart-lead-router` | O botão sempre falha. Não há function de roteamento de leads: `lead-scoring` e `auto-reassign-inactive` não roteiam fila. |
| `scripts/graphify/static-contracts.test.mjs:10` | `notify-sale` | Só fixture de teste, inofensivo. |

Também verifiquei:
- Migrations: todos os nomes em `trigger_internal_edge_job(...)`, na allowlist e nos `net.http_post` existem.
- Functions → functions: todos os alvos existem.
- CLAUDE.md §3-5: os 150 nomes citados existem como pasta, e `migrate-helper` está corretamente descrito como removido. O problema é o contrário: o CLAUDE.md apresenta como peças vivas `ai-copilot`, `check-quote-expiration` e `send-quote-to-client`, que são órfãs.

## 5. Duplicatas e sobreposições (qual está viva)

| Grupo | Diferença real | Chamador vivo | Veredito |
|---|---|---|---|
| `calibrate-win-probabilities` × `calibrate-win-probability` | A primeira grava `win_calibration_buckets` + `win_probability_deal_calibrations` (buckets). A segunda grava `win_probability_calibrations` + `deal_probability_scores` (blend com `stage_probabilities`). | **Ambas.** `WinProbabilityCalibratorPanel` e `WinProbabilityCalibrationPanel` aparecem na mesma tela (`RevenueIntelligenceHub.tsx`). | Duas probabilidades calibradas diferentes para o mesmo deal. Consolidar em uma. |
| `recompute-stage-baselines` × `refresh-stage-baselines` | Mesma tabela `stage_velocity_baselines`, com fontes diferentes (`deal_stage_transitions` × `deal_stage_history`) e colunas diferentes (`p50/p75/p90_hours`+`segment` × `avg/median/p75_days`+`owner_id`). | **Ambas** em `pages/DealIntelligence.tsx`: `StageBottlenecksChart` e `StageBaselinesPanel`. | `recompute` funciona; `refresh` está quebrada (§2.2). Ficar com `recompute` e acrescentar a dimensão por dono. |
| `execute-workflow` × `workflow-executor` | `automation_workflows`/`automation_runs` × `workflows`/`workflow_executions`. | **Ambas**: `AutomationBuilder` (`useAutomationWorkflows.ts:141`) e `WorkflowsPage` (`useWorkflows.ts:136`). | Dois motores de automação paralelos. Escolher um. |
| `extract-coaching-actions` × `generate-coaching-actions` | Ambas geram `coaching_actions` a partir do transcript. | Só `extract` (`useCoachingActions.ts:65`, `useTranscribeRecording.ts:45`). | Remover `generate`. |
| `extract-committee-from-call` × `extract-deal-stakeholders` | Ambas gravam `deal_stakeholders` a partir de `call_recordings`. | **Ambas** (`useCommitteeCoverage.ts:162` e `useDealStakeholders.ts:142`). | Risco de stakeholders duplicados. Consolidar. |
| `generate-revenue-forecast` × `revenue-forecast-ai` | `revenue_forecasts` + `sales_goals` × `revenue_forecast_view` (sem meta). | **Ambas**: `RevenueIntelligenceHub/AIForecastPanel` e `RevenueForecastHub`, `PredictiveRevenueForecast`, quick action. | Dois forecasts com números diferentes em telas diferentes. |
| `customer-success-360` × `customer-success-hub` | 9 tabelas de CS × `accounts` + `account_activities`. | **Ambas** (rotas `/customer-success-360` e `/customer-success`). | Sobreposição de produto. |
| `analyze-call` × `analyze-conversation` (× `summarize-call-recording`, `conversational-intelligence`) | `call_insights` × `conversation_analyses`. | **Ambas.** | Duas análises de IA da mesma ligação. |
| `detect-stuck-deals` × `detect-at-risk-deals` × `detect-winloss-at-risk` × `deal-risk-digest` | Baseline de velocidade × IA × scoring de padrões × digest Slack. | Todas vivas (o digest via cron). | Quatro definições de "deal em risco". |
| `sequence-runner` × `process-cadence-tasks` | `sequence_*` × `cadence_tasks`. | Ambas, só manuais. | Dois motores de cadência, nenhum agendado. |
| `calculate-deal-health` × `deal-probability` × `lead-scoring` × `predictive-intelligence` | Scores distintos sobre `sales`. | Todas vivas. | Muitos scores sem uma fonte única. |
| `winloss-webhook-replay` × `winloss-webhook-replay-batch` | Unitário × lote. | Só a unitária. | Remover o batch ou ligá-lo à UI. |
| `semantic-search` × `semantic-search-universal` | Produtos (intenção via LLM + `search_products_semantic`) × vetorial multi-entidade (`match_semantic`). | Ambas. | **Não é duplicata**: escopos diferentes. |
| `scheduled-report-trigger` × `scheduled-reports-runner`; `send-time-optimizer` × `schedule-optimal-send` | Pares complementares. | — | Não são duplicatas (mas ver §2.3/§3). |

## 6. Top 15 por impacto de negócio

| # | Problema | Functions | Por que importa | Ação |
|---|---|---|---|---|
| 1 | Toda automação cron/trigger depende de `_internal_secrets.functions_base_url` e `anon_key`, que nenhuma migration cria | 14 (2 de V4 callback, churn, tarefas urgentes, broadcast de venda, campaign health, digest de risco, retry de e-mail, ingest de gravação, edge-retry, WAL, web vitals, health de webhooks, cron-failure-alerter) | Sem as chaves, nada roda e o alerta de falha de cron também cai | Gravar as chaves (com a anon do usyxf) e verificar `cron.job_run_details`. |
| 2 | 172 functions para um limite de 100 deployadas, sem lista de prioridade (e sem prova de deploy no usyxf) | todas | Um deploy completo falha ou deixa funções-chave de fora | Definir um manifesto de deploy e remover as 17 órfãs. |
| 3 | O pilar de IA inteiro preso ao gateway Lovable | 46 | Sem `LOVABLE_API_KEY`, coaching, forecast narrativo, NBA, copilot, transcrição e busca semântica param ou ficam vazios | Confirmar o secret, ou apontar `LOVABLE_AI_GATEWAY_URL` para outro gateway. |
| 4 | Cadências e sequências não avançam sozinhas, e um contato "lead" derruba o runner | `sequence-runner`, `process-cadence-tasks`, `sequence-record-reply`, `process-scheduled-sends`, `schedule-optimal-send` | É o núcleo de prospecção do SDR | Cron + correção de `leads` + ligar o reply. |
| 5 | Alertas operacionais só no botão "testar", e a UI mostra agendas falsas | `check-lead-sla`, `sdr-consecutive-alerts`, `activity-goal-alerts`, `challenge-expiration-alerts`, `send-alert-notifications`, `auto-reassign-inactive`, `access-denied-alerts` | Gestor acredita que há vigilância de SLA e carteira | Criar `cron.schedule` e corrigir `AdminSystemStatus.tsx:29-36`. |
| 6 | Ciclo de cotação incompleto | `check-quote-expiration`, `send-quote-to-client` (órfãs) | Cotação não expira e o envio ao cliente pela function nunca é usado | Agendar a expiração e ligar o envio. |
| 7 | E-mail em massa e alerta de churn por e-mail quebrados | `email-bulk-send`, `email-bulk-retry`, `send-churn-alert-email` | Campanhas e alertas de churn não saem | Trocar `enqueue_email` por Resend ou `send-transactional-email`. |
| 8 | Metas inventadas nos hubs executivos | `revenue-intelligence`, `revops-hub`, `analyze-pipeline-coverage`, `coaching-intelligence` | Cobertura, atingimento e score de coaching errados para a diretoria | Ler `sales_goals` e `monthly_goal`. |
| 9 | Botões do Pipeline Pulse chamam functions inexistentes | `deal-health-scorer`, `smart-lead-router` | Dois dos quatro botões do hub executivo sempre falham | Apontar para `calculate-deal-health` e implementar o roteamento (ou esconder o botão). |
| 10 | Baselines de velocidade quebradas e duplicadas | `refresh-stage-baselines` × `recompute-stage-baselines`, com efeito em `detect-stuck-deals` | Deals parados calculados sobre baseline inconsistente; a UI diz sucesso | Unificar. |
| 11 | Duas calibrações, dois forecasts, dois motores de workflow vivos ao mesmo tempo | §5 | Números divergentes entre telas minam a confiança no CRM | Consolidar. |
| 12 | Gamificação depende do navegador | `process-race-event`, `rotate-daily-challenges`, `challenge-expiration-alerts` | Venda importada não pontua, e desafios não giram sem clique | Trigger SQL em `sales` e cron diário. |
| 13 | Customer Success sem entrega | `csat-ces-trigger` (não envia), `renewal-automation`, `qbr-scheduler`, `expansion-detector` (manuais) | CSAT/CES nunca é coletado de fato, e renovações dependem de clique | Envio da pesquisa e cron. |
| 14 | Relatórios agendados e exportação | `scheduled-reports-runner` (não entrega, sem cron), `export-winloss-pdf` (Markdown) | "Relatório agendado" não chega a ninguém | Enviar aos `recipients` e gerar PDF de verdade. |
| 15 | Referências a tabelas inexistentes e funções sem efeito | `leads` (4 functions), `team_members` (`ranking-api`), `enrich-lead` (STUB 503), `notify-critical-pattern` (trigger quebrado), `send-push-notification` (nunca chamada) | Recursos visíveis na UI que falham ou nunca disparam | Corrigir o mapeamento e remover ou ligar. |
