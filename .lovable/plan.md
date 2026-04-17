
User wants to expand semantic search to cover ALL records in the CRM. Current state from codebase recon:

**Já implementado:**
- Tabela `semantic_index` com pgvector (768d)
- RPC `match_semantic` + `upsert_semantic_entry`
- Edge functions: `semantic-index-entity`, `semantic-search-universal`, `semantic-reindex-batch`
- UI: `SemanticSearchDialog`, `SemanticSearchMount` (Cmd+Shift+F), página `/busca`, item na sidebar
- 5 entity types suportados: client, lead, deal, activity, call_recording
- `useIndexEntity` hook fire-and-forget

**Gaps reais (o "parcial"):**
1. **Backfill**: índice está vazio para registros antigos. `semantic-reindex-batch` existe mas não tem UI nem trigger.
2. **Auto-indexação**: `useIndexEntity` existe mas não é chamado nos hooks de save (createClient, updateLead, createDeal, logActivity, uploadCallRecording). Novos/editados registros não entram no índice.
3. **Cobertura incompleta**: faltam tipos importantes — `note`, `email_message`, `whatsapp_message`, `proposal`, `playbook`, `task`.
4. **Admin UI**: sem painel para disparar reindex, ver cobertura (% indexado por tipo), forçar refresh.
5. **Cmd+K**: palette principal não consulta semantic search.
6. **Stale detection**: registro editado fica com embedding desatualizado — sem coluna `source_updated_at` para comparar.

## Plano — Semantic Search Universal Completa

### 1. Migration
- Adicionar colunas em `semantic_index`: `source_updated_at timestamptz`, `content_hash text` (evita re-embed se conteúdo igual).
- Expandir CHECK em `entity_type` para incluir: `note`, `email_message`, `whatsapp_message`, `proposal`, `task`, `playbook` (além dos 5 atuais).
- RPC `get_semantic_coverage()` SECURITY DEFINER → retorna `[{ entity_type, total, indexed, coverage_pct, last_indexed }]` para admin.
- RPC `mark_entity_for_reindex(_entity_type, _entity_id)` (deleta entry → forçará re-embed).

### 2. Edge functions
- **Atualizar `semantic-index-entity`**: adicionar handlers para os novos tipos (note, email, whatsapp, proposal, task, playbook). Calcular `content_hash` (sha256) e pular re-embed se igual + `source_updated_at` igual. Persistir `source_updated_at` da entidade.
- **Atualizar `semantic-reindex-batch`**: aceitar `{ entity_types?, only_missing?, batch_size? }`, paginar pelas tabelas-alvo, enviar para `semantic-index-entity` em lotes (concorrência 5), retornar contadores. Admin-only via has_role.
- **Nova `semantic-coverage` (admin only)**: invoca RPC e devolve cobertura por tipo.

### 3. Auto-indexação (front-end)
Adicionar `index(entity_type, id)` fire-and-forget após mutações de sucesso em:
- `useCreateClient`, `useUpdateClient`
- `useCreateLead`, `useUpdateLead`
- `useCreateDeal`, `useUpdateDeal`
- `useCreateActivity` (já note + activity)
- `useUploadCallRecording` (após transcrição)
- Hooks de email/whatsapp messages e proposals (se existirem)

### 4. UI — Admin Reindex Panel
- `src/components/admin/SemanticReindexPanel.tsx` (em `/admin`):
  - Tabela de cobertura: tipo, total, indexado, %, última atualização, botão "Reindexar".
  - Botão global "Reindexar tudo (faltantes)".
  - Progress toast durante execução.
- Hook `useSemanticCoverage()` + `useReindexBatch()`.

### 5. UI — Filtros expandidos
- `semanticSearchHelpers.ts`: adicionar entradas em `ENTITY_META` para os 6 novos tipos com ícones/cores/rotas.
- `SemanticSearchDialog`: chips de filtro renderizam dinamicamente a partir do `ENTITY_META`.

### 6. Cmd+K integração
- Localizar `CommandPalette` existente (provavelmente `src/components/search/*` ou `KeyboardShortcuts`).
- Adicionar seção "Resultados semânticos" quando query ≥ 4 chars (debounced), mostra top 5 + link "Ver todos" → abre `SemanticSearchDialog`.

### 7. Validação
- Smoke `supabase--curl_edge_functions`: `semantic-coverage`, `semantic-reindex-batch` (lote pequeno), `semantic-search-universal` em registro recém-indexado.
- `supabase--read_query`: confere `semantic_index` populando após reindex.
- `supabase--linter` zero novos warnings.
- Console limpo, zero TS errors.

### Arquivos
- **Migration**: 1 (colunas + 2 RPCs + check expandido)
- **Editar**: `supabase/functions/semantic-index-entity/index.ts`, `semantic-reindex-batch/index.ts`
- **Criar**: `supabase/functions/semantic-coverage/index.ts`
- **Criar**: `src/hooks/semantic/useSemanticCoverage.ts`, `useReindexBatch.ts`
- **Criar**: `src/components/admin/SemanticReindexPanel.tsx`
- **Editar**: `src/components/semantic/semanticSearchHelpers.ts`, `SemanticSearchDialog.tsx`
- **Editar**: hooks de mutação (clients/leads/deals/activities) — adicionar `index()` em onSuccess
- **Editar**: CommandPalette principal (a localizar) — seção semantic
- **Editar**: `src/pages/Admin.tsx` (ou equivalente) — montar painel
- **Editar**: `supabase/config.toml` (nova função)

Após esta entrega, sigo automaticamente para a próxima atômica de AI Generativo Avançado: **Predictive Scoring com Explainability** — fechando 10/10.
