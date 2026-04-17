
Próxima melhoria atômica da fila Conversation Intelligence: **2/7 — Audio Transcription Pipeline**.

## Melhoria 2/7 — Audio Transcription Pipeline (Whisper via Lovable AI)

### Estado atual
- 1/7 ✅: upload de áudio + storage privado + player funcionando.
- `call_recordings.status` aceita `'transcribing'|'transcribed'` mas nada popula automaticamente.
- Transcrição hoje é manual (textarea cole-aqui) → fluxo quebra a promessa de "Conversation Intelligence".
- Não há edge function de transcrição nem campo `transcript` persistido na gravação.

### Mudanças

**1. Migration**
- Coluna em `call_recordings`:
  - `transcript text` — texto completo transcrito
  - `transcript_language text default 'pt'`
  - `transcribed_at timestamptz`
  - `transcription_error text`
- RPC `update_call_recording_transcript(_id, _transcript, _language, _error)`: SECURITY DEFINER. Atualiza transcript + status + timestamps; checa ownership.

**2. Edge function `transcribe-call-recording` (nova)**
- POST `{ recording_id }`
- Busca gravação; valida ownership via JWT
- Gera URL assinada do `audio_url` no bucket privado
- Marca status='transcribing'
- Chama Lovable AI Gateway com modelo `google/gemini-2.5-flash` enviando áudio (base64 ou URL) + prompt: "Transcreva esta chamada de vendas em PT-BR, mantendo turnos Vendedor:/Cliente: quando possível"
- Persiste transcript via RPC; status='transcribed'
- Em erro: status='failed' + `transcription_error` populado
- Trata 429 (rate limit) e 402 (créditos) com mensagens específicas

**3. Hooks**
- `useTranscribeRecording()` — dispara edge function e invalida cache
- Atualizar `useCallRecordings` para retornar `transcript`, `transcript_language`, `transcribed_at`

**4. Componentes UI**
- `TranscribeButton.tsx`: botão "Transcrever com IA" no card da gravação selecionada (quando `status` ∈ {'ready','failed'})
- `TranscriptViewer.tsx`: viewer expansível com highlight de turnos Vendedor/Cliente, contador de palavras, botão "Copiar"
- Badge de status dinâmico: "Transcrevendo..." (loading), "Transcrito" (success), "Falha" (error tooltip com motivo)
- Auto-trigger opcional: ao concluir upload, dispara transcrição automaticamente (toggle no uploader)

**5. Integração**
- `ConversationalIntelligence.tsx`: 
  - Após upload: dispara `useTranscribeRecording` automaticamente se toggle ativo
  - Coluna 3: substitui textarea manual por `TranscriptViewer` quando há transcript persistido; senão mostra `TranscribeButton`
  - O fluxo "Analisar com IA" agora usa o transcript persistido como input, removendo o paste manual obrigatório

**6. Validação**
- Smoke RLS via `read_query` na coluna nova
- Upload de MP3 curto → click Transcribe → verifica transcript populado
- Verifica logs da edge function
- Linter Supabase: zero novos warnings; console limpo

### Arquivos
- Criar: migration (4 colunas + 1 RPC)
- Criar: `supabase/functions/transcribe-call-recording/index.ts`
- Criar: `src/hooks/conversational/useTranscribeRecording.ts`
- Criar: `src/components/conversational/TranscribeButton.tsx`, `TranscriptViewer.tsx`
- Editar: `src/hooks/conversational/useCallRecordings.ts`, `src/pages/ConversationalIntelligence.tsx`, `supabase/config.toml`

Após esta entrega (2/7), sigo automaticamente para 3/7 — Diarization & Talk Ratio, depois 4/7 Key Moment Detection, 5/7 Sentiment Analysis, 6/7 Battle Cards Auto-Trigger, 7/7 Searchable Call Library. Fechando Conversation Intelligence em 10/10.
