

## Explicação narrativa de severity no `RiskDebugPanel`

### Estado atual
O painel já tem a seção **Severidade** com tabela das 4 regras destacando a aplicada e `final=X conf=Y` na linha ativa. Falta uma **frase humana explícita** explicando *por que* o deal caiu naquele nível — qual threshold passou, qual quase-passou, e o que demoveria/promoveria.

### O que será adicionado

Logo abaixo do título "Severidade" (antes da tabela das 4 regras), um **bloco narrativo** com 3 elementos:

1. **Frase principal** explicando o caminho de decisão:
   - `critical`: `"final=85 ≥ 80 ∧ conf=0.82 ≥ 0.70 → critical"`
   - `high (demoted)`: `"final=85 ≥ 80, mas conf=0.60 < 0.70 → demovido para high"` (caso especial, destacado com borda warning)
   - `high`: `"final=72 ∈ [65, 80) → high (conf irrelevante neste nível)"`
   - `medium`: `"final=55 ∈ [50, 65) → medium"`
   - `low`: `"final=42 < 50 → low"`

2. **Distância para o próximo nível** (próximo acima):
   - `"+8 pontos para virar critical"` ou `"+conf 0.10 para virar critical"` (quando o gap é só de confiança)
   - Omitido quando já é `critical`.

3. **Distância para o nível anterior** (próximo abaixo, opcional):
   - `"-7 pontos para cair para medium"` — mostra a margem de segurança.

### Detalhes técnicos

Helper novo em `src/lib/winloss/riskSeverity.ts`:

```ts
export interface SeverityExplanation {
  applied: RiskSeverity;
  /** Human-readable reason: "final=85 ≥ 80 ∧ conf=0.82 ≥ 0.70 → critical" */
  reason: string;
  /** True when score qualified for critical but conf < 0.7 demoted to high. */
  demoted: boolean;
  /** Pts (or conf delta) needed to reach the next level up; null if already critical. */
  distanceToNext: { kind: "score" | "confidence"; delta: number; target: RiskSeverity } | null;
  /** Pts of margin above the level below; null if already low. */
  distanceToPrev: { delta: number; target: RiskSeverity } | null;
}

export function explainSeverity(final: number, confidence: number): SeverityExplanation;
```

Lógica:
- Espelha exatamente `severityFromScore` do backend.
- `demoted = final >= 80 && conf < 0.7`.
- `distanceToNext`:
  - `low → medium`: `50 - final` pts
  - `medium → high`: `65 - final` pts
  - `high → critical`: se `final >= 80` mas `conf < 0.7`, retorna `{ kind: "confidence", delta: 0.7 - conf }`; senão `{ kind: "score", delta: 80 - final }`.

UI no `RiskDebugPanel`:
- Bloco com `bg-muted/30` (ou `bg-warning/10 border-warning/30` quando `demoted=true`).
- Frase principal em `font-mono text-[11px]`.
- Linha secundária `text-[10px] text-muted-foreground` com `↑ +Xpts → critical · ↓ -Ypts → medium`.

Tudo via design tokens. Sem cores hardcoded.

### Arquivos

**Editado**
- `src/lib/winloss/riskSeverity.ts` — adiciona `explainSeverity` + tipo `SeverityExplanation` (~30 linhas).
- `src/lib/winloss/index.ts` — re-export.
- `src/components/win-loss/RiskDebugPanel.tsx` — bloco narrativo entre cabeçalho "Severidade" e a tabela de regras (~25 linhas).

**Novo**
- `src/test/lib/riskSeverityExplain.test.ts` — cobre 6 casos: critical normal, critical demoted, high puro, medium, low, distâncias corretas em cada bordas (49→50, 64→65, 79→80, conf 0.69→0.70).

### Critério de aceite

1. Card severity `critical` (final=85, conf=0.82) → frase `"final=85 ≥ 80 ∧ conf=0.82 ≥ 0.70 → critical"`, sem `distanceToNext`, mostra `↓ -5pts → high`.
2. Card severity `high` por demoção (final=85, conf=0.60) → bloco com borda warning, frase `"final=85 ≥ 80, mas conf=0.60 < 0.70 → demovido para high"`, `↑ +0.10 conf → critical`.
3. Card severity `high` puro (final=72, conf=0.9) → `"final=72 ∈ [65, 80) → high"`, `↑ +8pts → critical`.
4. Card severity `medium` (final=55) → `"final=55 ∈ [50, 65) → medium"`, `↑ +10pts → high`, `↓ -5pts → low`.
5. Card severity `low` (final=42) → `"final=42 < 50 → low"`, `↑ +8pts → medium`, sem `distanceToPrev`.
6. `npm test -- riskSeverityExplain` verde.
7. Suite Deno `detect-winloss-at-risk` continua verde (zero mudança no backend).

