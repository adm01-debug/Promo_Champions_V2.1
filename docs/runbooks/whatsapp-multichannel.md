# Runbook — WhatsApp/Multichannel (send-multichannel-message, multichannel-status-webhook)

## O que faz

- `send-multichannel-message`: envio de WhatsApp/SMS pelos providers
  configurados por tenant: `meta_cloud` (WhatsApp Cloud API —
  `graph.facebook.com/v20.0`), `twilio` (SMS/WhatsApp Twilio) e `zapi`.
  Credenciais lidas da tabela de credenciais de provider (ex.: Meta usa
  `phone_number_id` + `access_token`).
- `multichannel-status-webhook`: webhook público (`verify_jwt=false`) com
  verificação de assinatura — atualiza `outbound_messages` (entregue,
  lido, falha) e pode encerrar `sequence_enrollments` por reply.

## Configuração

| Item                                                       | Onde                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Credenciais Meta Cloud (`phone_number_id`, `access_token`) | tabela de credenciais de provider, via `/admin/conexoes`                                                              |
| Credenciais Twilio/Z-API                                   | idem                                                                                                                  |
| URL do status webhook                                      | `https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/multichannel-status-webhook` (registrar no painel do provider) |
| Mensagens enviadas                                         | tabela `outbound_messages`                                                                                            |

## Sinais de falha

- `send-multichannel-message` retornando `invalid_provider_credentials` (502)
  → token Meta/Twilio/Z-API expirado ou revogado.
- Mensagens enviadas mas `outbound_messages.status` nunca sai de
  `sent`/`queued` → status webhook não está registrado ou falha na
  verificação de assinatura.
- Meta respondendo erro de template/`24h window` → mensagem fora da janela
  exige template aprovado.

## Onde olhar

1. `/admin/conexoes` — estado e último teste das credenciais.
2. `outbound_messages` — coluna `status`/`error` por mensagem.
3. Logs das functions no dashboard Supabase.
4. Painel do provider (Meta Business → WhatsApp → logs da API; Twilio
   Console; Z-API dashboard) — erros lado-provider com reason code real.
5. `/admin/webhooks-timeline` e `/admin/webhooks-dead-letters` — entregas
   de webhook que falharam.

## Mitigação / rollback

- **Token Meta expirado**: Meta Cloud tokens de sistema expiram — gerar
  novo token e atualizar a credencial em `/admin/conexoes`.
- **Status webhook sem entrega**: re-registrar a URL no provider e validar
  o segredo de assinatura; replays de entregas perdidas via painel de
  dead-letters (`/admin/webhooks-dead-letters`) quando aplicável.
- **Falhas 24h/template**: reenviar com template aprovado — sem workaround
  técnico (regra da Meta).
- **Rollback**: redeploy da versão anterior da function via git.
