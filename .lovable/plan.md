

## Garantir `matched_pattern` e `suggested_action` nunca vazios

### Objetivo
Cobrir com testes Deno puros que `RiskResult.matched_pattern` e `RiskResult.suggested_action` (e o espelho `breakdown.matched_pattern_label`) **nunca** retornam `""`, `"   "` ou strings menores que o mínimo aceitável — em qualquer cenário, incluindo entradas degeneradas.

### Estado atual
Já existem testes pontuais em `action_validation_test.ts`:
- `matched_pattern` não vazio quando label do pattern é blank.
- `suggested_action` ≥15 chars nos cenários do `fixtures.ts`.
- Cobertura por matriz `(patternType × severity × outcome × stage)` **não** existe.
- Sweep com deal degenerado (todos os campos `null`) **não** existe.
- Sweep com `patterns: []`, `pattern_type: null` e `unknown_kind` **não** existe.

### O que será adicionado

**Novo arquivo**: `supabase/functions/detect-winloss-at-risk/non_empty_strings_test.ts`

7 `Deno.test` blocks, todos puros (sem rede/env):

1. **Sweep combinatório extremo** — varre `status × source × amount × age × pattern_set` (`9×5×5×5×6 = 6.750` combinações; muitos viram `null` no resultado, mas centenas passam). Para cada `RiskResult` não-nulo, asserta:
   - `matched_pattern.trim().length ≥ 1`
   - `suggested_action.trim().length ≥ 15`
   - `breakdown.matched_pattern_label.trim().length ≥ 1`

2. **All-blank labels** — todos os patterns têm `label` vazio/whitespace/null → `matched_pattern` cai no fallback `"Sinal de risco (...)"`.

3. **Patterns vazios** — array `[]` com deal antigo (365 dias) → se score passar threshold=0, copy permanece válida.

4. **Patterns com todos os campos `null`** (`pattern_type`, `label`, `outcome`, números) → resultado, se existir, mantém copy.

5. **Matriz da função pura `suggestedActionFor`** — `(types × severities × outcomes × stages)` = `6×4×4×4 = 384` combinações. Cada uma ≥15 chars. Tipos incluem `"unknown_kind"` e `""`; outcomes incluem `null` e `""`; stages incluem `null`, `""` e nomes desconhecidos.

6. **Deal degenerado** — `OpenDeal` com **todos** os campos opcionais nulos (`amount: null`, `status: null`, `updated_at: null`, etc.) rodado contra cada pattern set. Quando o resultado existir, copy permanece válida.

7. **Coerência** — `matched_pattern === breakdown.matched_pattern_label` (sem divergência entre o campo top-level e o do breakdown).

**Helper local** (no próprio arquivo):
```ts
const isMeaningful = (s, min = 1) => typeof s === "string" && s.trim().length >= min;
const MIN_ACTION = 15;
```

### Arquivos
- **Novo**: `supabase/functions/detect-winloss-at-risk/non_empty_strings_test.ts`
- **Não alterado**: `scoring.ts`, `index.ts` — objetivo é blindar comportamento existente, não refatorar. Se algum teste falhar, o bug é tratado em iteração separada.

### Critério de aceite
- `supabase--test_edge_functions ["detect-winloss-at-risk"]` → 100% verde, incluindo os 7 novos.
- Todos os testes existentes (`action_validation_test.ts`, `breakdown_invariants_test.ts`, `reasons_codes_test.ts`, etc.) continuam verdes.
- Cobertura explícita de: labels vazias, `pattern_type: null`, `unknown_kind`, deal totalmente nullish, e matriz completa de `suggestedActionFor`.

