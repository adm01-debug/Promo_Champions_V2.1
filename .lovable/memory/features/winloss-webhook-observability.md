---
name: winloss-webhook-observability
description: Dispatcher + DLQ + replay + timeline endpoint correlacionando entregas/dead-letters/alertas por requestId e subscriptionId
type: feature
---

Webhook Win/Loss possui pipeline completo de observabilidade:

- **Dispatcher** (`winloss-webhook-dispatcher`): retries 3x, backoff exp+jitter, timeout 8s, persiste cada tentativa em `winloss_webhook_deliveries` (incluindo `request_id` para correlação) e empurra falhas finais para `winloss_webhook_dead_letters` (também com `request_id`). Envelope estável `{ requestId, error, dispatched, results }` + header `X-Request-Id`.
- **Replay** (`winloss-webhook-replay`): replay de DLQ ou delivery histórico com retries e logs estruturados.
- **Health monitor** (`winloss-webhook-health-monitor`): grava em `winloss_webhook_alerts` (consecutive_failures, high_retry_rate).
- **Timeline endpoint** (`winloss-webhook-timeline`): admin-only, aceita `{ requestId?, subscriptionId?, since?, limit? }` (UUIDs; pelo menos um filtro). Mescla deliveries + dead_letters + alerts em ordem cronológica retornando `TimelineItem[]` (`source`, `kind`, `status`, `succeeded`, `attempt`, `duration_ms`, `event`, `message`, `ref_id`, `details`). Frontend: hook `useWebhookTimeline` + página `/admin/webhooks-timeline`.
