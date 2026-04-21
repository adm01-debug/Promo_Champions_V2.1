

## Testes de invariantes do `RiskBreakdown`

### Objetivo
Garantir, via testes Deno puros sobre `computeDealRisk`, que o objeto `breakdown` **nunca** retorna combinações inconsistentes — mesmo em deals com `source: null` e `status` desconhecido (fora de `STUCK_STATUSES`).

### Invariantes cobertas

1. **`final_score` sempre = clamp(round(raw_score × confidence_weight), 0..100)**
   - `raw_score === stagnation + amount_alignment + stage_match`
   - `confidence_weight ∈ [0.5, 1]`
   - `final_score ∈ [0, 100]` e bate exatamente com a recomputação local
   - `final_score === risk_score` (campo top-level e breakdown coerentes)

2. **`stage_eligible` respeita `STUCK_STATUSES`**
   - `status: null` → `stage_eligible === false` E `stage_match === 0`
   - `status: "unknown_xyz"` → `stage_eligible === false` E `stage_match === 0`
   - `status: "negotiation"` → `stage_eligible === true`
   - Implicação: se `stage_eligible === false`, então `stage_match === 0` (sempre).

3. **Campos numéricos finitos e não-NaN**
   - `stagnation`, `amount_alignment`, `stage_match`, `raw_score`, `final_score`, `confidence_weight`, `days_stagnant` são todos `Number.isFinite`.
   - `matched_confidence ∈ [0, 1]`.

4. **`source: null` não quebra competitor**
   - `matched_keywords` é array vazio (nunca `undefined`).
   - `competitor_matches` é `undefined` (não array vazio espúrio) — alinhado ao código atual.
   - Nenhum `reasons_v2[].code === "COMPETITOR_PRESSURE"`.

5. **Coerência de reasons**
   - `breakdown.reasons === result.reasons` (mesma referência ou conteúdo idêntico).
   - `reasons_v2` nunca vazio quando o resultado existe (fallback `CROSSED_SIGNALS`).
   - Toda `RiskReason.code` pertence a `RISK_REASON_CODES`.

6. **Severity coerente com score**
   - `severity` recomputado via `severityFromScore(final_score, matched_confidence)` é igual ao retornado.

### Estratégia de fixtures

Combinatória pequena varrida em loop:
- `status`: `null`, `"unknown_xyz"`, `"lead"`, `"negotiation"`, `"proposal"`
- `source`: `null`, `""`, `"leilao_publico"`
- `amount`: `0`, `25000`, `999999`
- `updated_at`: `now`, `now-50d`, `now-200d`
- Patterns: conjunto realista (loss + stuck + competitor) e conjunto vazio

Para cada combinação, se `computeDealRisk` retornar não-`null`, asserta as 6 invariantes acima. Threshold = `0` para forçar inclusão.

### Arquivos

**Novo**
- `supabase/functions/detect-winloss-at-risk/breakdown_invariants_test.ts` — ~10 `Deno.test` blocks, um por invariante + um teste combinatório que roda ~45 cenários.

**Não alterados**
- `scoring.ts`, `index.ts`: nada muda. Se algum teste falhar, abrimos issue de bug separada — o objetivo aqui é blindar, não refatorar.

### Critério de aceite
- `supabase--test_edge_functions ["detect-winloss-at-risk"]` → 100% verde, incluindo os ~10 novos testes.
- Nenhum teste existente quebra.
- Cobre explicitamente `source: null` + `status` desconhecido com asserts dedicados.

