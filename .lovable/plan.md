

## Seletor de nível de confiança no modo PI (90% / 95% / 99%)

### Objetivo
Hoje o modo "PI 95%" tem cobertura fixa de 95% (t-Student α=0.05). Adicionar um seletor que permita escolher entre **90%**, **95%** (default) e **99%** — espelhando a UX do popover de z já existente no modo SEE. O multiplicador `t` recalcula automaticamente conforme `dof` e o nível escolhido.

### O que muda

#### 1. Hook `useWinLossScenarios` — tabela t multinível

**`src/hooks/win-loss/useWinLossScenarios.ts`**

- Renomear `T_TABLE_975` → mover para um objeto `T_TABLES` com 3 níveis: `0.90`, `0.95`, `0.99`. Valores oficiais (df 1..30) para cada coluna; df ≥ 30 usa o z-normal correspondente (1.645 / 1.96 / 2.576).
- Generalizar `tCritical975(dof)` → `tCritical(dof, level)` recebendo o nível (`0.90 | 0.95 | 0.99`). Manter export antigo `tCritical975` como wrapper para não quebrar consumidores.
- Estender `ScenarioOptions`:
  ```ts
  confidenceLevel?: 0.90 | 0.95 | 0.99;  // default 0.95, ignorado em modo "see"
  ```
- Estender `ScenarioForecast`:
  ```ts
  confidenceLevel: number;  // sempre presente; em "see" reflete o último escolhido (estado UI)
  ```
- Atualizar `bandLabel` no modo PI para refletir o nível: `"PI 95% (t·σ)"` → `"PI ${pct}% (t·σ)"`.
- Atualizar a docstring do topo (a fórmula é a mesma; só o multiplicador `t` muda).

#### 2. Componente `ScenarioForecastChart` — novo popover no modo PI

**`src/components/win-loss/ScenarioForecastChart.tsx`**

- Nova chave de localStorage: `winloss-scenario-pi-level` (string `"0.90"|"0.95"|"0.99"`, default `"0.95"`, sanitização análoga à de `confidenceZ`).
- Novo estado `confidenceLevel` + `useEffect` de persistência (mesmo padrão do `confidenceZ`).
- Passar `confidenceLevel` para `useWinLossScenarios`.
- Quando `bandMode === "pi95"`, renderizar um `Popover` ao lado do toggle (espelhando o do SEE), com `RadioGroup` de 3 opções: 90% / 95% / 99%. Botão exibe `t=2.18 (95%)` (valor atual + label).
- Tooltip do botão PI 95% atualizado: "Intervalo de previsão · multiplicador t-Student no nível escolhido".
- Atualizar `ActiveFormulaBadge`:
  - Linha 1 (fórmula): `PI ${pct}% · ±t·σ·√(...)` (substitui o hardcoded "PI 95%").
  - Linha 2 (parâmetro): `t = X (gl=N, ${pct}%)`.
  - `aria-label` reflete o nível.
- Incluir `confidenceLevel` no payload do `chartKey` via `buildScenarioChartKey` (próximo passo).

#### 3. `buildScenarioChartKey` — novo campo

**`src/lib/winloss/scenarioChartKey.ts`**

- Adicionar `confidenceLevel: number` ao `ScenarioChartKeyInput`.
- Incluir no prefixo: `scenario-${mode}-z${z}-l${level}-h${h}-...` (apenas relevante em modo `pi95`, mas incluímos sempre por simplicidade — mantém anti-flicker e força remount ao alternar nível).
- Atualizar testes existentes (`ScenarioChartKey.test.ts`) para passar `confidenceLevel: 0.95` por default e adicionar 1 caso novo verificando que mudar o nível altera a chave.

#### 4. Painel de auditoria

**`src/components/win-loss/ScenarioForecastAuditPanel.tsx`** (rápido, só leitura)

- Se já mostra o `t` crítico, anexar `(${pct}%)` ao lado para deixar explícito qual nível está ativo.

#### 5. Testes — cobertura nova

**`src/test/components/winloss/ScenarioForecastConfidenceLevel.test.tsx`** (novo, ~150 linhas)

Mesmo padrão dos outros testes do diretório (stub de `recharts` capturando `data-chart-key` + `props.data` do `ComposedChart`).

7 casos:
1. Default `0.95` quando localStorage está vazio em modo PI.
2. Restaura `0.99` do localStorage no mount.
3. Sanitiza valor inválido (`"abc"`, `"0.42"`) → cai para `0.95`.
4. Trocar 95% → 99% no popover **alarga** todas as bandas de previsão (multiplicador t aumenta).
5. Trocar 95% → 90% no popover **estreita** todas as bandas.
6. A predição central (`realistic`) **não muda** ao trocar de nível.
7. `chartKey` muda quando o nível muda; volta à chave original ao restaurar 95% (idempotência).

**Atualizar** `ScenarioForecastChartKey.test.tsx`, `ScenarioForecastPersistence.test.tsx`, `ScenarioForecastBandModeSwitch.test.tsx` e `ScenarioChartKey.test.ts` apenas onde o `chartKey` esperado mudar de formato (`-l0.95-` no meio). Mudanças minimal-invasivas — só regex.

### Não-mudanças
- Modo SEE intacto (popover de z continua igual; `confidenceLevel` é ignorado).
- Persistência de `bandMode` e `confidenceZ` intacta.
- Modal explicativo (`ScenarioFormulaExplainerDialog`), debounce, e tooltip do gráfico — sem alteração funcional (apenas leitura do label dinâmico via `bandLabel`).

### Critério de aceite
1. Em modo PI, popover oferece exatamente 3 opções: 90%, 95% (default), 99%.
2. Trocar 95→99 alarga visivelmente as bandas; trocar para 90 estreita; predição central inalterada.
3. `localStorage.getItem("winloss-scenario-pi-level")` persiste e restaura no reload.
4. Badge ativa mostra `PI 90%` / `PI 95%` / `PI 99%` correspondente.
5. Suíte completa Win/Loss segue verde (≥ 51 testes: 44 atuais + 7 novos).

