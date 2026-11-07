# Mapa do sistema — Promo_Champions_V2.1

Referência para localizar módulos, edge functions e integrações. Movido do antigo `CLAUDE.md` (seções 2 a 6) na limpeza das instruções para agentes. Contagens do texto original verificadas no HEAD em 2026-10-18; em 2026-11-07 o repo tinha 669 migrations e **171 edge functions** (pastas com `index.ts`; `ls supabase/functions` dá 173 porque inclui `README.md` e `_shared`).

> CRM de vendas completo com IA, coaching e gamificação para a equipe comercial da Promo Brindes. Maior sistema do lote: 175 rotas, 171 edge functions (plano Supabase limita a 100 deployadas), 656+ migrations.

## 1. Três camadas funcionais

### 1.1 Operação de venda (CRM core)

- Contas e negócios: `AccountDetail`, deal health, win probability calibrada
- Pipeline: board Kanban, stage conversion, stuck deals, SLA de leads (`check-lead-sla`)
- Pedidos: `AcompanhamentoPedidos`, `AcompanhamentoPedidoDetalhe`
- Cotações: `check-quote-expiration`, `notify-quote-conversion`, `send-quote-to-client`
- Cadências automáticas: `auto-enroll-cadence`, `sequence-runner`, `process-cadence-tasks`
- Comissões e premiações: `AdminComissoes`, `AdminPremiacoes`, `AdminAuditoriaPremiacoes`
- Reatribuição e roteamento: `auto-reassign-inactive`, `lead-scoring`, `territory-optimization`
- Customer Success: `customer-success-360`, `customer-success-hub`, `renewal-automation`, `expansion-detector`

### 1.2 IA e coaching

- Análise de chamadas: `analyze-call`, `diarize-call-recording`, `transcribe-call-recording`
- Qualidade de vendas: `analyze-objection-handling`, `analyze-question-quality`, `analyze-sentiment-timeline`, `analyze-skill-gaps`, `analyze-win-loss`
- Coaching: `coaching-intelligence`, `coaching-session-prep`, `coaching-impact-summary`, `salesperson-coaching`, `generate-loss-coaching`, `extract-coaching-actions`, `detect-coaching-opportunities`
- Copilot/assistente: `ai-agent-orchestrator`, `personal-assistant-stream`, `sales-assistant-chat`, `next-best-action`, `automation-suggestions`
- `ai-copilot` existe no repo mas **não tem chamador** (órfã — verificado 2026-10-18)
- Email IA: `ai-email-composer`, `email-composer-bulk`, `schedule-optimal-send`, `send-time-optimizer`
- Forecast/revenue: `revenue-forecast-ai`, `predict-quota-attainment`, `predict-deal-velocity`, `snapshot-forecast`, `compute-forecast-accuracy`, `generate-revenue-forecast`, `demand-forecast`, `purchase-intelligence-forecast`, `forecast-narrative`
- BI por papel: **BISDR** (prospecção), **BICloser** (carteira), **BIVendedor** (individual), **BIGestor** (equipe)
- Busca semântica: `semantic-search`, `semantic-search-universal`, `semantic-index-entity`, `nlq-query`

### 1.3 Gamificação de vendas

- Arena competitiva: `RaceArena.tsx`, `race-commentary`, `start-race-season`, `rotate-daily-challenges`
- Power-ups: `collect-race-powerup`, `process-race-event`
- Ranking: `ranking-api`, `notify-ranking-position`, `RankingCompetitivo.tsx`
- Badges e conquistas: `achievements/`, desafios por atividade
- Broadcast: `broadcast-sale-notification`

## 2. Edge Functions (171 funções Deno; plano Supabase limita a 100 deployadas)

Grupos por domínio (nomes herdados do CLAUDE.md antigo; em 2026-11-07 foram removidos `calibrate-win-probabilities` e `refresh-stage-baselines`, que não existem em `supabase/functions/`):

**CRM/Pipeline:** deal-probability, deal-risk-digest, detect-stuck-deals, detect-at-risk-deals, detect-winloss-at-risk, analyze-pipeline-coverage, analyze-stage-conversion, analyze-win-loss, mine-win-loss-patterns, recompute-stage-baselines, calibrate-win-probability

**Leads/Roteamento:** lead-scoring, check-lead-sla, enrich-lead, dialer-queue-builder, territory-optimization, behavioral-analysis

**Cadências/Sequências:** auto-enroll-cadence, sequence-runner, sequence-enroll, sequence-ab-promote, sequence-record-reply, process-cadence-tasks, execute-workflow, workflow-executor

**Email:** email-bulk-send, email-bulk-retry, email-composer-bulk, send-transactional-email, inbound-email-webhook, email-engagement-scorer, email-unsubscribe, process-scheduled-sends, schedule-optimal-send, send-time-optimizer

