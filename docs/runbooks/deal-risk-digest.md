# Runbook — Digest de deals em risco (`deal-risk-digest`)

Envia diariamente ao Slack o resumo de negócios parados/em risco. Alerta
operacional dispara quando o próprio envio falha.

## Gatilhos

| Condição                              | Ação                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| POST no Slack falha (4xx/5xx/timeout) | log `slack_post_failed` + texto com link deste runbook |
| Query de deals falha                  | resposta 500 + log `deal_risk_query_failed`            |

Fonte: `SLACK_WEBHOOK_URL` (digest) — não confundir com
`SLACK_ALERT_WEBHOOK_URL` (canal de escalação).

## Diagnóstico

1. `slack_post_failed` com status 404/410: a webhook do Slack foi revogada ou o
   canal arquivado — gere nova Incoming Webhook e atualize o secret.
2. Timeouts repetidos: cheque status do Slack (status.slack.com) e se há
   circuit breaker aberto (`withEdgeCircuitBreaker`).
3. `deal_risk_query_failed`: valide as tabelas `sales`/`activities` — coluna ou
   policy removida quebra o SELECT.

## Mitigação

- Webhook inválida: trocar `SLACK_WEBHOOK_URL` no Supabase → Edge Functions →
  Secrets e reagendar o cron.
- Sem deals em risco: o digest sai vazio por design — não é erro.

## Escalação

Falhas repetidas de envio seguem o fluxo padrão: severity=critical →
`SLACK_ALERT_WEBHOOK_URL` / Resend (`ALERT_ESCALATION_EMAIL`,
remetente `ALERT_FROM_EMAIL`).
