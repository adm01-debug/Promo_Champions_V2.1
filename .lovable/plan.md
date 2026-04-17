
Predictive Scoring com Explainability **já foi 100% implementado** na sessão anterior — confirmo lendo os arquivos no código atual:

- ✅ `lead_score_explanations` + `lead_score_history` + RPC `get_score_trend` + trigger (migração `20260417163016`)
- ✅ Edge function `predictive-scoring-explain` (SHAP-style + narrativa Gemini 2.5 Flash + fallback determinístico)
- ✅ Hooks: `useLeadScoreExplanation`, `useScoreTrend`, `useExplainBatch`
- ✅ UI: `LeadScoreExplainCard`, `ScoreContributionBar`, `ScoreSparkline`, helpers
- ✅ Integração: `LeadScoringDashboard`, `DealCard` (tooltip), `useLeadScoring`

O que está **faltando** vs. plano original (gaps de cobertura):

1. **Drawers**: aba "Score IA" não foi adicionada em `LeadDetailDrawer` nem `ClientDetailDrawer`.
2. **Página `/lead-scoring`**: header sem botão "Reexplicar todos com IA" para admin (existe `useExplainBatch` mas não está plugado num CTA global da página).
3. **Validação end-to-end**: nunca foi feita — sem confirmação de que o edge function popula `lead_score_explanations` com narrativa real, sem checagem do trigger gerando `lead_score_history` em update real.
4. **Página `InteligenciaPreditiva`**: já existe (`/inteligencia-preditiva`) mas não expõe o card de explainability — oportunidade natural de hub.

## Plano — Fechamento de Predictive Scoring com Explainability

### 1. Integração nos Drawers (cobertura de UX)
- **`LeadDetailDrawer.tsx`**: adicionar aba "Score IA" usando `<LeadScoreExplainCard saleId={...} />`. Lazy: só monta o card quando a aba é aberta.
- **`ClientDetailDrawer.tsx`**: nova aba "Score IA" listando os deals do cliente, cada um com seu `LeadScoreExplainCard` (accordion compacto).

### 2. Página `/lead-scoring` — CTA admin
- Header: botão **"Reexplicar todos com IA"** visível só para admin/manager (via `useUserRole`).
- Ao clicar: confirma com dialog → chama `useExplainBatch()` com IDs dos deals visíveis na tabela (limite 50 por chamada, paginação interna).
- Mostra progresso (toast) e invalida queries de explanation.

### 3. Hub de Predictive Intelligence
- Em `PredictiveIntelligenceDashboard`, adicionar seção **"Top deals — explicação IA"**: lista os 5 maiores `top_opportunities` do `usePredictiveIntelligence`, cada um abre popover com `LeadScoreExplainCard` resumido (drivers + narrativa).

### 4. Validação end-to-end (obrigatória)
- `supabase--curl_edge_functions` em `predictive-scoring-explain` com 1 `sale_id` real → confirma resposta JSON com `top_drivers`, `narrative`, `recommendations`.
- `supabase--read_query`: confere `lead_score_explanations` populado e `lead_score_history` registrando após update simulado em `lead_scores`.
- `supabase--linter`: zero novos warnings.
- Console limpo (preview).

### Arquivos
- **Editar**: `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `src/pages/LeadScoring.tsx`, `src/components/predictive/PredictiveIntelligenceDashboard.tsx`
- **Criar (se necessário)**: `src/components/lead-scoring/ReexplainAllButton.tsx` (CTA admin com dialog)
- **Sem nova migração** (schema já existe).
- **Sem nova edge function** (já deployada).

Após esta entrega, **AI Generativo Avançado fecha 10/10** e sigo automaticamente para o próximo gap pendente do `GAPS_CLASSE_MUNDIAL.md`.
