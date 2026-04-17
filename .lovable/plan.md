
Próxima atômica AI Generativo Avançado: **Semantic Search expandida** — busca vetorial unificada sobre clientes, leads, deals, atividades e gravações de calls. Hoje só existe busca textual fragmentada.

## Próxima Melhoria — Semantic Search Universal

### Estado atual
- Cmd+K palette faz só match por título.
- Sem embeddings nem RAG; usuário não consegue perguntar "clientes que falaram em desconto".
- Existe `pgvector`? Verificar; senão habilitar.

### Mudanças

**1. Migration**
- Habilitar `vector` extension.
- Tabela `semantic_index`:
  - `id uuid pk`, `entity_type text` (`client|lead|deal|activity|call_recording`), `entity_id uuid`, `salesperson_id uuid`, `content text`, `embedding vector(768)`, `metadata jsonb`, `updated_at timestamptz`
  - Unique `(entity_type, entity_id)`; índice ivfflat em `embedding`.
- RLS: vendedor só vê próprios; admin/manager vê tudo.
- RPC `match_semantic(_query_embedding, _match_count, _entity_types text[])` SECURITY DEFINER que aplica filtro por dono via `get_current_salesperson_id`.
- RPC `upsert_semantic_entry(...)` SECURITY DEFINER.

**2. Edge functions**
- `semantic-index-entity` (`verify_jwt=true`): input `{ entity_type, entity_id }` → busca registro real, monta `content`, gera embedding via Lovable AI (`google/text-embedding-004`, 768d), upsert via RPC.
- `semantic-search` (`verify_jwt=true`): input `{ query, entity_types?, limit? }` → embedding da query → `match_semantic` → enriquece resultado com link/preview → opcionalmente passa top 5 por LLM (`gemini-2.5-flash`) que retorna `answer` curta citando entidades. Trata 429/402.
- `semantic-reindex-batch` (admin only): re-indexa em lote por tipo.

**3. Hooks**
- `useSemanticSearch(query)` — debounce 350ms, mutation+cache.
- `useIndexEntity()` — opcional para reindexar manualmente.
- Auto-trigger: hooks de save de cliente/lead/deal/atividade chamam `semantic-index-entity` em background (fire-and-forget).

**4. UI (≤300L cada)**
- `SemanticSearchDialog.tsx` — dialog full-screen-ish (Cmd+Shift+F):
  - Input grande com placeholder "Pergunte ou busque qualquer coisa…"
  - Filtros chip: Clientes / Leads / Deals / Atividades / Calls
  - Resposta IA no topo (quando houver) + lista de resultados com ícone por tipo, snippet, score
  - Atalho Enter abre entidade
- `SemanticSearchResultRow.tsx` — linha com ícone+título+snippet+badge tipo+score%
- `semanticSearchHelpers.ts` — mapeamento tipo→ícone/cor/rota, formatação de score
- Trigger global: botão na topbar (ícone Sparkles) + atalho de teclado registrado em `KeyboardShortcuts`.

**5. Integração**
- Sidebar group "BI/Analytics": item "Busca Semântica" (rota `/busca`).
- Página `SemanticSearch.tsx` (lazy) reaproveitando o dialog inline.
- Cmd+K palette: nova seção "Resultados semânticos" alimentada quando query ≥ 4 chars.

**6. Validação**
- Smoke `supabase--curl_edge_functions` index + search com query real.
- `supabase--linter` zero novos warnings.
- Console limpo, zero TS errors.

### Arquivos
- Migration (extension + tabela + RPCs + RLS)
- Criar `supabase/functions/semantic-index-entity/index.ts`, `semantic-search/index.ts`, `semantic-reindex-batch/index.ts`
- Criar `src/hooks/semantic/useSemanticSearch.ts`, `useIndexEntity.ts`
- Criar `src/components/semantic/SemanticSearchDialog.tsx`, `SemanticSearchResultRow.tsx`, `semanticSearchHelpers.ts`
- Criar `src/pages/SemanticSearch.tsx`
- Editar `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/components/layout/TopBar.tsx` (botão), `supabase/config.toml`

Após esta entrega, sigo para AI Agents autônomos e Predictive Scoring com explainability — fechando AI Generativo em 10/10.
