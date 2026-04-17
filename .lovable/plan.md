
Próxima atômica AI Generativo Avançado: **Meeting Summary AI** — transforma transcrições de reuniões/calls em resumos executivos acionáveis com action items, decisões, riscos e próximos passos. Reaproveita pipeline de Conversation Intelligence (call_recordings + transcript já existentes).

## Próxima Melhoria — Meeting Summary AI

### Estado atual
- Conversation Intelligence (3/7) entrega upload + transcrição + diarização.
- `call_recordings.transcript` já populado, mas usuário precisa ler tudo manualmente para extrair valor.
- Sem geração automática de: resumo executivo, action items, decisões, objeções, próximos passos.
- Sem persistência estruturada — atividades não recebem follow-ups automáticos das calls.

### Mudanças

**1. Migration**
- Colunas em `call_recordings`:
  - `summary text` — resumo executivo (3-5 parágrafos)
  - `action_items jsonb` — `[{ title, owner_hint, due_hint, priority }]`
  - `decisions jsonb` — `[{ text, made_by_hint }]`
  - `objections jsonb` — `[{ text, category }]`
  - `next_steps jsonb` — `[{ text, deadline_hint }]`
  - `key_topics text[]`
  - `sentiment text` (positive|neutral|negative|mixed)
  - `summarized_at timestamptz`
- RPC `update_call_recording_summary(_id, _payload)` SECURITY DEFINER + ownership check.
- RPC opcional `create_activities_from_action_items(_recording_id)` que insere `activities` com `type='follow_up'` para cada action_item (idempotente via tag).

**2. Edge function `summarize-call-recording` (nova, `verify_jwt = true`)**
- Input: `{ recording_id }`
- Lê transcript + diarization + metadados do contato vinculado (cliente/lead).
- Tool calling Lovable AI (`google/gemini-2.5-flash`) → tool `extract_meeting_summary` retorna estrutura completa.
- Prompt PT-BR consultivo, sensível ao contexto de vendas (objeções BANT, próximos passos SPIN).
- Persiste via RPC. Trata 429/402.
- Auto-trigger após diarização concluir (chamado de `diarize-call-recording` em background).

**3. Hooks**
- `useSummarizeRecording()` — mutation + invalidate cache.
- `useCreateActivitiesFromSummary()` — chama RPC para materializar action_items como atividades.
- `useCallRecordings`: expor novos campos.

**4. Componentes UI (≤300L cada)**
- `MeetingSummaryCard.tsx` — card com summary markdown + sentiment badge + key_topics chips.
- `ActionItemsList.tsx` — lista com checkbox, prioridade, botão "Criar atividade".
- `DecisionsAndObjectionsPanel.tsx` — duas colunas semânticas.
- `NextStepsTimeline.tsx` — timeline visual com deadlines.
- `SummarizeButton.tsx` — trigger manual quando ainda não resumido.
- `meetingSummaryHelpers.ts` — formatação, mapeamento sentiment→cor.

**5. Integração**
- `ConversationalIntelligence.tsx` — nova aba/seção "Resumo da Reunião" abaixo da diarização.
- `ClientDetailDrawer` / `LeadDetailDrawer` — mostrar últimos 3 resumos de calls relacionadas (compacto).
- `useTranscribeRecording` (chain): transcrição → diarização → resumo (encadeamento background).

**6. Validação**
- Smoke `supabase--curl_edge_functions` em recording transcrito real.
- Confere RLS (vendedor só vê próprios resumos).
- `supabase--linter` zero novos warnings.
- Console limpo, zero erros TS.

### Arquivos
- Criar migration (8 colunas + 2 RPCs)
- Criar `supabase/functions/summarize-call-recording/index.ts`
- Criar `src/hooks/conversational/useSummarizeRecording.ts`, `useCreateActivitiesFromSummary.ts`
- Criar `src/components/conversational/MeetingSummaryCard.tsx`, `ActionItemsList.tsx`, `DecisionsAndObjectionsPanel.tsx`, `NextStepsTimeline.tsx`, `SummarizeButton.tsx`, `meetingSummaryHelpers.ts`
- Editar `src/hooks/conversational/useCallRecordings.ts`, `useDiarizeRecording.ts` (chain), `src/pages/ConversationalIntelligence.tsx`, `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `supabase/config.toml`

Após esta entrega, sigo automaticamente para as próximas atômicas restantes da seção AI Generativo Avançado: Semantic Search expandida, AI Agents autônomos, Predictive Scoring com explainability — fechando AI Generativo em 10/10.
