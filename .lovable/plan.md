
Conversation Intelligence 2/4 (Question Quality Scorer) entregue. Próxima atômica do bloco rumo aos 10/10.

**Conversation Intelligence — 3/4: Objection Handling Tracker**

Detecta objeções do cliente em cada call, classifica por tipo (preço, timing, autoridade, necessidade, concorrência, confiança), avalia a qualidade da resposta do vendedor (acknowledge → reframe → resolve) e gera score de handling + biblioteca de objeções recorrentes para coaching.

## O que entregar

### 1. Migration
- `call_objection_analysis`: `id`, `recording_id` FK UNIQUE, `total_objections int`, `resolved_count int`, `partially_resolved_count int`, `unresolved_count int`, `avg_response_time_seconds numeric`, `handling_score numeric` (0-100), `health` (`poor|fair|good|excellent`), `factors jsonb`, `calculated_at timestamptz`. RLS read authenticated, write admin/manager.
- `call_objections`: `id`, `recording_id` FK, `client_turn_index int`, `objection_text`, `objection_type` (`price|timing|authority|need|competition|trust|other`), `seller_response_text`, `response_quality` (`acknowledged|reframed|resolved|deflected|ignored`), `resolution_status` (`resolved|partial|unresolved`), `start_estimate numeric`, `factors jsonb`, `created_at`. RLS igual.
- `objection_library`: `id`, `objection_type`, `pattern_text`, `frequency_count int`, `best_response_text`, `best_response_recording_id`, `last_seen_at`, `updated_at`. RLS read authenticated, write admin/manager.
- Índices em `(recording_id)`, `(objection_type, last_seen_at desc)`. Realtime nas três.

### 2. Edge function `analyze-objection-handling` (verify_jwt=true)
- Input: `{ recording_id }`. Lê turns do cliente do `diarization`.
- Detector heurístico PT-BR por tipo:
  - **price**: "caro", "preço", "valor alto", "custo", "orçamento", "muito dinheiro".
  - **timing**: "agora não", "depois", "próximo ano", "não é o momento", "ainda não".
  - **authority**: "preciso falar", "não decido", "meu sócio", "diretor", "comitê", "aprovação".
  - **need**: "não preciso", "já temos", "não vejo valor", "resolve sozinho".
  - **competition**: "concorrente", nome de competidores conhecidos, "outra solução", "estamos vendo".
  - **trust**: "garantia", "nunca ouvi", "case", "referência", "risco", "segurança".
- Para cada objeção, captura próximos 1-3 turns do vendedor → classifica response_quality:
  - **resolved**: contém prova/dado/case + acknowledgment ("entendo", "faz sentido") + reframe.
  - **reframed**: acknowledgment + reframe sem prova concreta.
  - **acknowledged**: só reconheceu.
  - **deflected**: mudou de assunto sem reconhecer.
  - **ignored**: sem resposta no turno seguinte.
- resolution_status derivado: resolved/reframed→partial/unresolved. response_time = `seller.start - client.end`.
- handling_score: `(resolved*100 + partial*50 + unresolved*0) / total - latency_penalty(0-15)`.
- Health: <40 poor, 40-60 fair, 60-80 good, >80 excellent.
- Replace `call_objections` da recording + upsert `call_objection_analysis`.
- Atualiza `objection_library`: incrementa frequency_count por type+pattern; se response_quality='resolved' e melhor que existente, salva como best_response.
- Encadear em `useTranscribeRecording.ts` após `analyze-question-quality`.

### 3. Hooks `src/hooks/conversational/useObjectionAnalysis.ts`
- `useObjectionAnalysis(recordingId)` — query summary + realtime.
- `useCallObjections(recordingId)` — query lista + realtime.
- `useObjectionLibrary(filters?)` — biblioteca agregada.
- `useAnalyzeObjectionHandling()` — mutation.

### 4. Componentes `src/components/conversational/objections/`
- `ObjectionHandlingCard.tsx` (≤220L) — card no drawer: handling_score, health, donut por tipo, lista de objeções, botão recalcular.
- `ObjectionTypeDonut.tsx` (≤140L) — donut Recharts por type com paleta semântica.
- `ObjectionResolutionBar.tsx` (≤140L) — barra empilhada resolved/partial/unresolved.
- `ObjectionsList.tsx` (≤220L) — collapsible: cliente diz → vendedor responde, badge de quality + status, timestamp.
- `ObjectionLibraryPanel.tsx` (≤240L) — grid agregado para o hub: top 10 objeções por frequência, tipo, melhor resposta clicável (abre call).
- `objectionHelpers.ts` — `classifyObjection`, `classifyResponseQuality`, `qualityToStatus`, paletas, labels PT-BR.

### 5. Integração
- `RecordingSummaryDrawer.tsx`: `<ObjectionHandlingCard />` após `<QuestionQualityCard />`.
- `ConversationalIntelligenceHub.tsx`: `<ObjectionLibraryPanel onSelect={drawer.open} />` após `<QuestionFeedPanel />`.
- `supabase/config.toml`: `[functions.analyze-objection-handling] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após transcrever uma call: card mostra objeções detectadas, donut por tipo e barra de resolução; biblioteca no hub lista padrões recorrentes com melhor resposta.

## Arquivos
- **Migration**: 1 (3 tabelas + RLS + realtime + índices).
- **Edge function**: `analyze-objection-handling`.
- **Criar**: 4 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: `useTranscribeRecording.ts`, `RecordingSummaryDrawer.tsx`, `ConversationalIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **4/4: Coaching Scorecard Aggregator** fechando Conversation Intelligence em 10/10.
