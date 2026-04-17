
Closing the AI Generativo Avançado section: **Predictive Scoring com Explainability (SHAP-style)**. Estado atual: existe `lead_scoring` edge function com 5 fatores rígidos e UI com `ScoreRing` — mas zero explicabilidade real (sem contribuição relativa, sem narrativa IA, sem ranking de drivers, sem recomendações acionáveis, sem histórico).

## Próxima Melhoria — Predictive Scoring com Explainability

### Estado atual
- `lead-scoring` retorna 5 fatores brutos (dealValue, stageProgress, timeInPipeline, category, recentActivity) com labels textuais.
- Dashboard mostra apenas o número do score; não mostra **por que** + **o que fazer**.
- Sem baseline, sem contribuição percentual, sem direção (positivo/negativo), sem trend.

### Mudanças

**1. Migration**
- Tabela `lead_score_explanations`: `sale_id`, `score`, `baseline_score` (média da carteira), `top_drivers jsonb` (`[{factor, contribution_pct, direction, value, label}]`), `recommendations jsonb` (`[{action, expected_lift, priority}]`), `narrative text` (resumo IA), `model_version text`, `calculated_at`.
- Tabela `lead_score_history`: `sale_id`, `score`, `factors jsonb`, `recorded_at` — populada por trigger AFTER UPDATE em `lead_scores`.
- RPC `get_score_trend(_sale_id, _days)` retorna histórico para sparkline.
- RLS: vendedor vê próprios via join com `sales.salesperson_id`; admin/manager veem tudo.

**2. Edge function `predictive-scoring-explain` (`verify_jwt=true`)**
- Input: `{ sale_id }` ou `{ sale_ids: [...] }` (batch até 50).
- Carrega deal + factors do `lead_scores` + carteira do vendedor (baseline).
- **SHAP-style**: para cada fator, calcula `contribution = factor_value - baseline_factor_value`, normaliza para `contribution_pct = |contribution| / sum(|contributions|) * 100`, define `direction` (positivo/negativo).
- Ordena top 5 drivers, gera 3 recomendações regra-baseadas (ex: "tempo no pipeline > 30d → agendar follow-up; lift esperado +8 pts").
- Chama Gemini 2.5 Flash para gerar **narrativa em PT-BR** de 2-3 frases explicando score + próximo passo (com tratamento 429/402 e fallback determinístico).
- Persiste em `lead_score_explanations`.

**3. Trigger**
- AFTER UPDATE em `lead_scores` insere snapshot em `lead_score_history` (apenas se score mudou).

**4. Hooks**
- `useLeadScoreExplanation(saleId)` — busca da tabela; se ausente/stale → invoca edge.
- `useScoreTrend(saleId)` — usa RPC para sparkline.
- `useExplainBatch()` — mutation para reexplicar lote (admin).

**5. UI (≤300L cada)**
- `LeadScoreExplainCard.tsx`: card premium com
  - Score grande + delta vs baseline (ex: "+18 pts acima da média da carteira")
  - Mini-sparkline de 30d (`useScoreTrend`)
  - Barras horizontais de contribuição (top 5 drivers, verde/vermelho conforme direção)
  - Bloco "Por que esse score?" (narrativa IA)
  - Lista "Próximas ações para subir o score" (recomendações com lift esperado)
- `ScoreContributionBar.tsx`: barra com label, valor, % contribuição, direção.
- `ScoreSparkline.tsx`: SVG inline (≤40 linhas) mostrando histórico.
- `predictiveScoringHelpers.ts`: cores por direção, formatação de contribuição, label PT-BR de fatores.

**6. Integração**
- `LeadScoringDashboard`: ao clicar num lead da tabela, abre dialog com `LeadScoreExplainCard`.
- `DealCard` no Pipeline: badge de score já existe; adicionar tooltip on-hover com top 3 drivers + botão "Explicar".
- `LeadDetailDrawer` / `ClientDetailDrawer`: nova aba "Score IA" com o card completo.
- Página `LeadScoring`: header com botão "Reexplicar todos" (admin) que dispara `useExplainBatch`.

**7. Validação**
- `supabase--curl_edge_functions` em sale real → confere `lead_score_explanations` populado com narrativa não vazia.
- `supabase--read_query`: confere trigger gerando histórico após update simulado.
- `supabase--linter` zero novos warnings.
- Console limpo, zero TS errors.

### Arquivos
- **Migration**: 1 (2 tabelas + 1 RPC + 1 trigger + RLS)
- **Criar**: `supabase/functions/predictive-scoring-explain/index.ts`
- **Criar**: `src/hooks/scoring/useLeadScoreExplanation.ts`, `useScoreTrend.ts`, `useExplainBatch.ts`
- **Criar**: `src/components/lead-scoring/LeadScoreExplainCard.tsx`, `ScoreContributionBar.tsx`, `ScoreSparkline.tsx`, `predictiveScoringHelpers.ts`
- **Editar**: `src/components/lead-scoring/LeadScoringDashboard.tsx` (dialog explain), `src/components/pipeline/DealCard.tsx` (tooltip), `src/components/leads/LeadDetailDrawer.tsx`, `src/components/clients/ClientDetailDrawer.tsx`, `src/pages/LeadScoring.tsx`, `supabase/config.toml` (nova função)

Após esta entrega, a seção **AI Generativo Avançado** fica 10/10 (todos os 7 itens do gap #14 completos: NLQ, Email Composer, Meeting Summary, Semantic Search Universal, AI Agents, Next Step Suggestions e Predictive Scoring com Explainability). Sigo automaticamente para a próxima seção crítica do GAPS_CLASSE_MUNDIAL: **Sales Engagement Avançado** (#2) começando por Sequences multicanal com A/B testing.
