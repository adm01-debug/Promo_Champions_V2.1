
**Bloco Conversation Intelligence — item 2/4: Coaching IA com Timestamps Clicáveis**

Próxima atômica: transformar os `coaching_tips` (já gerados em `call_insights`) em **coaching acionável com timestamps clicáveis**, vinculando cada dica a um momento exato da call e permitindo ao gestor/vendedor pular direto para o trecho problemático no player de áudio.

## Estado atual
- `call_insights.coaching_tips` é um `jsonb[]` com `{tip, category, severity}` mas sem âncora temporal.
- `key_moments` tem timestamps mas não está cruzado com tips.
- `RecordingSummaryDrawer` mostra tips como lista estática — sem seek, sem severidade visual, sem accept/dismiss.
- Sem histórico de coaching por vendedor (gestor não vê evolução).

## Mudanças

### 1. Migration
- Tabela `coaching_actions`: `id`, `recording_id`, `salesperson_id`, `tip text`, `category text` (`opening|discovery|objection|closing|talk_ratio|pace|empathy`), `severity text` (`info|warning|critical`), `timestamp_sec int?`, `quote text?` (trecho exato citado), `status text` (`pending|accepted|dismissed|practiced`), `manager_note text?`, `accepted_at`, `created_by_ai bool default true`, `created_at`, `updated_at`. RLS: salesperson vê o próprio; manager/admin veem todos.
- Index `(salesperson_id, status, created_at desc)`.
- RPC `coaching_progress_by_salesperson(_days int)` → agrega counts por categoria/severity/status.

### 2. Edge function `extract-coaching-actions` (`verify_jwt = true`)
- Input: `{ recording_id }`.
- Lê `transcript`, `diarization`, `call_insights` da gravação.
- Chama Lovable AI (`google/gemini-2.5-flash`) com prompt estruturado pedindo JSON: array de `{tip, category, severity, timestamp_sec, quote}` baseado em momentos reais da diarização.
- Insere rows em `coaching_actions` (idempotente: deleta `pending` antigos da mesma recording antes).
- Auto-chain: chamada após `summarize-call-recording` no `useTranscribeRecording`.

### 3. Hooks `src/hooks/conversational/`
- `useCoachingActions(recordingId)` — lista actions da call.
- `useCoachingActionsBySalesperson(salespersonId, days)` — histórico do vendedor.
- `useUpdateCoachingAction()` — mutation para `status` + `manager_note`.
- `useExtractCoaching()` — mutation para re-rodar extração.
- `useCoachingProgress(days)` — invoca RPC para gestor.

### 4. UI
- `src/components/conversational/CoachingActionsList.tsx` (≤200L) — lista por severity (critical→warning→info), cada item com:
  - Badge categoria + severity colorida.
  - Timestamp clicável (chama `onSeek`).
  - Quote em itálico do trecho citado.
  - Botões: ✓ Aceitar, ✗ Dispensar, 💪 Pratiquei.
  - Campo `manager_note` (só manager/admin).
- `src/components/conversational/CoachingProgressCard.tsx` (≤160L) — donut por status (pending/accepted/practiced) + barras por categoria, usado no perfil do vendedor.
- `src/components/conversational/coachingHelpers.ts` — labels, cores por categoria/severity, ícones.
- Editar `RecordingSummaryDrawer.tsx`: substituir lista estática de tips por `<CoachingActionsList recordingId={...} onSeek={seekAudio}>`.
- Editar `SalespersonProfile.tsx` (ou hub equivalente): adicionar `<CoachingProgressCard salespersonId={id}>`.

### 5. Configuração
- `supabase/config.toml`: `[functions.extract-coaching-actions] verify_jwt = true`.

### 6. Validação
- `supabase--curl_edge_functions /extract-coaching-actions` em recording real → confirma rows com timestamp válido.
- `supabase--linter` zero novos warnings.
- Player segue até o timestamp ao clicar.

## Arquivos
- **Migration**: 1 (1 tabela + RLS + index + RPC)
- **Criar**: `supabase/functions/extract-coaching-actions/index.ts`
- **Criar**: `src/hooks/conversational/useCoachingActions.ts`, `useCoachingProgress.ts`
- **Criar**: 3 arquivos em `src/components/conversational/` (lista, progress, helpers)
- **Editar**: `src/components/conversational/RecordingSummaryDrawer.tsx`, `src/hooks/conversational/useTranscribeRecording.ts` (auto-chain), `supabase/config.toml`, e o perfil do vendedor para embedar progress

Após esta entrega, sigo automaticamente para: **Real-time Sentiment Stream** → **Momentos Críticos com Notificações** → fechando Conversation Intelligence em 10/10.
