# Runbook — Edge retries exauridos (`edge-retry-threshold-alert`)

Alerta quando `edge_retry_events` com `outcome = 'exhausted'` excede o
threshold na janela (default: > 10 eventos em 24h).

## O que significa

`withRetry` (`_shared/retry.ts`) desiste após N tentativas e registra um evento
`exhausted` por (function_name, operation). Muitos eventos = integração externa
sistematicamente falhando (Slack, Resend, Twilio, gateway de IA, etc.).

## Diagnóstico

```sql
SELECT function_name, operation, status_code, error_name, count(*)
FROM edge_retry_events
WHERE outcome = 'exhausted' AND created_at > now() - interval '24 hours'
GROUP BY 1, 2, 3, 4 ORDER BY 5 DESC;
```

- `status_code` 429 → rate limit do provider (ajustar `send-pacer`/backoff).
- `status_code` 5xx → provider degradado (checar status page).
- `error_name` AbortError/TypeError → rede/DNS ou timeout curto demais.

## Mitigação

- Provider fora: aguardar ou reduzir o volume; `circuit-breaker` abre sozinho e
  o alerta inclui as top funções ofensoras.
- Threshold enviesado: ajustar `EDGE_RETRY_EXHAUSTED_THRESHOLD` /
  `EDGE_RETRY_ALERT_WINDOW_HOURS` (secrets da function).

## Escalação

Alerta severity=critical → `SLACK_ALERT_WEBHOOK_URL` / Resend. Ver
`alertas-operacionais.md`.
