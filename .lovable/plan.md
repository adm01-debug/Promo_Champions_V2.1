
Próxima atômica do **Sales Engagement Avançado** (item 6/8): **Power Dialer** — fila inteligente de chamadas que apresenta o próximo lead a ligar com contexto, scripts e disposições de chamada, eliminando o tempo morto entre ligações.

## Estado atual
- Existem `sales`, `email_engagement_scores`, `send_time_profiles`, `account_contacts` — todos os sinais necessários para priorizar quem ligar.
- Não existe fila de discagem, registro estruturado de chamadas, nem motor de priorização que combine score + send-time + tarefas em aberto.
- Sequences não disparam tasks de "ligar agora" — call cadence é manual.

## Mudanças

### 1. Migration
- Tabela `dialer_queues`: `id`, `owner_id`, `name`, `filter jsonb` (tier mín, owner, tags), `priority_strategy text` (`score|recency|send_time|hybrid`), `is_active bool`, `created_at`.
- Tabela `dialer_queue_items`: `id`, `queue_id`, `sale_id`, `score numeric` (priority calculado), `position int`, `status text` (`pending|calling|done|skipped|snoozed`), `snooze_until timestamptz`, `added_at`, `completed_at`. Index `(queue_id, status, position)`.
- Tabela `call_logs`: `id`, `owner_id`, `sale_id`, `queue_item_id` (nullable), `disposition text` (`connected|voicemail|no_answer|busy|wrong_number|do_not_call`), `outcome text` (`meeting_set|interested|not_interested|callback|nurture`), `duration_seconds int`, `notes text`, `next_action_at timestamptz`, `created_at`.
- RPC `build_dialer_queue(_queue_id uuid)` → repopula items aplicando filter + priority_strategy.
- RPC `next_dialer_item(_queue_id uuid)` → retorna o próximo `pending` e marca `calling`.
- RLS: owner vê o próprio; admin/manager veem tudo.

### 2. Edge function `dialer-queue-builder` (`verify_jwt = true`)
- Input: `{ queue_id }`. Aplica filter (sales do owner com tier ≥ X), calcula priority híbrida (0.5·email_score + 0.3·send_time_match_now + 0.2·days_since_last_touch).
- Upsert em `dialer_queue_items` ordenado por priority desc.

### 3. Hook `src/hooks/dialer/usePowerDialer.ts`
- `useDialerQueues()`, `useQueueItems(queueId)`, `useNextItem(queueId)` (mutation), `useLogCall()` (mutation com next-action), `useRebuildQueue()` (invoca edge function), `useSnoozeItem()`.

### 4. UI
- `src/components/dialer/DialerQueueCard.tsx` (≤120L) — card com nome, items pending, last build, ações.
- `src/components/dialer/CurrentCallCard.tsx` (≤200L) — card grande do contato em chamada: nome, empresa, score, send-time recommendation, últimos 3 toques, botão "Próximo".
- `src/components/dialer/CallDispositionForm.tsx` (≤200L) — formulário pós-call com disposition, outcome, notes, next_action_at.
- `src/components/dialer/QueueBuilderDialog.tsx` (≤180L) — criar/editar fila com tier mínimo, owner, strategy.
- `src/components/dialer/dialerHelpers.ts` — labels, ícones por disposition/outcome.
- `src/pages/PowerDialer.tsx` (≤200L) — `/engagement/dialer`:
  - Layout 2 colunas: lista de queues à esquerda, current call + form à direita.
  - Botão "Construir fila" + "Próxima ligação".

### 5. Integração
- Sidebar: item "Power Dialer" sob Engajamento.
- Rota `/engagement/dialer` em `AppRoutes` + `lazyPages`.
- `LeadDetailDrawer`: histórico de chamadas (últimos 5 `call_logs`).

### 6. Validação
- `supabase--curl_edge_functions /dialer-queue-builder` com queue real → confirma popular `dialer_queue_items`.
- `supabase--read_query` confirma priority válida + ordem correta.
- `supabase--linter` zero novos warnings.

### Arquivos
- **Migration**: 1 (3 tabelas + 2 RPCs + RLS)
- **Criar**: `supabase/functions/dialer-queue-builder/index.ts`
- **Criar**: `src/hooks/dialer/usePowerDialer.ts`
- **Criar**: 5 componentes em `src/components/dialer/` + helpers
- **Criar**: `src/pages/PowerDialer.tsx`
- **Editar**: `src/components/leads/LeadDetailDrawer.tsx`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Click-to-call Twilio** → fechando Sales Engagement em 10/10.
