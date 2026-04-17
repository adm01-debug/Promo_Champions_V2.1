
Próxima melhoria atômica da fila Sales Engagement: **7/7 — Multichannel Native Send (WhatsApp + SMS)**. Esta fecha a fila em 10/10.

## Melhoria 7/7 — Multichannel Native Send

### Estado atual
- 1-6/7 ✅ entregues. Sequences executam steps de email com STO, A/B, IA, engagement scoring e auto-pause.
- Steps de tipo `whatsapp` e `sms` existem no schema mas o `sequence-runner` apenas registra a atividade — não envia mensagem real.
- Não há integração com provedores (Twilio/MessageBird/Z-API/Meta Cloud API) nem templates por canal.
- Multichannel Hub (`/multichannel`) exibe interações inbound mas não permite envio outbound nativo a partir de sequences.

### Mudanças

**1. Migration**
- Tabela `channel_credentials`: provedores conectados por owner (`owner_id`, `channel` enum 'whatsapp'|'sms', `provider` 'twilio'|'meta_cloud'|'zapi'|'messagebird', `credentials jsonb` cifrado, `from_number`, `enabled`, `verified_at`)
- Tabela `outbound_messages`: log unificado de envios (`id`, `enrollment_id`, `step_id`, `channel`, `provider`, `to_number`, `body`, `provider_message_id`, `status` 'queued'|'sent'|'delivered'|'read'|'failed', `error`, `sent_at`, `delivered_at`)
- Coluna em `sequence_steps`: `whatsapp_template_id text` (para templates aprovados Meta)
- RPC `record_outbound_message(_enrollment_id, _step_id, _channel, _to, _body, _provider, _provider_msg_id, _status)`: SECURITY DEFINER. Insere log + signal de engagement.
- RLS: SELECT/INSERT em ambas tabelas para owner via has_role + ownership

**2. Edge function `send-multichannel-message` (nova)**
- POST `{ ownerId, channel, to, body, templateId? }`
- Busca `channel_credentials` ativos do owner
- Roteador por provider:
  - `twilio` → POST `https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json` (Basic Auth)
  - `meta_cloud` → POST `https://graph.facebook.com/v20.0/{phone_id}/messages` (Bearer token, template ou texto)
  - `zapi` → POST `https://api.z-api.io/instances/{id}/token/{token}/send-text`
- Sempre grava em `outbound_messages` via RPC
- Retorna `{ ok, message_id, provider_status }`

**3. Edge function `multichannel-status-webhook` (nova, verify_jwt=false)**
- Recebe callbacks de status (delivered/read/failed) dos providers
- Atualiza `outbound_messages` por `provider_message_id`
- Se status=read, dispara signal de engagement (open equivalente)

**4. Edge function `sequence-runner` (update)**
- Para steps `whatsapp`/`sms`: invoca `send-multichannel-message` em vez de só registrar activity
- Se sem credenciais: pula step graciosamente e marca `skipped_no_channel` em metadata
- Se falha de envio: marca step como `failed` mas continua sequência (não pausa toda)

**5. Hooks**
- `useChannelCredentials()` — CRUD de credenciais (lista/cria/desabilita)
- `useOutboundMessages(enrollmentId?)` — log de envios
- `useTestChannelSend()` — botão "Enviar teste" em settings

**6. Componentes UI (≤300L cada)**
- `ChannelCredentialsManager.tsx`: tela em `/configuracoes` (nova aba "Canais") — lista provedores conectados + botão "Adicionar" com dialog por provider
- `ProviderConnectionDialog.tsx`: form dinâmico com campos por provider (Twilio: SID+token+from; Meta: phone_id+token; Z-API: instance+token)
- `TestSendButton.tsx`: dispara envio teste para número informado
- `OutboundMessageLog.tsx`: tabela em SequenceEnrollmentsDrawer mostrando últimos envios do enrollment com status colorido
- `multichannelHelpers.ts`: labels de status, ícones por canal, formatação E.164

**7. Integração**
- `SettingsPage.tsx`: nova aba "Canais" com `ChannelCredentialsManager`
- `SequenceStepDialog.tsx`: ao escolher channel=whatsapp, mostra campo `whatsapp_template_id` (opcional)
- `SequenceEnrollmentsDrawer.tsx`: expand detalha com `OutboundMessageLog`
- `MultichannelPage.tsx` (`/multichannel`): adiciona widget "Envios via Sequences" mostrando volume últimos 7d por canal

**8. Validação**
- Smoke RLS: `read_query` em `channel_credentials` e `outbound_messages` (owner only)
- Mock provider: edge function aceita header `X-Mock-Provider: true` → simula resposta sem chamar API real
- Inserir credencial mock + criar step whatsapp + rodar runner → verifica `outbound_messages` populado
- Webhook status: POST simulado → verifica update de status
- Linter Supabase: zero novos warnings; console limpo; zero erros TS

### Arquivos
- Criar: migration nova (2 tabelas + 1 coluna + 1 RPC + RLS)
- Criar: `supabase/functions/send-multichannel-message/index.ts`, `supabase/functions/multichannel-status-webhook/index.ts`
- Criar: `src/hooks/multichannel/useChannelCredentials.ts`, `useOutboundMessages.ts`
- Criar: `src/components/multichannel/ChannelCredentialsManager.tsx`, `ProviderConnectionDialog.tsx`, `TestSendButton.tsx`, `OutboundMessageLog.tsx`, `multichannelHelpers.ts`
- Editar: `supabase/functions/sequence-runner/index.ts`, `supabase/config.toml`, `src/pages/Settings.tsx` (ou equivalente), `src/components/sequences/SequenceStepDialog.tsx`, `src/components/sequences/SequenceEnrollmentsDrawer.tsx`, `src/pages/MultichannelHub.tsx`

Após esta entrega, a fila **Sales Engagement chega a 10/10** com todas as 7 melhorias atômicas concluídas. Sigo automaticamente para a próxima fila listada em `docs/GAPS_CLASSE_MUNDIAL.md` mantendo o mesmo padrão.
