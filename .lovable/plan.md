

## Fixtures de cenários reais para validar score + razão + ação sugerida

### Objetivo
Criar uma suite de cenários nomeados (deal real + patterns realistas + expectativas) que provam que o pipeline `computeAtRiskDeals` retorna score na faixa esperada, **razão coerente** com a história e **ação sugerida** alinhada ao tipo de padrão dominante. Hoje há testes unitários por função; falta cobertura por "story".

### Estrutura

**Novo arquivo** `supabase/functions/detect-winloss-at-risk/fixtures.ts`
Exporta:
- `LOSS_PATTERNS_REALISTIC: LossPattern[]` — conjunto único (preço alto, negociação travada, competidor X, churn pós-trial, win factor consultivo).
- `interface Scenario { name; deal: OpenDeal; expect: { included: boolean; minScore?: number; maxScore?: number; patternTypeContains?: string; reasonsInclude?: string[]; actionIncludes?: string } }`
- `SCENARIOS: Scenario[]` — 10 casos cobrindo o espectro:

| # | Cenário | Score esperado | Padrão dominante | Razão chave |
|---|---|---|---|---|
| 1 | Deal novo (3d), ticket baixo, status `lead` | excluído (<40) | — | — |
| 2 | Negociação parada há 21d, ticket alinhado a loss típico | 60–85 | `stuck_stage` ou `loss_factor` | "21 dias", "ticket alinhado" |
| 3 | Proposta há 60d, ticket muito acima do perfil de loss | 50–80 | `loss_factor` | "60 dias" |
| 4 | Qualified há 90d, ticket no centro do perfil de loss, source "concorrencia" | 75–100 | `stuck_stage` | "travado", "competitiva" |
| 5 | Pending há 10d, ticket bem abaixo do perfil | excluído ou 40–55 | `loss_factor` ou `stuck_stage` | "10 dias" |
| 6 | Negotiation há 45d, sem amount (0) | 50–80 | `stuck_stage` | "estágio travado" |
| 7 | Proposal há 7d, ticket exato do perfil de loss | 40–60 | `loss_factor` | "ticket alinhado" |
| 8 | Deal sem `updated_at` nem `created_at` | excluído | — | — |
| 9 | Negotiation há 120d (super-stagnant), ticket alinhado | 90–100 (cap) | `stuck_stage` | "120 dias", "travado" |
| 10 | Proposal há 30d, source "leilao_publico" | 55–85 | inclui "competitiva" nas razões | "competitiva" |

**Novo arquivo** `supabase/functions/detect-winloss-at-risk/scenarios_test.ts`
- `Deno.test` parametrizado iterando `SCENARIOS`:
  - Roda `computeDealRisk(scenario.deal, LOSS_PATTERNS_REALISTIC, NOW, 40)`.
  - Asserts:
    - `expect.included === false` → resultado é `null`.
    - Caso contrário: `risk_score` ∈ `[minScore, maxScore]`, `breakdown.matched_pattern_type` contém `patternTypeContains`, cada string em `reasonsInclude` aparece em `result.reasons` (case-insensitive substring), `result.suggested_action` contém `actionIncludes`.
- 1 teste extra: `computeAtRiskDeals` com **todos os 10 deals** retorna ordenado por `risk_score desc`, sem nenhum incluído abaixo de 40, e respeita `limit`.

### Detalhes técnicos
- Sem mudanças em `scoring.ts` ou `index.ts` — fixtures são puramente declarativas.
- `NOW` fixo (`2026-04-21T12:00:00Z`) → `created_at`/`updated_at` calculados via `NOW - Nd` para determinismo.
- Faixas (`min/maxScore`) ao invés de valores exatos — isolam de pequenos ajustes no peso sem perder o sentido (uma mudança que mude faixa = bug semântico).
- Razões assertadas por substring em pt-BR (já é a saída do scoring).
- Validação final: `supabase--test_edge_functions detect-winloss-at-risk` → esperado **todos os testes prévios + scenarios passando**.

### Ordem
1. Criar `fixtures.ts` com `LOSS_PATTERNS_REALISTIC` + `SCENARIOS`.
2. Criar `scenarios_test.ts` parametrizado.
3. Rodar `supabase--test_edge_functions` na função.
4. Atualizar `mem://features/winloss-at-risk-scoring.md` mencionando fixtures + scenarios.

