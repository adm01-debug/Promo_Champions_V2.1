# CLAUDE.md — PROMO CHAMPIONS V2.1 (leitura OBRIGATÓRIA antes de qualquer ação)

> CRM de vendas completo com IA, coaching e gamificação para a equipe comercial da Promo Brindes.
> Maior sistema do lote: 173 páginas, ~170 edge functions, 595 migrations.

---

## 1. Banco de dados OFICIAL

| O que            | Valor                                                       |
| ---------------- | ----------------------------------------------------------- |
| Projeto Supabase | `usyxfpqlsspldubptrdl` (Cloud)                              |
| URL              | `https://usyxfpqlsspldubptrdl.supabase.co`                  |
| Dashboard        | https://supabase.com/dashboard/project/usyxfpqlsspldubptrdl |
| MCP para SQL     | `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP`                         |
| Migrations       | **595+** (timestamp YYYYMMDDHHmmss)                         |

> Corrigido em 2026-09-02: o ref `rapjswienfhkobhlamxb` citado aqui anteriormente estava
> desatualizado (`supabase/config.toml` foi repontado para `usyxfpqlsspldubptrdl` em 30/08,
> um dia depois deste arquivo ter sido escrito). Confirmado com prova direta via
> `_internal_secrets.functions_base_url` no banco vivo, que retorna
> `https://usyxfpqlsspldubptrdl.supabase.co/functions/v1`.

### Bancos que NAO sao deste projeto

- Supabase self-hosted VPS AtomicaBR
- Qualquer outro projeto Supabase da lista do usuário

### Regras de migration

1. Usar `db_query` no MCP com DDL direto — NÃO usar `supabase_apply_migration`.
2. `migrate-helper` edge function foi removida (security: expunha service_role).
3. Versão = timestamp estritamente crescente. Conferir `SELECT max(version)` antes.
4. Toda DDL = arquivo em `supabase/migrations/` + comentário descritivo no topo.
5. `CREATE INDEX CONCURRENTLY` falha (gateway transacional) — usar `CREATE INDEX` simples.
6. Padrão de hardening: functions com `SECURITY INVOKER`, grants mínimos por role.

---

## 2. Stack

| Camada            | Tech                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| Frontend          | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router |
| Backend           | Supabase Cloud (Postgres + RLS + Auth + Edge Functions Deno)                      |
| Testes            | Vitest + Testing Library, Playwright E2E                                          |
| Mapas             | Leaflet + react-leaflet (clusters de clientes)                                    |
| Workflows visuais | @xyflow/react                                                                     |
| Export            | Excel/PDF (xlsx, pdf-lib)                                                         |
| Deploy            | Lovable Cloud                                                                     |

---

## 3. Três camadas funcionais

### 3.1 Operação de venda (CRM core)

- Contas e negócios: `AccountDetail`, deal health, win probability calibrada
- Pipeline: board Kanban, stage conversion, stuck deals, SLA de leads (`check-lead-sla`)
- Pedidos: `AcompanhamentoPedidos`, `AcompanhamentoPedidoDetalhe`
- Cotações: `check-quote-expiration`, `notify-quote-conversion`, `send-quote-to-client`
- Cadências automáticas: `auto-enroll-cadence`, `sequence-runner`, `process-cadence-tasks`
- Comissões e premiações: `AdminComissoes`, `AdminPremiacoes`, `AdminAuditoriaPremiacoes`
- Reatribuição e roteamento: `auto-reassign-inactive`, `lead-scoring`, `territory-optimization`
- Customer Success: `customer-success-360`, `customer-success-hub`, `renewal-automation`, `expansion-detector`

### 3.2 IA e coaching

