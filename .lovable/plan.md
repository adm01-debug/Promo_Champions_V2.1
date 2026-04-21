

## Fallbacks determinísticos por `patternType` × `severity` (sem mensagens genéricas vazando)

### Diagnóstico
Auditoria de `suggestedActionFor` em `scoring.ts` (linhas 242-293) mostra que a função **já é determinística e exaustiva**:

- Branch `win_factor`/`outcome === "won"` → mensagem positiva fixa.
- 3 branches específicos (`loss_factor`, `stuck_stage`, `competitor`) com 4 strings cada (uma por severidade).
- Branch `default` (qualquer `patternType` desconhecido, `null`, `""`, `"generic"`, `"unknown_xyz"`) com 4 strings — **estas são as mensagens de fallback "genérico cruzado"**.

E `computeDealRisk` (linhas 402-466) já garante:
- `dominant.type` cai em `"generic"` quando nenhum pattern bate (usa `default` branch).
- `matched_pattern` usa fallback `"Sinal de risco (${type})"` via `ensureNonEmpty`.
- `suggested_action` tem segundo fallback (`"Revisar abordagem com o cliente nas próximas 48h"`) quando o resultado vier <15 chars.

**Conclusão**: não há vazamento real de string genérica/vazia. O risco que ainda **não temos blindagem testada** é:

1. Strings do branch `default` poderiam um dia ser confundidas com strings dos branches específicos → não há teste que prove que **cada `patternType`** roteia para sua família correta de copy.
2. Não há teste que prove **estabilidade**: rodar a mesma entrada N vezes sempre devolve a mesma string (sem `Math.random`, sem timestamps).
3. Não há teste que prove que branch `default` é **sempre** o que aparece quando `patternType ∈ {null, "", "generic", "lost", "weird_kind"}`, e nunca quando o type é canônico.

### O que será adicionado

**Novo arquivo**: `supabase/functions/detect-winloss-at-risk/fallback_determinism_test.ts`

6 `Deno.test` blocks puros, sem alterar `scoring.ts`:

1. **Roteamento por `patternType` é exaustivo e exclusivo**
   - Mapa `EXPECTED_FAMILY_FRAGMENTS` que define um fragmento único de cada família:
     - `loss_factor` → contém `"proposta"` ou `"valor percebido"` ou `"resgate"` ou `"interesse"`
     - `stuck_stage` → contém `"estágio"` (ou `"desbloquear"`)
     - `competitor` → contém `"concorr"` ou `"battle card"` ou `"diferenciação"` ou `"posicionamento"`
     - `win_factor` → contém `"vencedora"`
     - `default/unknown` → contém `"deal"` ou `"abordagem"` ou `"próximo passo"` ou `"múltiplos sinais"`
   - Para cada `patternType` canônico × cada `severity` × cada `outcome`, asserta que o output **bate** com o fragmento da família esperada e **não bate** com fragmentos exclusivos de outras famílias (ex.: copy de `competitor` nunca contém `"estágio"`).

2. **Branch `default` é o único usado para tipos não-canônicos**
   - Lista de "tipos lixo": `["", "   ", "generic", "loss", "lost", "won_xyz", "totally_unknown_kind", "123"]`.
   - Para cada um × 4 severidades × outcomes ≠ `"won"`, asserta que o output bate com o conjunto de strings exatas do branch `default` (whitelist hard-coded de 4 frases).

3. **`outcome === "won"` sempre vence sobre patternType de loss**
   - Para `patternType ∈ {"loss_factor", "stuck_stage", "competitor", "unknown"}` × `outcome ∈ {"won", "WON", "Won"}` × todas severidades, output é exatamente a frase positiva fixa.
   - Bloqueia regressão onde alguém adicionasse case-sensitivity quebrada.

4. **Determinismo: 50 chamadas idênticas → 50 strings idênticas**
   - Snapshot loop com 5 entradas representativas, cada uma chamada 50× → todos os outputs `===` ao primeiro.

5. **Marcadores de urgência só em `critical`/`high` de famílias de risco**
   - Regex `/IMEDIATA|URGENTE|24h|hoje/i` só pode aparecer quando `severity ∈ {"critical", "high"}` E `patternType ∈ {"loss_factor","stuck_stage","competitor"} ou default-com-critical`. Nunca em `medium`/`low` nem em qualquer cenário com `outcome === "won"`.
   - Já parcialmente coberto em `action_validation_test.ts`; este teste cobre a matriz completa.

6. **Fluxo end-to-end via `computeDealRisk`: nenhum deal acima do threshold retorna copy de outra família que a do `dominant.type`**
   - Cenários montados:
     - Deal com loss pattern dominante → copy contém fragmento da família `loss_factor` ou `stuck_stage`.
     - Deal com `patterns: []` mas score forçado por idade/threshold=0 → `dominant.type === "generic"` → copy bate com whitelist do branch `default`.
   - Asserta `breakdown.matched_pattern_type ∈ {"loss_factor","stuck_stage","competitor","generic","win_factor"}` (sem vazar tipos arbitrários).

### Critérios de aceite

- `supabase--test_edge_functions ["detect-winloss-at-risk"]` → 100% verde, incluindo os 6 novos.
- Nenhum teste existente quebra (`action_validation_test.ts`, `breakdown_invariants_test.ts`, `non_empty_strings_test.ts`, `reasons_codes_test.ts`).
- Cobertura comprovada de:
  - Cada `patternType` canônico roteia para sua família e nunca para outra.
  - Tipos lixo/desconhecidos sempre caem no `default` (whitelist de 4 frases conhecidas).
  - `outcome="won"` é override absoluto.
  - Mesma entrada → mesma saída (determinismo).
  - `dominant.type` final fica num conjunto fechado de 5 valores.

### Arquivos
- **Novo**: `supabase/functions/detect-winloss-at-risk/fallback_determinism_test.ts` (~150 linhas, ~6 Deno.test)
- **Não alterado**: `scoring.ts`, `index.ts` — objetivo é blindar comportamento já correto, não refatorar.

