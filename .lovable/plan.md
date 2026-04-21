

## Matriz exaustiva `patternType × severity × outcome` para `suggested_action`

### Objetivo
Criar **um único teste tabular** que percorre todas as combinações de `patternType` × `severity` × `outcome` e valida, para cada célula:
1. `suggested_action` contém as **keywords esperadas** daquela célula.
2. `suggested_action` **não contém marcadores de urgência** (`URGENTE`, `IMEDIATA`, `24h`, `hoje`) quando severity é `medium`/`low` ou quando é override `won`/`win_factor`.
3. A frase tem ≥ 15 chars e é determinística (mesma entrada → mesma saída).

### Espaço da matriz

- `patternType`: `loss_factor`, `stuck_stage`, `competitor`, `win_factor`, `generic` (5)
- `severity`: `critical`, `high`, `medium`, `low` (4)
- `outcome`: `lost`, `won`, `null` (3)

Total: **5 × 4 × 3 = 60 células**, todas geradas e asseridas via `t.step` dinâmico.

### Tabela de keywords esperadas (espelho de `scoring.ts:256-292`)

| patternType   | critical                                  | high                          | medium                         | low                            |
|---------------|-------------------------------------------|-------------------------------|--------------------------------|--------------------------------|
| `loss_factor` | `IMEDIATA`, `24h`, `resgate`              | `48h`, `valor`                | `valor`, `semana`              | `confirmar`, `interesse`       |
| `stuck_stage` | `URGENTE`, `hoje`, `desbloquear`, `<stage>` | `48h`, `<stage>`            | `semana`, `<stage>`            | `<stage>`, `critério`          |
| `competitor`  | `24h`, `battle card`, `decisor`           | `48h`, `diferenciação`        | `competitivo`, `contra-argumentos` | `concorrente`, `objeções`  |
| `generic`     | `urgente`, `gestor`                       | `48h`                         | `72h`                          | `próximo passo`                |
| `win_factor`  | (override) sempre `vencedora` + `consultiva`, sem urgência (todas as severidades) |

**Override**: para qualquer `patternType`, se `outcome === "won"`, célula esperada = `vencedora`/`reaplicar`, **sem** urgência.

### Regras de "não contém urgência"

`mustNotInclude` aplicado quando:
- `severity ∈ {medium, low}` (qualquer type não-win) → bloqueia `/URGENTE|IMEDIATA|24h|^hoje\b/i`
- `patternType === "win_factor"` ou `outcome === "won"` (qualquer severity) → bloqueia urgência **integral**

### Implementação

**Novo arquivo**: `supabase/functions/detect-winloss-at-risk/action_matrix_combinations_test.ts` (~160 linhas)

Estrutura:
```ts
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { suggestedActionFor, type RiskSeverity } from "./scoring.ts";

const TYPES = ["loss_factor","stuck_stage","competitor","win_factor","generic"] as const;
const SEVERITIES: RiskSeverity[] = ["critical","high","medium","low"];
const OUTCOMES = ["lost","won",null] as const;
const STAGE = "negotiation";
const URGENCY_RE = /urgente|imediata|24h|\bhoje\b/i;

const KEYWORDS: Record<string, Record<RiskSeverity, RegExp[]>> = {
  loss_factor: {
    critical: [/IMEDIATA/, /24h/, /resgate/i],
    high:     [/48h/, /valor/i],
    medium:   [/valor/i, /semana/i],
    low:      [/confirmar/i, /interesse/i],
  },
  stuck_stage: {
    critical: [/URGENTE/, /hoje/i, /desbloquear/i, new RegExp(STAGE)],
    high:     [/48h/, new RegExp(STAGE)],
    medium:   [/semana/i, new RegExp(STAGE)],
    low:      [new RegExp(STAGE), /critério/i],
  },
  competitor: { /* ...idem tabela */ },
  generic:    { /* ...idem tabela */ },
};

const WIN_KEYWORDS = [/vencedora|reaplicar/i, /consultiva/i];

Deno.test("matrix: patternType × severity × outcome covers all 60 cells", async (t) => {
  for (const type of TYPES) {
    for (const sev of SEVERITIES) {
      for (const outcome of OUTCOMES) {
        await t.step(`${type} × ${sev} × ${outcome ?? "null"}`, () => {
          const action = suggestedActionFor(type, STAGE, { severity: sev, outcome });

          assert(action.trim().length >= 15);

          const isWinOverride = type === "win_factor" || outcome === "won";

          // Determinismo
          for (let i = 0; i < 5; i++) {
            const a2 = suggestedActionFor(type, STAGE, { severity: sev, outcome });
            assert(a2 === action, `non-deterministic for ${type}/${sev}/${outcome}`);
          }

          if (isWinOverride) {
            for (const re of WIN_KEYWORDS) assert(re.test(action), `win missing ${re}: "${action}"`);
            assert(!URGENCY_RE.test(action), `win override leaked urgency: "${action}"`);
            return;
          }

          // Matrix branch
          const keys = type === "generic" ? KEYWORDS_GENERIC[sev] : KEYWORDS[type][sev];
          for (const re of keys) {
            assert(re.test(action), `${type}/${sev}: missing ${re} in "${action}"`);
          }

          if (sev === "medium" || sev === "low") {
            assert(!URGENCY_RE.test(action), `${type}/${sev} leaked urgency: "${action}"`);
          }
        });
      }
    }
  }
});
```

Plus 1 teste extra de **interpolação de stage** para `stuck_stage` em 4 stages distintos (`qualified|proposal|negotiation|null`) garantindo que o stage (ou `"atual"`) aparece literalmente.

### Arquivos

**Novo**
- `supabase/functions/detect-winloss-at-risk/action_matrix_combinations_test.ts`

**Não alterado**
- `scoring.ts`, demais testes — esta matriz é puramente complementar (60 células × asserções).

### Critério de aceite
- `supabase--test_edge_functions ["detect-winloss-at-risk"]` 100% verde, incluindo as 60 `t.step` + stage-interpolation.
- Cobertura explícita das 60 células `(5 types × 4 severities × 3 outcomes)`.
- Toda célula `medium`/`low` (não-win) prova ausência de urgência.
- Todo override `win` (qualquer severidade) prova ausência de urgência + presença de `vencedora`/`reaplicar`/`consultiva`.
- Determinismo verificado 5× por célula.

