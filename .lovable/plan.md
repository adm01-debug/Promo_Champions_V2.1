

## Catálogo de fixtures por histórico (preço, negociação, churn) com padrão dominante esperado

### Estado atual
`supabase/functions/detect-winloss-at-risk/fixtures.ts` exporta hoje:
- `LOSS_PATTERNS_REALISTIC` — 5 padrões (Preço alto, Churn pós-trial, Negociação travada, Pressão competitiva, Abordagem consultiva).
- `SCENARIOS` — 11 cenários genéricos misturados, validados em `scenarios_test.ts`.

Os cenários atuais são **agnósticos de histórico** — não há agrupamento por tema. Isso dificulta:
- Adicionar/manter cenários de uma família específica.
- Explicar para um analista "como o pipeline reage a um deal-tipo de churn".
- Garantir cobertura mínima de cada família histórica do `LOSS_PATTERNS_REALISTIC`.

### O que será adicionado

**1. Novo catálogo `DEAL_HISTORY_FIXTURES`** em `fixtures.ts`:

```text
DEAL_HISTORY_FIXTURES: {
  pricing:     ScenarioGroup,   // "Preço alto vs concorrência" deve dominar
  negotiation: ScenarioGroup,   // "Negociação travada" deve dominar
  churn:       ScenarioGroup,   // "Churn pós-trial" (ticket baixo, ciclo curto)
  competitive: ScenarioGroup,   // sinal competitivo na razão (source competitivo)
  winning:     ScenarioGroup,   // alinhado a win_factor — pipeline NÃO marca como risco
}
```

Cada `ScenarioGroup` tem:
- `theme`: rótulo curto.
- `dominantPatternLabel`: substring esperada do `matched_pattern` retornado (ex: `"Preço alto"`, `"Negociação travada"`, `"Churn pós-trial"`).
- `cases`: 3 casos por família (15 no total) cobrindo variações **leve** (medium 50–65), **forte** (high/critical 65–90) e **borda** (saturado ou abaixo do threshold).

**2. Novo campo opcional em `ScenarioExpect`**:
```ts
matchedPatternLabelIncludes?: string;  // substring case-insensitive em result.matched_pattern
```
Permite afirmar a **família histórica do padrão dominante** (ex: "Preço alto" vs "Negociação travada") — hoje só validamos `pattern_type` que é granular demais (todos viram `loss_factor`).

**3. Novo arquivo de teste `history_catalog_test.ts`** que percorre `DEAL_HISTORY_FIXTURES` e, por grupo, valida em asserções tabulares:
- Todo caso `included` retorna score em `[minScore, maxScore]` ⊂ `[0,100]`.
- `matched_pattern` contém `group.dominantPatternLabel` (case-insensitive) — prova que o padrão dominante esperado para a família foi escolhido.
- `reasonsInclude` e `actionIncludes` (string OU array OR) batem com a história.
- Casos `included: false` ficam abaixo do threshold mesmo com `threshold=0`.
- Meta-cobertura: cada grupo tem ≥1 caso incluído e ≥1 caso de borda/excluído.

Reusa helpers (`includesCI`, `actionNeedles`) — mover para `_testHelpers.ts` co-localizado para evitar duplicação.

**4. Não tocar** em `SCENARIOS` nem em `scenarios_test.ts` (além de ajustar imports de helpers) — o catálogo novo é aditivo.

### Exemplos de casos

- **pricing.strong_price_misalignment**: deal 80k, `proposal`, parado 35d, source `cotacao_express` → dominante `"Preço alto vs concorrência"`, score 60–85, ação contém `["valor","48h","IMEDIATA"]`.
- **negotiation.stuck_negotiation_extreme**: deal 28k, `negotiation`, parado 150d → dominante `"Negociação travada"` ou `"Preço alto"`, score 80–100, ação contém `["URGENTE","IMEDIATA","24h"]`.
- **churn.post_trial_low_ticket**: deal 4500, `pending`, parado 30d → dominante `"Churn pós-trial"`, score 45–75.
- **churn.recovered_engagement**: deal 4800 com `updated_at` 3d → `included: false`.
- **winning.consultative_signals**: deal 26k recém-atualizado em estágio fora de STUCK → `included: false`.

Antes de fixar substrings de `actionIncludes` e `dominantPatternLabel`, vou rodar um dump do `computeDealRisk` com os deals candidatos para ancorar nas strings reais (mesma estratégia usada nas iterações anteriores) — evita falsos negativos.

### Mudanças
- **Modificar** `supabase/functions/detect-winloss-at-risk/fixtures.ts` — adicionar `matchedPatternLabelIncludes` em `ScenarioExpect`; exportar `DEAL_HISTORY_FIXTURES` + tipo `ScenarioGroup`.
- **Criar** `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` — extrair `includesCI` + `actionNeedles`.
- **Modificar** `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` — importar helpers do novo arquivo (sem mudança comportamental).
- **Criar** `supabase/functions/detect-winloss-at-risk/history_catalog_test.ts` — asserções tabulares por grupo + meta-cobertura.

Sem alteração em `scoring.ts`, `index.ts` nem nos hooks/UI.

### Verificação
1. `supabase--test_edge_functions` em `["detect-winloss-at-risk"]` → todos verdes (47 atuais + ~6 novos agregados de catálogo).
2. Trocar `dominantPatternLabel` de um grupo para algo errado → teste do grupo falha apontando label esperada vs `matched_pattern` real.
3. Mover caso `included: true` → `false` sem ajustar score → meta-cobertura/tabela de included falha com diff legível.

