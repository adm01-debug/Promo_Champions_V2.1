
Próxima atômica do **Sales Engagement Avançado** (item 7/8 — última do bloco): **Click-to-call Twilio** — botão de discagem 1-clique direto do Power Dialer e do drawer de leads, com chamada via Twilio Voice API, gravação opcional e log automático em `call_logs`.

## Estado atual
- `call_logs` e `dialer_queue_items` já existem (entregues no item 6/8).
- `multichannel_credentials` já suporta provider `twilio` (Account SID + Auth Token) usado por SMS/WhatsApp.
- Sem botão "Ligar" funcional — usuário copia número e disca manualmente.
- Sem registro automático de duração, status (answered/no-answer/busy) ou gravação.

## Mudanças

### 1. Migration
- Tabela `twilio_call_sessions`: `id`, `owner_id`, `sale_id`, `queue_item_id?`, `call_sid text UNIQUE` (Twilio CallSid), `from_number`, `to_number`, `status text` (`initiated|ringing|in-progress|completed|busy|no-answer|failed|canceled`), `duration_seconds int`, `recording_url text?`, `recording_sid text?`, `price numeric?`, `started_at`, `ended_at`, `created_at`.
- Coluna `call_sid text` em `call_logs` (nullable, FK lógica para `twilio_call_sessions.call_sid`).
- RLS: owner vê o próprio; admin/manager veem tudo.
- Index em `(owner_id, created_at DESC)` e `(call_sid)`.

### 2. Edge function `twilio-click-to-call` (`verify_jwt = true`)
- Input: `{ to_number, sale_id, queue_item_id?, from_number? }`.
- Lê credenciais Twilio do owner em `multichannel_credentials` (channel=`sms`, provider=`twilio`).
- Resolve `from_number`: usa `from_number` do payload, ou primeiro número Twilio do owner.
- POST para `https://api.twilio.com/2010-04-01/Accounts/{SID}/Calls.json` com:
  - `To`, `From`, `Url` (TwiML público apontando para `twilio-call-twiml`), `StatusCallback` apontando para `twilio-call-status`, `Record=true`.
- Insere row em `twilio_call_sessions` com `status='initiated'`.
- Output: `{ ok, call_sid, session_id }`.

### 3. Edge function `twilio-call-twiml` (`verify_jwt = false`)
- Endpoint público chamado pelo Twilio quando a chamada conecta.
- Retorna XML TwiML simples: `<Response><Dial callerId="{from}">{agent_phone}</Dial></Response>` — conecta o cliente ao telefone do vendedor (lookup por `owner_id` em query string).
- Suporta `forward_to` configurado em `multichannel_credentials.config.agent_phone`.

### 4. Edge function `twilio-call-status` (`verify_jwt = false`)
- Webhook chamado pelo Twilio em cada mudança de status.
- Atualiza `twilio_call_sessions` por `call_sid`: status, duration, recording_url, ended_at.
- Quando `status=completed`: cria/atualiza row em `call_logs` com `disposition` mapeada (completed→connected, busy→busy, no-answer→no_answer, failed→no_answer) e `duration_seconds` real.

### 5. Hook `src/hooks/dialer/useClickToCall.ts`
- `useInitiateCall()` — mutation que invoca `twilio-click-to-call`, retorna `call_sid`.
- `useCallSession(callSid)` — query com refetch a cada 2s enquanto status ∈ {initiated, ringing, in-progress}.
- `useTwilioCredentialsCheck()` — verifica se owner tem credenciais Twilio configuradas.

### 6. UI
- `src/components/dialer/ClickToCallButton.tsx` (≤120L) — botão "Ligar agora" com ícone Phone:
  - Verifica credenciais → se faltar, abre toast com link para Multichannel.
  - Em chamada: mostra status live (Chamando… → Tocando → Em ligação 00:42).
  - Substitui automaticamente o `CurrentCallCard` quando integrado.
- `src/components/dialer/CallStatusBadge.tsx` (≤60L) — pill colorida por status com pulse.
- Integrar em:
  - `CurrentCallCard.tsx`: substitui o `<a href="tel:">` por `<ClickToCallButton>`.
  - `LeadDetailDrawer.tsx`: botão "Ligar" no header.
  - `ClientDetailDrawer.tsx`: idem.

### 7. Configuração
- `supabase/config.toml`: adicionar 3 entradas (`twilio-click-to-call` jwt=true, `twilio-call-twiml` jwt=false, `twilio-call-status` jwt=false).
- Documentar na UI do Multichannel: campo opcional `agent_phone` no provider Twilio (número que recebe a perna do vendedor).

### 8. Validação
- `supabase--curl_edge_functions /twilio-click-to-call` com payload mock → confirma 401 sem credenciais válidas.
- `supabase--read_query` confere session criada e RLS funcionando.
- `supabase--linter` zero novos warnings.

### Arquivos
- **Migration**: 1 (1 tabela + 1 coluna em call_logs + RLS + indexes)
- **Criar**: `supabase/functions/twilio-click-to-call/index.ts`, `twilio-call-twiml/index.ts`, `twilio-call-status/index.ts`
- **Criar**: `src/hooks/dialer/useClickToCall.ts`
- **Criar**: `src/components/dialer/ClickToCallButton.tsx`, `CallStatusBadge.tsx`
- **Editar**: `src/components/dialer/CurrentCallCard.tsx`, `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `supabase/config.toml`, `src/components/multichannel/multichannelHelpers.ts` (add `agent_phone` opcional ao Twilio)

Após esta entrega, **Sales Engagement Avançado fecha 8/8 (10/10)** e sigo automaticamente para o próximo bloco do `GAPS_CLASSE_MUNDIAL.md`.
