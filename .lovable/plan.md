
Próxima atômica do **Sales Engagement Avançado** (item 3/8): **Send Time Optimization** — calcular o melhor horário para enviar emails/mensagens a cada lead, baseado no histórico real de aberturas/respostas, e sugerir/agendar automaticamente o envio.

## Estado atual
- Existe `channel_interactions` (tracking de envios multicanal) e `email_engagement_events` no envio de sequences (open/click/reply tracking).
- Sequences enviam imediatamente na hora em que o step é executado — sem janela ótima por lead.
- BulkComposer envia "todos aprovados de uma vez" — sem distribuição inteligente.
- Zero análise de horário ótimo, zero modelo de previsão por contato/segmento.

## Mudanças

### 1. Migration
- Tabela `send_time_profiles`: `id`, `sale_id` (1:1), `best_hour int` (0–23), `best_dow int` (0–6, dom=0), `confidence numeric` (0–1), `sample_size int`, `tz text default 'America/Sao_Paulo'`, `hour_distribution jsonb` (24 buckets de open-rate), `dow_distribution jsonb` (7 buckets), `last_calculated_at`, `created_at`. Unique em `sale_id`.
- Tabela `scheduled_sends`: `id`, `owner_id`, `sale_id`, `channel text` (email/whatsapp/linkedin), `payload jsonb` (subject/body), `scheduled_for timestamptz`, `status text` (`pending|sent|failed|cancelled`), `optimization_source text` (`profile|global|manual`), `sent_at`, `error text`, `created_at`. Index `(status, scheduled_for)`.
- RLS: owner vê o próprio; admin/manager veem tudo.
- RPC `get_global_send_time_stats()` → fallback global de melhor hora/dow agregando todos os `email_engagement_events` (último 90d).

### 2. Edge function `send-time-optimizer` (`verify_jwt = true`)
- Input: `{ sale_ids?: string[], recompute_all?: boolean }`. Para cada sale:
  - Carrega últimos 90 dias de `email_engagement_events` + `channel_interactions` daquele lead/cliente.
  - Agrega taxa de open por hora-do-dia e dia-da-semana.
  - Calcula `best_hour`/`best_dow` (argmax) + `confidence` (Wilson score interval com `sample_size`).
  - Se `sample_size < 3`: usa fallback global via `get_global_send_time_stats()`.
  - Upsert em `send_time_profiles`.
- Output: `{ updated: N, fallbacks: M }`.

### 3. Edge function `schedule-optimal-send` (`verify_jwt = true`)
- Input: `{ sale_id, channel, payload, force_now?: boolean }`.
- Lê `send_time_profiles` do lead → calcula próximo `scheduled_for` (próximo `best_dow + best_hour` futuro).
- Insere em `scheduled_sends` com `optimization_source`. Retorna `{ scheduled_for, source, confidence }`.

### 4. Cron tick `process-scheduled-sends` (`verify_jwt = false`, chamado por pg_cron)
- A cada 5 min: busca `scheduled_sends` com `status=pending AND scheduled_for <= now()`.
- Despacha via `send-multichannel-message`. Atualiza `sent_at`/`status`/`error`. Concorrência limitada (5 paralelos).
- Adicionar cron job na migração (`*/5 * * * *`).

### 5. Hooks (`src/hooks/engagement/`)
- `useSendTimeProfile(saleId)` — query do profile + auto-recompute on stale (>7d).
- `useOptimizeSendTime()` — mutation que invoca `send-time-optimizer` em batch.
- `useScheduleOptimalSend()` — mutation que invoca `schedule-optimal-send`.
- `useScheduledSends({status})` — listagem realtime de envios agendados.
- `useCancelScheduledSend(id)`.

### 6. UI
- `src/components/engagement/SendTime/SendTimeBadge.tsx` (≤80L) — chip compacto "Melhor: Ter 10h · 87% conf" com tooltip mostrando heatmap simplificado. Reusável em qualquer lugar (DealCard, drawers, BulkComposer).
- `src/components/engagement/SendTime/SendTimeHeatmap.tsx` (≤120L) — grid 7×24 colorido por taxa de abertura, lê `hour_distribution` + `dow_distribution`.
- `src/components/engagement/SendTime/ScheduledSendsPanel.tsx` (≤200L) — lista agendamentos pendentes do owner, botão cancelar, badge de canal.
- `src/pages/SendTimeOptimization.tsx` (≤180L) — página `/engagement/send-time` com:
  - Header + botão "Recalcular todos os perfis" (admin).
  - Stats globais (melhor hora geral, sample total).
  - Tabela top 10 leads com perfis mais confiantes.
  - Embed `ScheduledSendsPanel`.

### 7. Integração no BulkComposer
- Em `BulkComposerWizard` (Step 3), novo toggle "Distribuir nos horários ótimos" (default ON quando há perfis).
- Ao enviar com toggle ON: para cada draft aprovado, chama `schedule-optimal-send` em vez de envio direto. Caso contrário mantém comportamento atual.

### 8. Sidebar + rotas
- `src/components/layout/sidebar/sidebarMenuData.ts`: novo item "Send Time IA" sob "Engajamento".
- `src/routes/AppRoutes.tsx` + `lazyPages.ts`: rota `/engagement/send-time`.

### 9. Validação end-to-end
- `supabase--curl_edge_functions /send-time-optimizer` com 1 sale_id → confirma upsert em `send_time_profiles`.
- `supabase--read_query` confirma `hour_distribution` populado + `confidence` válido.
- `supabase--curl_edge_functions /schedule-optimal-send` → confirma criação em `scheduled_sends` no horário esperado.
- Linter zero novos warnings.

### Arquivos
- **Migration**: 1 (2 tabelas + 1 RPC + cron job + RLS)
- **Criar**: `supabase/functions/send-time-optimizer/index.ts`, `schedule-optimal-send/index.ts`, `process-scheduled-sends/index.ts`
- **Criar**: `src/hooks/engagement/useSendTimeOptimization.ts`
- **Criar**: `src/components/engagement/SendTime/SendTimeBadge.tsx`, `SendTimeHeatmap.tsx`, `ScheduledSendsPanel.tsx`, `sendTimeHelpers.ts`
- **Criar**: `src/pages/SendTimeOptimization.tsx`
- **Editar**: `src/components/engagement/BulkComposer/BulkComposerWizard.tsx`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Email Engagement Scoring** → **Account-Based Engagement** → **Power Dialer** → **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
