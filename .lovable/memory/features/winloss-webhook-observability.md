---
name: winloss-webhook-observability
description: Dispatcher + DLQ + replay + timeline endpoint correlacionando entregas/dead-letters/alertas por requestId e subscriptionId end-to-end
type: feature
---

Webhook Win/Loss possui pipeline completo de observabilidade com correlação ponta-a-ponta por `requestId`:

- **Dispatcher** (`winloss-webhook-dispatcher`): retries 3x, backoff exp+jitter, timeout 8s. Aceita `X-Request-Id` (header) ou `__request_id` (payload) inbound; gera UUID novo se ausente. Persiste cada tentativa em `winloss_webhook_deliveries.request_id` e DLQ em `winloss_webhook_dead_letters.request_id` (+ `last_replay_request_id` em replays). Outbound HTTP fetch envia `X-Request-Id`, `X-Winloss-Subscription-Id` e `X-Winloss-Event` para o receptor. Envelope estável `{ requestId, error, dispatched, results }` + header `X-Request-Id`.
- **Replay** (`winloss-webhook-replay`): forward do próprio `requestId` para o dispatcher (header + `__request_id` payload), garantindo flow único replay → dispatch → delivery → DLQ. Persiste `last_replay_request_id` em todos os outcomes DLQ.
- **Health monitor** (`winloss-webhook-health-monitor`): grava em `winloss_webhook_alerts` com `request_id` top-level (+ duplicado em `details.request_id` para histórico).
- **Timeline endpoint** (`winloss-webhook-timeline`): admin-only, aceita `{ requestId?, subscriptionId?, since?, limit? }`. Mescla deliveries + dead_letters + alerts em ordem cronológica retornando `TimelineItem[]`. Alerts agora também filtráveis por `request_id`. Frontend: hook `useWebhookTimeline`, página `/admin/webhooks-timeline` com âncoras por tentativa, listagem `WebhookSubscriptionLatestList` no painel de saúde com link rápido para timeline filtrada por requestId.

Schema correlacional:
- `winloss_webhook_deliveries.request_id uuid` (indexado)
- `winloss_webhook_dead_letters.request_id uuid` + `last_replay_request_id uuid` (indexados)
- `winloss_webhook_alerts.request_id uuid` (indexado)
