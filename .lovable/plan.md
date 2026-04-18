
Conversation Intelligence 1/4 entregue. Próxima atômica do bloco.

**Conversation Intelligence — 2/4: Question Quality Scorer**

Avalia a qualidade das perguntas feitas pelo vendedor em cada call. Bons vendedores fazem perguntas abertas, profundas e bem distribuídas. Vamos detectar, classificar e pontuar.

## O que entregar

### 1. Migration
- `call_question_analysis`: `id`, `recording_id` FK UNIQUE, `total_questions int`, `open_questions int`, `closed_questions int`, `discovery_questions int` (situation/problem), `impact_questions int` (implication/need-payoff — SPIN), `leading_questions int` (penalizadas), `avg_depth numeric` (1-5), `question_density numeric` (perguntas/min), `quality_score numeric` (0-100), `health` (`poor|fair|good|excellent`), `factors jsonb`, `calculated_at timestamptz`. RLS read authenticated, write admin/manager.
- `call_questions`: `id`, `recording_id` FK, `turn_index int`, `text`, `category` (`open|closed|discovery|impact|leading|other`), `depth int` (1-5), `start_estimate numeric`, `created_at`. RLS igual.
- Índices `(recording_id)`, `(category)`, realtime nas duas.

### 2. Edge function `analyze-question-quality` (verify_jwt=true)
- Input: `{ recording_id }`. Lê `diarization` (turns do vendedor com `?` ou padrões interrogativos PT-BR: "como", "por que", "qual", "o que", "quando", "onde", "quem", "quanto").
- Classificador heurístico:
  - **closed**: começa com verbo ("é", "tem", "pode", "consegue", "quer") ou termina com "?" curto (<8 palavras) sem palavra-chave aberta.
  - **open**: contém "como", "por que", "o que", "qual", "de que forma".
  - **discovery**: open + tópicos de situação/problema ("hoje", "atualmente", "problema", "desafio", "dificuldade").
  - **impact**: contém "se", "imagine", "impacto", "consequência", "custo", "perderia".
  - **leading**: contém "não é mesmo", "concorda", "certo?", "verdade?".
  - **depth**: 1=closed; 2=open simples; 3=discovery; 4=impact; 5=impact + métricas/números.
- Score: `open_ratio*30 + discovery_ratio*20 + impact_ratio*30 - leading_ratio*20 + density_bonus(0-20)`.
- Insere `call_questions` (replace tudo da recording) + upsert `call_question_analysis`.
- Encadear em `useTranscribeRecording.ts` após `analyze-conversation-metrics`.

### 3. Hooks `src/hooks/conversational/`
- `useQuestionAnalysis(recordingId)` — query + realtime do summary.
- `useCallQuestions(recordingId)` — query lista detalhada + realtime.
- `useQuestionAnalysisFeed()` — top/bottom calls por quality_score.
- `useAnalyzeQuestionQuality()` — mutation.

### 4. Componentes `src/components/conversational/questions/`
- `QuestionQualityCard.tsx` (≤220L) — card no drawer: score, health badge, mini-stats, botão recalcular.
- `QuestionMixDonut.tsx` (≤140L) — donut Recharts: open/discovery/impact/closed/leading.
- `QuestionDepthChart.tsx` (≤160L) — barras de distribuição por depth 1-5.
- `QuestionsList.tsx` (≤200L) — lista colapsável das perguntas com badge de categoria/depth e timestamp.
- `QuestionFeedPanel.tsx` (≤200L) — top 5 calls com melhor score + bottom 5 (oportunidade de coaching) para hub.
- `questionHelpers.ts` — `classifyQuestion`, `calcDepth`, `qualityScore`, paleta por categoria.

### 5. Integração
- `RecordingSummaryDrawer.tsx`: inserir `QuestionQualityCard` após `ConversationMetricsCard`.
- `ConversationalIntelligenceHub.tsx`: adicionar `QuestionFeedPanel` após `ConversationMetricsFeed`.
- `supabase/config.toml`: `[functions.analyze-question-quality] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após transcrever uma call: card mostra score, donut, depth e lista; hub mostra top/bottom.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: `analyze-question-quality`.
- **Criar**: 4 hooks, 5 componentes + 1 helper.
- **Editar**: `useTranscribeRecording.ts`, `RecordingSummaryDrawer.tsx`, `ConversationalIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **3/4: Objection Handling Tracker** → **4/4: Coaching Scorecard Aggregator**, fechando Conversation Intelligence em 10/10.
