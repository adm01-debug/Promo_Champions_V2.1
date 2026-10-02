# Runbook — Email transacional e bulk (Resend / SendGrid)

## O que faz

| Function | Papel |
|----------|-------|
| `send-transactional-email` | Envio transacional via Resend (`api.resend.com/emails`, provider "resend") |
| `email-bulk-send` | Campanhas bulk: monta lote, aplica rodapé de descadastro LGPD + header `List-Unsubscribe` (RFC 8058) e enfileira via RPC `enqueue_email` |
| `email-bulk-retry` | Re-enfileira jobs falhos de `email_bulk_jobs` |
| `inbound-email-webhook` | Webhook público (`verify_jwt=false`) de inbound — verifica Svix (Resend) ou assinatura SendGrid |
| `email-unsubscribe` | Endpoint público GET/POST (HTML) de descadastro |
| `send-churn-alert-email` / `send-alert-notifications` | Alertas internos por email (também via `enqueue_email`) |

## Configuração

| Item | Onde |
|------|------|
| `RESEND_API_KEY` | Secret das edge functions |
| `BULK_EMAIL_FROM` | Secret — remetente do bulk; fallback: `churn_alert_settings.email_from` |
| `ADMIN_NOTIFICATION_EMAIL` | Secret — destinatário de alertas internos |
| `UNSUBSCRIBE_SECRET` (descadastro) | Secret — valida links de unsubscribe |
| Jobs bulk | tabela `email_bulk_jobs` (+ tabela de destinatários) |

## Sinais de falha

- `email-bulk-send` respondendo `email_infra_missing`/`needsEmailSetup` →
  a infra de fila de email (`enqueue_email`) não está disponível no projeto.
- `sender_not_configured` → sem `BULK_EMAIL_FROM` e sem
  `churn_alert_settings.email_from`.
- 401/403 do Resend → `RESEND_API_KEY` errada ou revogada.
- Emails "enviados" mas sem recebimento → verificar domínio remetente
  verificado no Resend (DNS) e suppressions/bounces.
- Inbound não processando → falha de verificação Svix/SendGrid no
  `inbound-email-webhook`.

## Onde olhar

1. Resend Dashboard → Logs (cada email: delivered/bounced/complained).
2. `email_bulk_jobs` — estado dos lotes e contagens.
3. Logs das functions no Supabase; `/admin/platform-slo` para SLO de email.
4. `/admin/webhooks-dead-letters` — inbound que falhou após N tentativas.
5. Resend → Domains — status de verificação DKIM/SPF do remetente.

## Mitigação / rollback

- **`RESEND_API_KEY` inválida**: gerar nova chave no Resend → atualizar
  secret → não é preciso redeploy (secrets são lidos por invocação).
- **Domínio não verificado**: Resend → Domains → completar DNS (DKIM/SPF);
  enquanto isso, usar remetente do domínio já verificado.
- **Lote preso**: `email-bulk-retry` re-enfileira jobs falhos; se a falha
  for sistêmica (ex.: todos `email_infra_missing`), resolver a causa antes
  de re-tentar.
- **Inbound parado**: re-registrar o webhook no provider (Resend
  inbound/SendGrid Inbound Parse) e conferir o segredo de assinatura.
- **Rollback**: redeploy da versão anterior da function via git.
