# Runbook — Webhooks Win/Loss (`winloss-webhook-health-monitor`)

Monitora entregas de webhooks de win/loss e alerta sobre degradação.

## Gatilhos (settings em `winloss_alert_settings`, defaults entre parênteses)

| Kind | Condição |
| ---- | -------- |
| `consecutive_failures` | ≥ 5 falhas consecutivas numa assinatura |
| `high_retry_rate` | taxa de retry > 50% com ≥ 10 entregas na janela (30min) |
| `attempts_exhausted` | todas as 3 tentativas de um request falharam |

Anti-spam: supressão por `suppress_minutes` (60min) por kind/request.

## Diagnóstico

1. Painel Win/Loss Intelligence → Webhooks: ver a assinatura degradada.
2. `winloss_webhook_deliveries`: últimos `status`, `error_message`, `duration_ms`.
   - `status = 0` + `error_message` de DNS/timeout → endpoint do cliente fora.
   - `4xx` → payload/assinatura rejeitada (conferir `webhook-integrity`).
   - `5xx` intermitente → receiver degradado, esperar ou contatar o dono do endpoint.
3. `winloss_webhook_alerts`: histórico de alertas disparados/suprimidos.

## Mitigação

- Assinatura morta: pausar (`winloss_webhook_subscriptions.active = false`) e avisar o dono.
- Replay manual após correção do endpoint: `winloss-webhook-replay` /
  `winloss-webhook-replay-batch`.
- Falhas sistemáticas no dispatcher: ver `winloss-webhook-dispatcher` logs e `edge_retry_events`.

## Escalação

Alerta severity=critical → `SLACK_ALERT_WEBHOOK_URL` / Resend. Ver
`alertas-operacionais.md`.
