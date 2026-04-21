

## Dead-letter queue para webhooks Win/Loss + reprocessamento manual

### Objetivo
Quando um webhook falha em todas as 3 tentativas, persistir o payload em uma fila DLQ. Admin pode visualizar, reprocessar (1 ou em lote) e arquivar. Reprocesso reusa o `dispatcher` existente — sem duplicar lógica.

### Backend

**Migration — nova tabela `winloss_webhook_dead_letters`**
```
id uuid pk default gen_random_uuid()
subscription_id uuid → winloss_webhook_subscriptions(id) on delete cascade
event text not null
payload jsonb not null
last_status smallint not null              -- status final que disparou o DLQ (ex: 500, 0)
last_error text                            -- mensagem do último erro
attempts smallint not null                 -- quantas tentativas (sempre = MAX_ATTEMPTS=3)
total_latency_ms integer not null
request_id uuid                            -- correlação com logs
status text not null default 'pending'     -- 'pending' | 'replaying' | 'replayed' | 'archived'
replay_count smallint not null default 0
last_replay_at timestamptz
last_replay_status smallint
last_replay_error text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```
Índices: `(status, created_at desc)`, `(subscription_id)`. Trigger `updated_at`.

**RLS**: SELECT/UPDATE só admin (via `has_role(auth.uid(),'admin')`). INSERT só service role (edge function).

**`retry.ts` — adicionar callback opcional `onDeadLetter`** em `DispatchDeps`:
```ts
onDeadLetter?: (entry: DeadLetterEntry) => Promise<void>;
```
Após o loop de 3 tentativas, se `!succeeded` E `onDeadLetter` definido, chamar com `{ subscription_id, event, payload, last_status, last_error, attempts, total_latency_ms }`. Falha do callback é logada mas não relança (best-effort, igual ao `insertDelivery`). Adiciona log `dead_letter_recorded`.

**`index.ts` — implementar `onDeadLetter`** que faz INSERT em `winloss_webhook_dead_letters` com `request_id`. Retry-replay também passa pelo dispatcher: aceita `payload.__replay_of` (uuid do DLQ) → ao tentar de novo, se falhar atualiza `replay_count`/`last_replay_*` no registro original em vez de criar novo DLQ; se suceder, marca `status='replayed'`. Implementado via segundo callback opcional `onReplayResult`.

**Nova edge function `winloss-webhook-replay`** (verify_jwt = true via JWT do admin):
- POST `{ dead_letter_ids: string[] }` ou `{ dead_letter_id: string }`
- Para cada id: lê linha do DLQ, marca `status='replaying'`, invoca `winloss-webhook-dispatcher` via `supabase.functions.invoke` passando `{ ...payload, __replay_of: id, __target_subscription_id: subscription_id }`. Dispatcher honra `__target_subscription_id` para não fanout.
- Retorna `{ requestId, results: [{ id, succeeded, status }] }`.
- Valida com Zod (1–50 ids).
- Verifica role admin via `user_roles` antes de prosseguir; 403 caso contrário.

**Ajuste no dispatcher**: quando `__target_subscription_id` presente, ignora a lista `events.includes(event)` e busca somente aquela subscription (ainda valida `active=true` opcional — para replay aceita inativa também, log warn).

### Frontend

**Hook `useWebhookDeadLetters`** (`src/hooks/win-loss/useWebhookDeadLetters.ts`):
- `list({ status })` via React Query — filtra por `status` (`pending` por padrão).
- `replay({ ids })` mutation → invoca `winloss-webhook-replay`.
- `archive({ ids })` mutation → UPDATE `status='archived'`.
- Realtime opcional na tabela.

**Componente `WebhookDeadLetterPanel`** (`src/components/win-loss/WebhookDeadLetterPanel.tsx`):
- Card colapsável com badge contador de pendentes.
- Lista linhas: ícone, evento, subscription URL truncada, status final HTTP, último erro, `created_at` relativo, botão **Reprocessar** (loader) e **Arquivar**.
- Seleção em massa via checkboxes + barra superior “Reprocessar N” / “Arquivar N”.
- Drawer “Ver payload” mostra JSON formatado e histórico de replays (`replay_count`, `last_replay_at`, `last_replay_status`).
- Filtro segmentado: Pendentes · Reprocessados · Arquivados.

**Integração**: renderizado abaixo do `WebhookSubscriptionsPanel` (admin only — usar `useUserRole`).

### Testes Deno

Adicionar em `retry_test.ts`:
- `dispatchOne: chama onDeadLetter quando todas as tentativas falham` — verifica payload do entry.
- `dispatchOne: NÃO chama onDeadLetter em sucesso (1ª, 2ª ou 3ª)`.
- `dispatchOne: erro em onDeadLetter é logado e não propaga`.

### Detalhes técnicos
- Reuso total do `retry.ts` — só ganha 1 callback opcional (não-breaking).
- `__replay_of`/`__target_subscription_id` são metadados internos: dispatcher os remove do `payload` antes de serializar para o destino externo (evita expor ao endpoint do cliente).
- Logs novos: `dead_letter_recorded`, `replay_start`, `replay_complete` carregam `requestId` + `dead_letter_id`.
- Admin-only enforced em RLS (defesa em profundidade) + check explícito na edge function de replay.
- Estado `replaying` é transitório; ao terminar vira `replayed` (sucesso) ou volta a `pending` (falha) com contadores incrementados.

### Ordem
1. Migration: tabela + índices + RLS + trigger updated_at.
2. `retry.ts`: callback `onDeadLetter`, log `dead_letter_recorded`, testes Deno (3 casos).
3. `winloss-webhook-dispatcher/index.ts`: implementar `onDeadLetter`, suportar `__replay_of` / `__target_subscription_id`, sanitizar payload externo.
4. Nova função `winloss-webhook-replay` (Zod, role check, invoca dispatcher).
5. Hook `useWebhookDeadLetters` + componente `WebhookDeadLetterPanel`.
6. Integrar painel sob `WebhookSubscriptionsPanel` (admin only).
7. `supabase--test_edge_functions` + `tsc --noEmit`.
8. Atualizar `mem://features/winloss-webhook-observability`.

