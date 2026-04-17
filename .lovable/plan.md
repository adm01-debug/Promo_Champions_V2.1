
Próxima melhoria atômica da fila Sales Engagement: **6/7 — Reply Detection & Auto-Pause**.

## Melhoria 6/7 — Reply Detection & Auto-Pause

### Estado atual
- 1-5/7 ✅ entregues. `sequence-record-reply` grava replies manualmente e atualiza engagement.
- Não há detecção automática de respostas via webhook de provedor de email (Resend/SendGrid/IMAP).
- Sequências continuam disparando passos mesmo após o lead responder, gerando ruído e queimando contatos.
- Replies via outras superfícies (atividade manual, WhatsApp inbound) não pausam a sequência.

### Mudanças

**1. Migration**
- Coluna em `sequence_enrollments`:
  - `auto_paused_at timestamptz` — quando foi pausado automaticamente
  - `auto_pause_reason text` — 'reply_detected' | 'bounce' | 'unsubscribe' | 'manual_activity'
- Coluna em `sequences`:
  - `auto_pause_on_reply boolean default true`
  - `auto_pause_on_bounce boolean default true`
- Tabela `inbound_reply_events`: log bruto de eventos recebidos (`provider`, `message_id`, `from_email`, `subject`, `received_at`, `matched_enrollment_id`, `payload jsonb`)
- RPC `auto_pause_enrollment(_enrollment_id, _reason)`: SECURITY DEFINER. Atualiza status='paused', grava timestamp/reason, registra signal de reply, recompute engagement.
- RPC `match_reply_to_enrollment(_contact_email, _received_at)`: encontra enrollment ativo recente do contato (via `sales.email`/`clients.email`)
- RLS: SELECT/INSERT em `inbound_reply_events` para admin + service role

**2. Edge function `inbound-email-webhook` (nova, verify_jwt=false)**
- POST genérico que aceita payloads Resend/SendGrid (detecta formato pelo header)
- Extrai `from`, `subject`, `message_id`, `in_reply_to`
- Chama `match_reply_to_enrollment` → se match, chama `auto_pause_enrollment` + `sequence-record-reply` interno
- Sempre grava em `inbound_reply_events` (mesmo sem match) para auditoria
- Retorna 200 sempre (evita retry storms)

**3. Edge function `sequence-runner` (update)**
- Antes de executar passo: verifica `enrollment.status` ≠ 'paused' E `auto_paused_at` IS NULL
- Verifica também se houve `activity` do tipo 'reply'/'inbound' nas últimas 24h para o contato → auto-pausa por `manual_activity`

**4. Trigger em `activities`**
- AFTER INSERT em `activities` WHERE type IN ('reply','email_received','whatsapp_inbound') → busca enrollments ativos do contato → chama `auto_pause_enrollment` se sequência tem `auto_pause_on_reply=true`

**5. Hooks**
- `useAutoPauseSettings(sequenceId)` — toggles de auto-pause
- `useResumeEnrollment()` — retoma enrollment auto-pausado manualmente
- `useInboundReplyEvents(limit)` — log de eventos para admin

**6. Componentes UI (≤250L cada)**
- `AutoPauseSettingsCard.tsx`: 2 switches no `SequenceBuilder` (pause on reply / pause on bounce)
- `AutoPausedBadge.tsx`: badge "⏸ Auto-pausado: resposta detectada" no `SequenceEnrollmentsDrawer`
- `ResumeEnrollmentButton.tsx`: botão para retomar manualmente
- `InboundReplyLogPanel.tsx`: tabela admin em `/admin` com últimos eventos recebidos
- `autoReplyHelpers.ts`: labels de razão, formatação

**7. Integração**
- `SequenceBuilder.tsx`: adiciona `AutoPauseSettingsCard` abaixo do toggle STO
- `SequenceEnrollmentsDrawer.tsx`: badge + botão resume quando auto-pausado
- `Admin/Index.tsx`: novo painel `InboundReplyLogPanel`

**8. Validação**
- Smoke RLS via `read_query` na nova tabela
- Simular POST no webhook com payload Resend → verifica match + pause
- Inserir activity tipo 'reply' → trigger auto-pausa enrollment
- Verificar badge no drawer e botão resume funcionando
- Linter Supabase: zero novos warnings; console limpo

### Arquivos
- Criar: migration nova (1 tabela + 4 colunas + 2 RPCs + trigger + RLS)
- Criar: `supabase/functions/inbound-email-webhook/index.ts`
- Criar: `src/hooks/sequences/useAutoPause.ts`
- Criar: `src/components/sequences/AutoPauseSettingsCard.tsx`, `AutoPausedBadge.tsx`, `ResumeEnrollmentButton.tsx`, `autoReplyHelpers.ts`
- Criar: `src/components/admin/InboundReplyLogPanel.tsx`
- Editar: `supabase/functions/sequence-runner/index.ts`, `supabase/config.toml`, `src/components/sequences/SequenceBuilder.tsx`, `src/components/sequences/SequenceEnrollmentsDrawer.tsx`, `src/pages/Admin.tsx` (ou equivalente)

Após esta, sigo automaticamente para **7/7 — Multichannel Native Send (WhatsApp + SMS)** para fechar a fila Sales Engagement em 10/10.
