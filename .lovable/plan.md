
**Bloco Conversation Intelligence — item 3/4: Real-time Sentiment Stream**

Próxima atômica: visualizar **sentimento da call em tempo real ao longo da timeline**, gerando uma curva de sentimento por segmento da diarização que se sincroniza com o player de áudio — vendedor/gestor enxerga visualmente onde a conversa esquentou, esfriou ou virou.

## Estado atual
- `call_insights` armazena `sentiment_overall` mas é um único valor para a call inteira.
- `diarization` tem segmentos com `start`, `end`, `speaker`, `text` — base perfeita para sentiment por janela.
- Player de áudio em `RecordingSummaryDrawer` toca mas não tem overlay visual de momentos.
- Sem ancoragem visual de "onde virou" — gestor precisa ouvir tudo.

## Mudanças

### 1. Migration
- Tabela `call_sentiment_timeline`: `id`, `recording_id` (FK), `segment_index int`, `start_sec int`, `end_sec int`, `speaker text` (`salesperson|client|unknown`), `sentiment text` (`very_negative|negative|neutral|positive|very_positive`), `score numeric` (-1.0 a 1.0), `confidence numeric` (0-1), `excerpt text`, `created_at`. Index em `(recording_id, start_sec)`. RLS herda do recording (owner/admin/manager).
- View `call_sentiment_summary` agregando média por speaker + contagem de viradas (sentiment shifts).

### 2. Edge function `analyze-sentiment-timeline` (`verify_jwt = true`)
- Input: `{ recording_id }`.
- Lê `diarization`, agrupa em janelas de ~30s (ou 5 segmentos), chama Lovable AI (`google/gemini-2.5-flash-lite`) com tool calling: array de `{segment_index, sentiment, score, confidence, excerpt}`.
- Idempotente: deleta rows antigas da mesma `recording_id` antes de inserir.
- Auto-chain: chamada após `extract-coaching-actions` em `useTranscribeRecording`.
- Output: `{ recording_id, segments_count }`.

### 3. Hooks `src/hooks/conversational/`
- `useSentimentTimeline(recordingId)` — query lista ordenada por `start_sec`.
- `useAnalyzeSentiment()` — mutation re-roda análise.

### 4. UI
- `src/components/conversational/SentimentTimelineChart.tsx` (≤200L) — área stacked por speaker, eixo X = tempo, eixo Y = score (-1 a +1):
  - Recharts `AreaChart` com gradiente verde/vermelho.
  - Linha vertical clicável que sincroniza com `currentTime` do audio (callback `onSeek`).
  - Markers nos pontos de virada (delta ≥ 0.5).
  - Tooltip com excerpt do trecho.
- `src/components/conversational/sentimentHelpers.ts` — labels, cores por sentiment, função `detectShifts(timeline)` para markers.
- `src/components/conversational/SentimentBadge.tsx` (≤60L) — pill colorida usada no card overall.
- Editar `RecordingSummaryDrawer.tsx`: embed `<SentimentTimelineChart>` abaixo do player, propagar `currentTime` e `onSeek` (já existe ref do audio).

### 5. Configuração
- `supabase/config.toml`: `[functions.analyze-sentiment-timeline] verify_jwt = true`.

### 6. Validação
- `supabase--curl_edge_functions /analyze-sentiment-timeline` em recording real → confirma rows com `score` válido.
- `supabase--linter` zero novos warnings.
- Click no chart → audio salta para o timestamp.

## Arquivos
- **Migration**: 1 (1 tabela + view + RLS + index)
- **Criar**: `supabase/functions/analyze-sentiment-timeline/index.ts`
- **Criar**: `src/hooks/conversational/useSentimentTimeline.ts`
- **Criar**: 3 arquivos em `src/components/conversational/` (chart, helpers, badge)
- **Editar**: `src/components/conversational/RecordingSummaryDrawer.tsx`, `src/hooks/conversational/useTranscribeRecording.ts` (auto-chain), `supabase/config.toml`

Após esta entrega, sigo automaticamente para 4/4: **Momentos Críticos com Notificações** → fechando Conversation Intelligence em 10/10.
