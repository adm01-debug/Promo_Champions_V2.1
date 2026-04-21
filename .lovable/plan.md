

## Validação de escala de urgência e simetria por outcome em `suggested_action`

### Diagnóstico
A matriz `action_matrix_combinations_test.ts` já cobre as 60 células `(type × severity × outcome)` validando keywords e ausência de urgência em medium/low. Falta verificar duas propriedades **transversais** que assertions célula-a-célula não capturam:

1. **Escala monotônica de urgência**: dentro do mesmo `patternType` com `outcome=lost`, o nível de urgência da frase deve **decrescer** conforme severity desce: `critical > high > medium ≥ low`.
2. **Simetria por outcome**: para o mesmo `(patternType, severity)`, mudar `outcome` de `lost` → `won` deve sempre alternar para frase positiva sem urgência; e `outcome=lost` ≡ `outcome=null` (default lost).

### Métrica de urgência

Função pura `urgencyLevel(action: string): 0..3`:

| Nível | Critério                                              | Esperado em |
|-------|-------------------------------------------------------|-------------|
| 3     | Contém `IMEDIATA` ou `URGENTE` (caps) ou `24h` ou `\bhoje\b` | critical |
| 2     | Contém `48h` (sem marcador nível 3)                   | high        |
| 1     | Contém `semana` ou `72h` (sem 48h/24h)                | medium      |
| 0     | Nenhum marcador temporal de urgência                  | low         |

### Asserções (5 blocos)

**Bloco 1 — escala monotônica `[3, 2, 1, 0]`** para os 4 types não-win com `outcome=lost`:
```ts
const lvls = SEVERITIES.map(sev =>
  urgencyLevel(suggestedActionFor(type, STAGE, { severity: sev, outcome: "lost" }))
);
assert(lvls[0] > lvls[1]); // critical > high
assert(lvls[1] > lvls[2]); // high > medium
assert(lvls[2] >= lvls[3]); // medium ≥ low
```
Esperado por type: `loss_factor`, `stuck_stage`, `competitor`, `generic` → `[3, 2, 1, 0]`.

**Bloco 2 — `outcome=won` zera urgência** para qualquer `(type, severity)` (5 × 4 = 20 cells):
```ts
const won = suggestedActionFor(type, STAGE, { severity: sev, outcome: "won" });
assertEquals(urgencyLevel(won), 0);
assert(/vencedora|reaplicar/i.test(won));
```

**Bloco 3 — `outcome=lost` ≡ `outcome=null`** para 4 types não-win × 4 severidades (16 igualdades):
```ts
assertEquals(
  suggestedActionFor(type, STAGE, { severity: sev, outcome: "lost" }),
  suggestedActionFor(type, STAGE, { severity: sev, outcome: null }),
);
```

**Bloco 4 — `outcome=won` sempre difere de `outcome=lost`** em types não-win (prova override real, 16 diffs).

**Bloco 5 — `win_factor` ignora outcome** (12 combinações: 4 sev × 3 outcomes) — sempre `urgencyLevel=0` + frase vencedora, mesmo com `outcome=lost`.

### Arquivos

**Novo**
- `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` (~130 linhas, 5 `Deno.test` correspondentes aos 5 blocos + helper `urgencyLevel`).

**Não alterado**
- `scoring.ts`, demais testes — validação puramente complementar à matriz existente.

### Critério de aceite
- `supabase--test_edge_functions ["detect-winloss-at-risk"]` 100% verde.
- Bloco 1 prova escala `[3, 2, 1, 0]` para os 4 types não-win.
- Bloco 2 prova 20 células de `won` com `urgencyLevel=0` + frase vencedora.
- Bloco 3 prova 16 igualdades `lost ≡ null`.
- Bloco 4 prova 16 diferenças `lost ≠ won`.
- Bloco 5 prova que `win_factor` é absoluto (12 combinações).

