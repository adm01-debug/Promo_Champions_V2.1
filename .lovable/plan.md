
Conversation Intelligence está em 2/7. Próxima atômica: **3/7 — Diarization & Talk Ratio**.

## Melhoria 3/7 — Diarization & Talk Ratio

### Estado atual
- 2/7 ✅: transcrição automática via Gemini com turnos `Vendedor:` / `Cliente:` quando o modelo consegue identificar.
- Não há métrica quantitativa de quem falou mais, tempo médio de turno, monólogos longos ou interrupções.
- Sem visualização de timeline de fala nem coaching baseado em talk ratio (benchmark Gong: vendedor ideal fala 40-50%).

### Mudanças

**1. Migration**
- Coluna em `call_recordings`:
  - `talk_ratio_seller numeric` (0-100, % do tempo falado pelo vendedor)
  - `talk_ratio_client numeric`
  - `longest_monologue_sec int` (maior bloco contínuo do vendedor)
  - `interruptions_count int`
  - `turns_count int`
  - `diarization jsonb` — array de turnos `[{speaker, text, start_estimate, duration_estimate, word_count}]`
  - `diarized_at timestamptz`
- RPC `update_call_recording_diarization(_id, _diarization, _stats)`: SECURITY DEFINER + ownership check.

**2. Edge function `diarize-call-recording` (nova)**
- POST `{ recording_id }`
- Lê `transcript` da gravação (requer status='transcribed')
- Parser determinístico: separa por linhas iniciadas em `Vendedor:` / `Cliente:` / `Speaker N:`
- Estima duração por turno proporcional a word_count vs `audio_duration_sec`
- Calcula stats: talk_ratio, longest_monologue, turns_count, interruptions (turnos < 3 palavras seguidos de troca)
- Quando heurística falhar (transcript sem rótulos), invoca Lovable AI (Gemini 2.5 Flash) para reclassificar turnos
- Persiste via RPC

**3. Hooks**
- `useDiarizeRecording()` — dispara edge + invalida cache
- `useCallRecordings`: expor novos campos

**4. Componentes UI (≤300L cada)**
- `TalkRatioBar.tsx`: barra horizontal Vendedor vs Cliente com cores semânticas + benchmark zone (40-50% ideal)
- `DiarizationTimeline.tsx`: faixa horizontal segmentada por turno (hover = preview do texto)
- `CallStatsPanel.tsx`: cards compactos (Turnos, Maior monólogo, Interrupções, Talk Ratio)
- `DiarizeButton.tsx`: ação manual quando ainda não diarizado
- Auto-trigger: ao concluir transcrição, dispara diarização automaticamente

**5. Integração**
- `ConversationalIntelligence.tsx`: 
  - Coluna 3, abaixo do `TranscriptViewer`: insere `TalkRatioBar` + `CallStatsPanel` + `DiarizationTimeline`
  - Insight de coaching: badge "Talk ratio acima do ideal" se vendedor > 65%
- `useTranscribeRecording` (update): após sucesso, dispara `diarize-call-recording` em background

**6. Validação**
- Smoke RLS via `read_query` nas novas colunas
- Gravação transcrita → click Diarizar → verifica colunas populadas
- Linter Supabase: zero novos warnings; console limpo; zero erros TS

### Arquivos
- Criar: migration (7 colunas + 1 RPC)
- Criar: `supabase/functions/diarize-call-recording/index.ts`
- Criar: `src/hooks/conversational/useDiarizeRecording.ts`
- Criar: `src/components/conversational/TalkRatioBar.tsx`, `DiarizationTimeline.tsx`, `CallStatsPanel.tsx`, `DiarizeButton.tsx`, `diarizationHelpers.ts`
- Editar: `src/hooks/conversational/useCallRecordings.ts`, `src/hooks/conversational/useTranscribeRecording.ts`, `src/pages/ConversationalIntelligence.tsx`, `supabase/config.toml`

Após esta entrega (3/7), sigo automaticamente para 4/7 — Key Moment Detection, depois 5/7 Sentiment Analysis, 6/7 Battle Cards Auto-Trigger, 7/7 Searchable Call Library. Fechando Conversation Intelligence em 10/10.
