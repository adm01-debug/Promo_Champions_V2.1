
**Bloco Conversation Intelligence — item 1/4: Searchable Call Library + Battle Cards Triggers**

Próxima atômica: criar **biblioteca de calls searchable** com full-text search no transcript + **battle cards triggers** que detectam menções a concorrentes e sugerem o material certo automaticamente.

## Estado atual
- `call_recordings` tem `transcript`, `key_topics`, `summary`, `diarization` — base completa.
- `call_insights` já tem `key_moments` e `coaching_tips` extraídos pelo `analyze-call`.
- `sales_enablement_assets` (categoria `battle_card`) já existe mas é estático — não dispara contextualmente.
- `/conversational-intelligence` lista calls mas sem busca por conteúdo do transcript.
- Sem detecção de concorrentes mencionados nas calls; sem trigger automático de battle card.

## Mudanças

### 1. Migration
- Coluna `transcript_tsv tsvector` em `call_recordings` (gerada de `transcript || summary || array_to_string(key_topics)`).
- Index GIN em `transcript_tsv` para full-text search (português).
- Trigger `update_transcript_tsv` no INSERT/UPDATE de `call_recordings`.
- Tabela `competitor_mentions`: `id`, `recording_id`, `competitor_name`, `timestamp_sec int`, `context_snippet text`, `battle_card_id uuid?`, `created_at`. RLS por owner.
- Tabela `competitors_registry`: `id`, `owner_id?` (null = global), `name`, `aliases text[]`, `default_battle_card_id uuid?`, `is_active bool`. RLS: SELECT all autenticados; INSERT/UPDATE admin/manager.
- RPC `search_call_library(_query text, _limit int)` → retorna recordings rankeados por `ts_rank` com snippet.

### 2. Edge function `detect-competitor-mentions` (`verify_jwt = true`)
- Input: `{ recording_id }`.
- Lê transcript + diarization. Para cada competitor em `competitors_registry`, busca matches (case-insensitive, com aliases) no transcript.
- Para cada match: extrai timestamp aproximado da diarization e snippet de ±100 chars.
- Insere em `competitor_mentions`, vincula ao battle card default se existir.
- Output: `{ mentions_count, competitors: [...] }`.
- Auto-chain: chamada após `summarize-call-recording` no `useTranscribeRecording`.

### 3. Hooks `src/hooks/conversational/`
- `useSearchCallLibrary(query)` — query com debounce, invoca RPC `search_call_library`.
- `useCompetitorMentions(recordingId)` — query mentions + battle cards relacionados.
- `useDetectCompetitors()` — mutation para re-rodar detecção manual.
- `useCompetitorsRegistry()` + `useUpsertCompetitor()` para admin.

### 4. UI
- `src/components/conversational/CallLibrarySearch.tsx` (≤180L) — input com debounce, lista de resultados com snippet highlighted, link para player com seek no timestamp.
- `src/components/conversational/CompetitorMentionsCard.tsx` (≤160L) — chips por competitor com count, expand para timestamps clicáveis (seek no áudio) + battle card recomendado inline.
- `src/components/conversational/BattleCardSuggestion.tsx` (≤120L) — card compacto exibindo o asset (`sales_enablement_assets`) sugerido com botão "Abrir" / "Copiar talking points".
- `src/components/conversational/CompetitorsAdminDialog.tsx` (≤180L) — admin/manager gerencia competitors + aliases + battle card default.
- Editar `src/pages/ConversationalIntelligence.tsx`: nova aba "Biblioteca" com `CallLibrarySearch`; embed `CompetitorMentionsCard` no detalhe de cada call.

### 5. Configuração
- `supabase/config.toml`: `[functions.detect-competitor-mentions] verify_jwt = true`.

### 6. Validação
- Linter zero novos warnings.
- `supabase--read_query` confirma trigger populando `transcript_tsv`.
- `supabase--curl_edge_functions /detect-competitor-mentions` em recording real → confirma mentions inseridos.

## Arquivos
- **Migration**: 1 (1 coluna+trigger+index, 2 tabelas, 1 RPC, RLS)
- **Criar**: `supabase/functions/detect-competitor-mentions/index.ts`
- **Criar**: `src/hooks/conversational/useCallLibrarySearch.ts`, `useCompetitorMentions.ts`, `useCompetitorsRegistry.ts`
- **Criar**: 4 componentes em `src/components/conversational/`
- **Editar**: `src/pages/ConversationalIntelligence.tsx`, `src/hooks/conversational/useTranscribeRecording.ts` (auto-chain), `supabase/config.toml`

Após esta entrega, sigo automaticamente para: **Coaching IA com Timestamps Clicáveis** → **Real-time Sentiment Stream** → **Momentos Críticos com Notificações** → fechando Conversation Intelligence em 10/10.