- Análise de chamadas: `analyze-call`, `diarize-call-recording`, `transcribe-call-recording`
- Qualidade de vendas: `analyze-objection-handling`, `analyze-question-quality`, `analyze-sentiment-timeline`, `analyze-skill-gaps`, `analyze-win-loss`
- Coaching: `coaching-intelligence`, `coaching-session-prep`, `coaching-impact-summary`, `salesperson-coaching`, `generate-loss-coaching`, `extract-coaching-actions`, `detect-coaching-opportunities`
- Copilot/assistente: `ai-copilot`, `ai-agent-orchestrator`, `personal-assistant-stream`, `sales-assistant-chat`, `next-best-action`, `automation-suggestions`
- Email IA: `ai-email-composer`, `email-composer-bulk`, `schedule-optimal-send`, `send-time-optimizer`
- Forecast/revenue: `revenue-forecast-ai`, `predict-quota-attainment`, `predict-deal-velocity`, `snapshot-forecast`, `compute-forecast-accuracy`, `calibrate-win-probabilities`, `generate-revenue-forecast`, `demand-forecast`, `purchase-intelligence-forecast`, `forecast-narrative`
- BI por papel: **BISDR** (prospecção), **BICloser** (carteira), **BIVendedor** (individual), **BIGestor** (equipe)
- Busca semântica: `semantic-search`, `semantic-search-universal`, `semantic-index-entity`, `nlq-query`

### 3.3 Gamificação de vendas

- Arena competitiva: `RaceArena.tsx`, `race-commentary`, `start-race-season`, `rotate-daily-challenges`
- Power-ups: `collect-race-powerup`, `process-race-event`
- Ranking: `ranking-api`, `notify-ranking-position`, `RankingCompetitivo.tsx`
- Badges e conquistas: `achievements/`, desafios por atividade
- Broadcast: `broadcast-sale-notification`

---

## 4. Edge Functions (~170 funções Deno)

Grupos por domínio:

**CRM/Pipeline:** deal-probability, deal-risk-digest, detect-stuck-deals, detect-at-risk-deals, detect-winloss-at-risk, analyze-pipeline-coverage, analyze-stage-conversion, analyze-win-loss, mine-win-loss-patterns, recompute-stage-baselines, refresh-stage-baselines, calibrate-win-probabilities, calibrate-win-probability

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

---

## 5. Integracoes externas

| Serviço                        | Edge function(s)                                            |
| ------------------------------ | ----------------------------------------------------------- |
| **Twilio** (voz, dialer)       | twilio-call-status, twilio-call-twiml, twilio-click-to-call |
| **ElevenLabs** (STT/TTS/voice) | elevenlabs-stt, elevenlabs-tts, elevenlabs-voice            |
| **Bitrix24**                   | bitrix24-oauth, bitrix24-sync                               |
| **Email transacional**         | send-transactional-email, email-bulk-send                   |
| **WhatsApp multichannel**      | send-multichannel-message (via Evolution)                   |
| **Semantic/NLQ**               | semantic-search, nlq-query                                  |
| **WebAuthn** (passkeys)        | webauthn                                                    |

---

## 6. Arquitetura de componentes (src/)

```
src/
  components/
    ai/, analytics/, arena/, bi/, cadences/, coaching/, competitive/
    conversation-intelligence/, copilot/, crm/, deal-intelligence/
    dialer/, email/, forecast/, gamification/, pipeline-pulse/
    playbooks/, race/, revenue-intelligence/, scoring/, sequences/
    win-loss/, customer-success/, multichannel/
  hooks/        # TanStack Query hooks por dominio
  pages/        # 173 paginas/rotas
  integrations/supabase/  # client.ts + tipos gerados
  services/     # logica nao-React
  lib/          # race, winloss, revenueForecast, bi, reports
```

---

## 7. Testes

```sh
bun run test         # vitest watch
bun run test:watch   # watch mode
bun run typecheck    # tsc --noEmit
bun run lint         # eslint
bun run test:e2e     # playwright E2E
bun run a11y:sweep   # axe accessibility
```

---

## graphify

This project has a knowledge graph at graphify-out/.

- Para perguntas de codebase: `graphify query "<pergunta>"` quando graph.json existir.
- Relacionamentos: `graphify path "<A>" "<B>"` ou `graphify explain "<conceito>"`.
- Navegação ampla: `graphify-out/GRAPH_REPORT.md` (15918 nodes, 40321 edges, 1421 comunidades).
- Após mudança de código: `graphify update .` (AST-only, sem custo de API).

## Frescura do Grafo

```sh
git rev-parse --short HEAD
grep "Built from commit" graphify-out/GRAPH_REPORT.md
```

Se divergirem, auto-sync N8N corrige em até 15 min.
Forçar rebuild: `graphify update . --force`
