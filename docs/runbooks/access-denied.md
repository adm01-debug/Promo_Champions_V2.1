# Runbook — Picos de acesso negado (`access-denied-alerts`)

Alerta quando a quantidade de eventos `access_denied` por usuário na janela de
monitoramento excede o threshold configurado.

## Gatilhos

| Métrica | Limite default | Onde configurar |
| ------- | -------------- | --------------- |
| negadas por usuário/janela | 10 | `access_denied_alert_settings` (tabela) |

Fonte: RPC/queries da própria função sobre `security_events`
(`event_type = 'access_denied'`).

## Diagnóstico

1. Liste os usuários no pico: o alerta já envia o top-10 com e-mails
   mascarados — desmasque só via query autenticada:
   `SELECT user_id, count(*) FROM security_events WHERE event_type='access_denied' AND created_at > now() - interval '1 hour' GROUP BY 1 ORDER BY 2 DESC;`
2. Verifique o `metadata->>'resource'` dos eventos para saber qual tela/rota está
   bloqueando — pico concentrado num recurso só costuma ser RLS errada ou role
   ausente, e não ataque.
3. Confirme se o usuário tem role correta em `user_roles` / `salespeople`.

## Mitigação

- RLS/permissão errada: corrija a policy ou o role do usuário e peça novo acesso.
- Scan/enumeração legítima de permissões: revogue sessões do usuário
  (`auth.admin.sign_out`) e revise o motivo do acesso.
- Falso positivo de threshold: ajuste `access_denied_alert_settings.threshold`.

## Escalação

Spike detectado → e-mail interno (`send-alert-notifications`) +
severity=critical → `SLACK_ALERT_WEBHOOK_URL` / Resend
(`ALERT_ESCALATION_EMAIL`, remetente `ALERT_FROM_EMAIL`).