**Voz/Dialer:** analyze-call, diarize-call-recording, transcribe-call-recording, summarize-call-recording, extract-deal-stakeholders, extract-committee-from-call, analyze-conversation, analyze-conversation-metrics, conversational-intelligence, elevenlabs-stt, elevenlabs-tts, elevenlabs-voice, twilio-call-status, twilio-call-twiml, twilio-click-to-call

**IA/Forecast:** revenue-forecast-ai, predict-quota-attainment, predict-deal-velocity, snapshot-forecast, compute-forecast-accuracy, generate-revenue-forecast, demand-forecast, purchase-intelligence-forecast, forecast-narrative, predictive-intelligence, predictive-scoring-explain, pricing-intelligence

**Coaching:** coaching-intelligence, coaching-session-prep, coaching-impact-summary, salesperson-coaching, generate-loss-coaching, extract-coaching-actions, detect-coaching-opportunities, generate-coaching-actions, aggregate-coaching-scorecard

**Gamificação:** race-commentary, start-race-season, rotate-daily-challenges, collect-race-powerup, process-race-event, broadcast-sale-notification, ranking-api, notify-ranking-position

**Alertas/Monitoramento:** access-denied-alerts, activity-goal-alerts, campaign-health-alert, challenge-expiration-alerts, detect-client-churn-alerts, edge-retry-threshold-alert, wal-health-alert, cron-failure-alerter, notify-critical-pattern, sdr-consecutive-alerts

**Customer Success:** customer-success-360, customer-success-hub, renewal-automation, expansion-detector, csat-ces-trigger, qbr-generator, qbr-scheduler

**Multichannel/Notificações:** send-multichannel-message, multichannel-status-webhook, send-push-notification, push-subscribe, new-device-alert, send-alert-notifications, send-churn-alert-email, send-password-reset

**Integrações:** bitrix24-oauth, bitrix24-sync, helpdesk-sync, external-db-bridge, dispatch-webhook, winloss-webhook-dispatcher, winloss-webhook-health-monitor, winloss-webhook-replay, winloss-webhook-replay-batch, winloss-webhook-timeline, receive-quote-sync, receive-quote-webhook

**Reports/Export:** report-builder-execute, report-embed-public, scheduled-report-trigger, scheduled-reports-runner, generate-executive-briefing, export-winloss-pdf

**Ops/Infra:** get-client-ip, log-web-vitals, simulate-load, stress-test-contracts, run-retry-tests, webauthn, admin-conversion-trail

## 3. Integrações externas

| Serviço                        | Edge function(s)                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Twilio** (voz, dialer)       | twilio-call-status, twilio-call-twiml, twilio-click-to-call                                                                                   |
| **ElevenLabs** (STT/TTS/voice) | elevenlabs-stt, elevenlabs-tts, elevenlabs-voice                                                                                              |
| **Bitrix24**                   | bitrix24-oauth, bitrix24-sync                                                                                                                 |
| **Email transacional**         | send-transactional-email, email-bulk-send                                                                                                     |
| **WhatsApp multichannel**      | send-multichannel-message (Twilio, Meta Cloud, Z-API ou Evolution — provider resolvido por credencial) + whatsapp-inbound-webhook (Evolution) |
| **Semantic/NLQ**               | semantic-search, nlq-query                                                                                                                    |
| **WebAuthn** (passkeys)        | webauthn                                                                                                                                      |

## 4. Stack completa

| Camada            | Tech                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Frontend          | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router                                 |
| Backend           | Supabase Cloud (Postgres + RLS + Auth + Edge Functions Deno)                                                      |
| Testes            | Vitest + Testing Library, Playwright E2E                                                                          |
| Mapas             | Leaflet + react-leaflet (clusters de clientes)                                                                    |
| Workflows visuais | @xyflow/react                                                                                                     |
| Export            | Excel/PDF (exceljs, jspdf)                                                                                        |
| Deploy            | Vercel + GitHub (frontend repontado em código para `usyxfpqlsspldubptrdl` via `src/integrations/supabase/env.ts`) |

## 5. Arquitetura de componentes (src/)

```
src/
  components/
    ai/, analytics/, arena/, assistant/, bi/, cadences/, coaching/, competitive/
    conversation-intelligence/, customer-success/, deal-intelligence/
    dialer/, email/, forecast/, gamification/, lead-scoring/, multichannel/
    pipeline-pulse/, playbooks/, quotes/, race/, revenue-intelligence/
    sequences/, win-loss/, ... (103 domínios)
  hooks/        # TanStack Query hooks por dominio
  pages/        # 163 páginas (175 rotas declaradas em routes/AppRoutes.tsx)
  integrations/supabase/  # client.ts + tipos gerados
  services/     # logica nao-React
  lib/          # race, winloss, revenueForecast, bi, reports
```

> Nota (2026-10-18): versões anteriores citavam `copilot/`, `crm/` e `scoring/` como domínios — esses diretórios não existem; os equivalentes reais são `assistant/`, `quotes/`/`pipeline/` e `lead-scoring/`/`predictive/`.
