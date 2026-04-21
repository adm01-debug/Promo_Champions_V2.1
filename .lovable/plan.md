

## Seção "Severidade & matriz de ação" no `RiskDebugPanel`

### Estado atual
O `RiskDebugPanel` já mostra contribuições, fórmula passo-a-passo do score, padrão dominante (com badge minúscula de severity), sinais e razões. **Falta** explicar **como** `severity` foi derivada e **qual linha** da matriz `(patternType × severity)` produziu a `suggested_action`. Hoje o usuário vê o resultado mas não a regra.

### O que será adicionado

**Nova seção "Severidade" entre "Fórmula passo a passo" e "Padrão dominante"**:

1. **Tabela visual das 4 regras** (`severityFromScore`, espelho determinístico do backend):
   - `score ≥ 80 ∧ conf ≥ 0.7` → `critical`
   - `score ≥ 65` → `high`
   - `score ≥ 50` → `medium`
   - `< 50` → `low`
   - A linha aplicada recebe `bg-primary/10` + ícone `CheckCircle2`. Outras ficam opacas com `XCircle`.
   - Cada linha mostra os valores efetivos em monospace ao lado: `final=72  conf=0.80`.

2. **Bloco "Matriz de ação acionada"**:
   - `matriz: <patternType> × <severity>` em mono.
   - Casos especiais:
     - `outcome === "won"` ou `patternType === "win_factor"` → `override: outcome=won → frase positiva`.
     - `patternType` desconhecido (`generic`, `null`, `""`) → `fallback: branch default`.
   - Logo abaixo, a `suggested_action` em destaque num bloco `border-primary/30` para marcar que aquela é a frase derivada da matriz.

3. **Severity badge** no padrão dominante continua existindo — agora com contexto logo acima.

### Detalhes técnicos

- `RiskDebugPanel` aceita prop opcional nova `suggestedAction?: string` (atualmente recebe só `breakdown` + `riskScore`).
- Único caller: `AtRiskDealsFromPatterns.tsx` — passa `suggestedAction={deal.suggested_action}`.
- Helpers puros novos em `src/lib/winloss/riskSeverity.ts`:
  - `deriveSeverity(final, conf): RiskSeverity` — espelho 1:1 do `severityFromScore` do backend.
  - `summarizeActionMatrix(type, sev, outcome): { kind: "matrix" | "win-override" | "default-fallback", label: string }`.
- Tudo via design tokens (`bg-primary/10`, `text-success`, `text-muted-foreground`, `border-primary/30`). Sem cores hard-coded.

### Arquivos

**Novos**
- `src/lib/winloss/riskSeverity.ts` (~40 linhas)
- `src/test/lib/riskSeverity.test.ts` — 4 níveis de severity + override won + fallback default + paridade contra fixtures do backend.

**Editados**
- `src/components/win-loss/RiskDebugPanel.tsx` — nova seção, nova prop opcional.
- `src/components/win-loss/AtRiskDealsFromPatterns.tsx` — passa `suggestedAction`.
- `src/lib/winloss/index.ts` — re-export.

### Critérios de aceite

1. Debug ativo → cada card AtRisk mostra tabela de 4 regras com a linha aplicada destacada.
2. Linha "matriz: loss_factor × critical" aparece para deals normais; "override: outcome=won" para wins; "fallback: branch default" para `generic`.
3. Texto exato de `suggested_action` aparece no bloco destacado da matriz.
4. `deriveSeverity(final, conf) === breakdown.severity` para todos os fixtures do backend.
5. `npm test -- riskSeverity` verde; suite Deno do `detect-winloss-at-risk` continua verde (zero mudança no backend).

### Verificação manual
1. Card severity `critical` → linha `score ≥ 80 ∧ conf ≥ 0.7` destacada, valores efetivos ao lado.
2. Card severity `medium` → linha do meio destacada, demais opacas.
3. Bloco "matriz" mostra `patternType × severity` que corresponde ao texto de `suggested_action`.

