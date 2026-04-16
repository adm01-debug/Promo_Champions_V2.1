
Vou auditar o que existe vs o que falta no Customer Success.

**Auditado:**
- ✅ `/client-health` (`ClientHealthPanel`) — Health Score básico
- ✅ `CustomerSuccessHub.tsx` em `/customer-success-hub` — Health, churn risk, expansão (parcial)
- ✅ Edge function `customer-success-hub` — score baseado em atividade/tier
- ✅ NPS já existe (`nps_surveys` mencionado em memória)
- ✅ QBR generator (`qbr-generator` edge function) — implementado anteriormente
- ❌ Tickets/Support — sem integração (Zendesk/Intercom/Freshdesk)
- ❌ Renewal management — sem alertas/automações de renovação
- ❌ Product usage tracking — sem tabela/coleta
- ❌ Onboarding workflows — sem fluxo de novos clientes
- ❌ Expansion playbooks — sem playbooks de upsell/cross-sell
- ❌ CSAT/CES surveys — só NPS existe
- ❌ QBR scheduling automatizado — geração existe, agendamento não

## Plano de Implementação — Customer Success 360º

### 1. Database (1 migration)
- `support_tickets` — id, account_id, external_id, source (zendesk/intercom/freshdesk/internal), subject, status (open/pending/resolved/closed), priority, sentiment, created_at, resolved_at
- `renewals` — id, account_id, contract_value, renewal_date, status (upcoming/at_risk/renewed/churned/lost), notice_period_days, auto_renew, owner_salesperson_id
- `product_usage_events` — id, account_id, user_email, feature_key, event_type (login/feature_use/api_call), occurred_at, metadata
- `product_usage_summary` (view materializada ou tabela agregada) — account_id, dau, wau, mau, last_login_at, top_features, adoption_score
- `onboarding_journeys` — id, account_id, template_key, status (not_started/in_progress/completed/stalled), current_step, started_at, completed_at, owner_salesperson_id
- `onboarding_steps` — id, journey_id, title, description, order_index, status, due_date, completed_at
- `expansion_playbooks` — id, name, trigger_type (usage_threshold/tier/health_score/custom), trigger_config jsonb, recommended_action, is_active
- `expansion_opportunities` — id, account_id, playbook_id, type (upsell/cross_sell/expansion), estimated_value, status (identified/qualified/proposed/won/lost), confidence_score
- `csat_ces_surveys` — id, account_id, contact_email, survey_type (csat/ces), score, comment, sent_at, responded_at, trigger_event
- `qbr_schedule` — id, account_id, frequency (monthly/quarterly/biannual), next_qbr_at, last_qbr_at, owner_salesperson_id, auto_generate, is_active
- RLS: admin/manager total; salesperson vê suas contas

### 2. RPCs / Funções
- `compute_customer_health_v2(account_id)` — Health Score robusto: tickets abertos, NPS, CSAT, usage adoption, renewal proximity, payment status
- `detect_renewal_risks()` — atualiza status de renewals próximas (90/60/30d) e dispara alertas
- `evaluate_expansion_playbooks()` — avalia playbooks ativos contra contas e cria `expansion_opportunities`
- `schedule_next_qbrs()` — calcula `next_qbr_at` por frequência

### 3. Edge Functions (5)
- `customer-success-360` — agrega tudo: health v2, tickets, renewals, usage, NPS/CSAT/CES, onboarding status, expansion ops
- `support-ticket-sync` — webhook + pull para Zendesk/Intercom/Freshdesk (via connector ou API key)
- `renewal-automation` — cron diário: detecta renovações 90/60/30d, cria notificações/tasks
- `expansion-detector` — cron semanal: roda playbooks e gera oportunidades
- `csat-ces-trigger` — dispara survey após eventos (ticket resolvido, milestone)

### 4. Hooks (`src/hooks/customer-success/`)
- `useCustomerSuccess360.ts` — fetch consolidado
- `useSupportTickets.ts` — CRUD + filtros
- `useRenewals.ts` — listagem, atualização de status
- `useProductUsage.ts` — métricas de adoção
- `useOnboardingJourneys.ts` — CRUD jornadas + steps
- `useExpansionPlaybooks.ts` — listagem playbooks + ops
- `useCSATCESSurveys.ts` — enviar/listar surveys
- `useQBRSchedule.ts` — agendamento

### 5. UI Components (`src/components/customer-success/`)
- `CustomerSuccess360Hub.tsx` — Hub principal com tabs:
  - **Visão Geral**: KPIs + health distribution + alertas críticos
  - **Health Score v2**: drill-down por conta com fatores (tickets/NPS/usage/renewal)
  - **Renovações**: pipeline de renovação com semáforo 90/60/30d
  - **Tickets**: lista de tickets abertos por conta + sentimento
  - **Adoção de Produto**: DAU/WAU/MAU, top features, contas inativas
  - **Onboarding**: jornadas ativas + progresso por step
  - **Expansion**: oportunidades identificadas + playbooks ativos
  - **CSAT/CES**: scores + comentários + tendência
  - **QBR**: agenda + últimos QBRs gerados
- Componentes auxiliares: `RenewalPipelineBoard`, `TicketsByAccountTable`, `ProductAdoptionChart`, `OnboardingJourneyCard`, `ExpansionOpportunityCard`, `SurveyResponseCard`, `QBRScheduleCalendar`

### 6. Página + Rota
- `/customer-success-360` em `AppRoutes.tsx` + `lazyPages.ts`
- Item sidebar "Análises" → "Customer Success 360"
- Breadcrumb `DesktopTopBar.tsx`
- Helmet/SEO + ProtectedRoute (admin/manager)

### 7. Integrações de Tickets
- Suporte inicial via API Key manual (Zendesk/Intercom/Freshdesk) com secrets
- Webhook endpoint para receber eventos em tempo real
- Tela de "Conectar Helpdesk" em Configurações (não bloqueante para esta entrega)

### 8. Padrões obrigatórios
- Sora títulos / Inter body, tokens semânticos, dark theme
- Framer motion, skeleton loading, memoization
- ≤400 linhas por arquivo (helpers em `*Helpers.ts`)
- Strict TS, RLS respeitado, zero console errors
- React Query 5min staleTime
- toast (sonner) para feedback de mutations

### 9. Validação pós-implementação
- Deploy edge functions
- Smoke test endpoints com `curl_edge_functions`
- Validar RLS via `read_query`
- Verificar rota carrega sem erros

Após aprovação, executo na ordem: migration → edge functions → hooks → componentes → rota → testes.
