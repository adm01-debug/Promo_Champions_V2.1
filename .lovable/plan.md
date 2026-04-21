

## Seletor de modo de banda no `ScenarioForecastChart`: SEE vs Prediction Interval 95%

### Objetivo
Permitir alternar, dentro do gráfico de cenário, entre dois modos de incerteza:
- **SEE** (atual): σ residual da regressão alargado por `σ · √(1 + step/n)`. Bandas estreitas, "1σ".
- **PI 95%** (novo, conservador): fórmula completa da OLS com t-Student → `t · σ · √(1 + 1/n + (x − meanX)² / Sxx)`. Bandas mais largas, leva em conta a distância do centro dos dados.

### Mudanças

**1. `src/hooks/win-loss/useWinLossScenarios.ts`**
- Aceitar `options: { forecastSteps?: number; bandMode?: "see" | "pi95" }`.
- Manter compat: se receber number, equivale a `{ forecastSteps: n }`.
- Tabela `tCritical(dof, 0.975)` hardcoded para df 1–30; >30 → 1.96.
- Largura da banda por step:
  - `see`: `σ · √(1 + step/n)` (atual).
  - `pi95`: `t · σ · √(1 + 1/n + (x − meanX)² / Sxx)`.
- Histórico continua colapsado (fan só abre na junção).
- Retorno ganha: `bandMode`, `tCritical` (number ou null), `bandLabel`.

**2. `src/components/win-loss/ScenarioForecastChart.tsx`**
- `useState<"see"|"pi95">("see")`, persistido em `localStorage` (`winloss-scenario-bandmode`).
- `<ToggleGroup type="single" size="sm">` no header com itens "SEE" / "PI 95%", `aria-label="Modo de banda"`, tooltips explicando.
- Badge do header reflete o modo:
  - `see`: `σ ±X.Xpp · fit em N`
  - `pi95`: `PI 95% · t=Y.YY · σ ±X.Xpp · fit em N`
- `chartKey` (signature completa já existente) ganha `bandMode` no prefixo → reset limpo do Recharts ao alternar.
- Tooltip do gráfico mostra "Modo: SEE" ou "Modo: PI 95%" no rodapé.

**3. Testes — `src/test/hooks/useWinLossScenarios.test.ts`** (estender)
- `pi95 produces wider bands than see for same data` — `[10,22,30,42,50]`.
- `pi95 bands widen with horizon and stay clamped to [0,100]`.
- `pi95 with large n approximates 1.96σ at center` — 35 pts com ruído leve.
- `legacy numeric arg ≡ { forecastSteps, bandMode: "see" }` (back-compat).

Rodar `npx vitest run src/test/hooks/useWinLossScenarios.test.ts` — esperado **9 + 4 = 13/13**.

### Detalhes técnicos
- Tabela t two-tailed α=0.05 hardcoded — acuracidade suficiente para df ≤ 30.
- `bandMode` muda só os steps de previsão; `stdDev`, `slope`, `fitN` continuam idênticos.
- API do hook segue retrocompatível para qualquer chamada existente.

### Arquivos
- **Modificar**: `src/hooks/win-loss/useWinLossScenarios.ts`
- **Modificar**: `src/components/win-loss/ScenarioForecastChart.tsx`
- **Modificar**: `src/test/hooks/useWinLossScenarios.test.ts`

### Ordem
1. Estender hook (options, tabela t, fórmula PI).
2. Adicionar testes e rodar suite.
3. Adicionar toggle no header do chart + persistência + ajustes de badge/tooltip/chartKey.

