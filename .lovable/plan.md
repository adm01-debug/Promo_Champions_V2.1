
Sales Engagement ✅ 10/10. Próxima fila: **Conversation Intelligence** (gap CRÍTICO, 20% cobertura). Fila de 7 melhorias atômicas — vou executar a 1ª agora.

## Melhoria 1/7 — Call Recording Upload & Storage

### Estado atual
- Não existe módulo de gravação de chamadas no projeto.
- Activities apenas registram metadata (tipo, duração) — sem áudio anexado.
- Sem bucket de storage para áudio nem schema para gravações.

### Mudanças

**1. Migration**
- Tabela `call_recordings`:
  - `id`, `owner_id`, `contact_id`, `contact_type` ('lead'|'client'), `deal_id`, `activity_id`
  - `title`, `provider` ('upload'|'zoom'|'meet'|'teams'|'twilio'), `provider_call_id`
  - `audio_url`, `audio_duration_sec`, `audio_size_bytes`, `mime_type`
  - `status` ('uploading'|'ready'|'transcribing'|'transcribed'|'failed')
  - `recorded_at`, `created_at`, `updated_at`, `metadata jsonb`
- Storage bucket `call-recordings` (privado)
- Policies: owner CRUD próprias gravações + admin/manager visualizam tudo
- Storage policies análogas (path `{owner_id}/{recording_id}.{ext}`)
- RPC `register_call_recording`: SECURITY DEFINER. Registra metadata após upload.

**2. Hooks**
- `useCallRecordings(filters)` — lista gravações
- `useUploadCallRecording()` — upload p/ storage + insert
- `useDeleteCallRecording()` — remove arquivo + linha
- `useCallRecording(id)` — single recording

**3. Componentes UI (≤300L cada)**
- `CallRecordingsPage.tsx` (`/conversation-intelligence`): grid de gravações com filtros, busca, status
- `CallRecordingUploader.tsx`: dropzone + form (título, contato, deal opcional)
- `CallRecordingCard.tsx`: thumbnail c/ duração, status, ações
- `CallRecordingPlayer.tsx`: player HTML5 com waveform básico (Tailwind), controles
- `callRecordingHelpers.ts`: formatação de duração, ícones por provider, badges de status

**4. Integração**
- Nova rota `/conversation-intelligence` em `AppRoutes.tsx` (lazy)
- Item de menu na sidebar (grupo CRM/Vendas)
- Card no `ClientDetailDrawer` e `LeadDetailDrawer` mostrando gravações vinculadas
- Botão "Anexar gravação" em `ActivityCard` quando type=call

**5. Validação**
- Smoke RLS via `read_query` na nova tabela
- Upload de arquivo MP3 teste → verifica bucket + linha criada
- Player reproduz áudio
- Linter Supabase: zero novos warnings; console limpo

### Arquivos
- Criar: migration (1 tabela + bucket + RLS + RPC)
- Criar: `src/hooks/conversation/useCallRecordings.ts`
- Criar: `src/components/conversation/CallRecordingUploader.tsx`, `CallRecordingCard.tsx`, `CallRecordingPlayer.tsx`, `callRecordingHelpers.ts`
- Criar: `src/pages/ConversationIntelligence.tsx`
- Editar: `src/routes/AppRoutes.tsx`, `src/components/layout/AppSidebar.tsx` (ou equivalente), `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`

Após esta entrega (1/7), sigo automaticamente para 2/7 — Audio Transcription Pipeline (Whisper via Lovable AI), depois 3/7 Diarization & Talk Ratio, 4/7 Key Moment Detection, 5/7 Sentiment Analysis, 6/7 Battle Cards Auto-Trigger, 7/7 Searchable Call Library. Fechando Conversation Intelligence em 10/10.
