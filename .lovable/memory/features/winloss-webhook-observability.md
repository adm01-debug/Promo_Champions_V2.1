---
name: winloss-webhook-observability
description: Dispatcher + DLQ + replay + timeline + histórico de alertas correlacionando entregas/dead-letters/alertas por requestId e subscriptionId end-to-end
type: feature
---

Webhook Win/Loss possui pipeline completo de observabilidade com correlação ponta-a-ponta por `requestId`:

- **Dispatcher** (`winloss-webhook-dispatcher`): retries 3x, backoff exp+jitter, timeout 8s. Aceita `X-Request-Id` (header) ou `__request_id` (payload) inbound; gera UUID novo se ausente. Persiste cada tentativa em `winloss_webhook_deliveries.request_id` e DLQ em `winloss_webhook_dead_letters.request_id` (+ `last_replay_request_id` em replays). Outbound HTTP fetch envia `X-Request-Id`, `X-Winloss-Subscription-Id` e `X-Winloss-Event` para o receptor. Envelope estável `{ requestId, error, dispatched, results }` + header `X-Request-Id`.
- **Replay** (`winloss-webhook-replay`): forward do próprio `requestId` para o dispatcher (header + `__request_id` payload). Persiste `last_replay_request_id` em todos os outcomes DLQ. Limite de 50 IDs por chamada.
- **Replay batch** (`winloss-webhook-replay-batch`, `verify_jwt=true`): wrapper server-side que aceita até `MAX_BATCH_TOTAL=500` IDs (`dead_letter_ids` XOR `delivery_ids`), divide em chunks (`chunk_size` configurável 1..`MAX_CHUNK_SIZE=50`, default 25) e invoca `winloss-webhook-replay` por chunk encaminhando o JWT do caller (RBAC admin preservado). Retorna agregado `{ requestId, total, chunks, aggregate{succeeded,failed,skipped,invoked_chunks}, batches[{index,size,invoked,request_id,succeeded,failed,skipped,duration_ms,error,results}], aborted, abort_reason, duration_ms, limits }`. Flag `stop_on_error` aborta chunks restantes após erro de invocação (não aborta por falhas HTTP do receptor — essas são per-item). Logs JSON estruturados (`batch_started`/`chunk_invoke_error`/`chunk_threw`/`batch_finished`). Schema validado por Zod em `schema.ts` + 10 testes Deno.
- **Health monitor** (`winloss-webhook-health-monitor`): grava em `winloss_webhook_alerts` com `request_id`/`subscription_id` top-level + `monitor_request_id` em `details`. Limites carregados em runtime da tabela `winloss_alert_settings` (singleton, admin-only); env vars `ALERT_*` permanecem como fallback. Três tipos:
  - `consecutive_failures` / `high_retry_rate` — suprimidos por kind, janela `suppress_minutes`
  - `attempts_exhausted` — todas as `max_attempts` (default 3) tentativas de um mesmo `request_id` falharam; suprimido por request_id
  Toda supressão também é persistida com `suppressed=true` + `suppress_reason` para auditoria.
- **Timeline endpoint** (`winloss-webhook-timeline`): admin-only, mescla deliveries + dead_letters + alerts por `requestId`/`subscriptionId`.

Frontend admin:
- `/admin/webhooks-timeline` — `WebhookTimelinePage` com âncoras por tentativa, hook `useWebhookTimeline`.
- `/admin/webhooks-alert-history` — `WebhookAlertHistoryPage` com filtros (assinatura, tipo, status fired/suppressed, janela 24h/7d/30d), badges Disparado/Suprimido, link rápido para timeline filtrada por requestId. Hook `useWebhookAlertHistory` faz join com `winloss_webhook_subscriptions(url)`.
- `/admin/webhooks-alert-settings` — `WebhookAlertSettingsPage` (admin-only) edita os 6 limites do monitor (consecutive_failures, retry_rate_threshold, window_minutes, min_deliveries, suppress_minutes, max_attempts) sem mexer em env vars. Hook `useWebhookAlertSettings`.
- `WebhookSubscriptionLatestList` no painel de saúde — link rápido para timeline filtrada.
- `WebhookDeadLetterPanel` — toggle "Modo fila assíncrona" (`Switch`) ativa `AsyncReplayQueueDialog` em vez do `BulkReplayConfirmDialog`. Fila roda no client via `useAsyncReplayQueue` (chunks de 25, sequencial), expõe progress bar, stats agregados (sucesso/falhas/lotes/tempo), status por lote (pending/running/succeeded/failed/cancelled) com `requestId` e duração, suporta cancelamento mid-flight (`cancelRef`), invalida `winloss-dead-letters` + `winloss-replay-audit` ao final. Hard cap 200 itens permanece.
- `/admin/webhooks-dead-letters` — agora estruturada em Tabs ("Lista & filtros" + "Status por ID"). Aba "Status por ID" via `ReplayStatusByIdPanel` busca um dead-letter pelo UUID e mostra resumo (event/status/HTTP/attempts/replay_count), badges de último replay, identificação (id + requestId com copiar), resumo do último replay (`replay_count`, `last_replay_status`, `last_replay_at`, `last_replay_error`), erro original, payload (collapsible) e `ReplayAuditTrail` completo. Botão "Reprocessar novamente" reusa o mutate de `useWebhookDeadLetters` (mesma invalidação de cache + auditoria). Edge function dedicada `winloss-webhook-replay-batch` (`verify_jwt=true`) aceita até `MAX_BATCH_TOTAL=500` IDs server-side com `chunk_size` 1..50 (default 25), `stop_on_error` opcional, encaminha JWT para RBAC e retorna agregado por lote (`succeeded/failed/skipped/duration_ms/request_id/error/results`) — disponível para integrações externas além do client.

Schema correlacional:
- `winloss_webhook_deliveries.request_id uuid` (indexado)
- `winloss_webhook_dead_letters.request_id uuid` + `last_replay_request_id uuid` (indexados)
- `winloss_webhook_alerts`: `request_id uuid`, `suppressed boolean default false`, `suppress_reason text`. CHECK kind ∈ {consecutive_failures, high_retry_rate, attempts_exhausted}. Índices `(subscription_id, kind, fired_at desc)` e `(fired_at desc)`.
