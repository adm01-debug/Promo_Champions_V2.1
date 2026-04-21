

## Painel de auditoria do forecast (slope, intercept, SSE, σ, fitN)

### Objetivo
Expor as estatísticas internas da regressão OLS usadas no `ScenarioForecastChart` num painel colapsável, para auditoria rápida da projeção sem precisar abrir devtools.

### Mudanças

**1. `src/hooks/win-loss/useWinLossScenarios.ts`** — expor mais estatísticas
- Adicionar ao `ScenarioForecast`:
  - `intercept: number` — coeficiente β₀ da reta.
  - `sse: number` — soma dos quadrados dos resíduos (Σ(y−ŷ)²).
  - `meanX: number`, `sxx: number` — úteis para reproduzir a fórmula PI 95%.
  - `dof: number` — graus de liberdade (n−2, mín. 1).
- Preencher esses campos no caminho normal (n≥3) e zerar no fallback (n<3).
- Mantém retrocompatibilidade — só adiciona campos.

**2. Novo componente `src/components/win-loss/ScenarioForecastAuditPanel.tsx`**
- Props: `{ slope, intercept, stdDev, sse, fitN, dof, bandMode, tCritical, meanX, sxx }`.
- Cartão compacto colapsável (`<details>` nativo, ícone chevron, sem dependência extra) com título "Auditoria do ajuste".
- Grid 2 colunas com pares label → valor tabular-nums:
  - **Slope (β₁)**: `X.XXX pp/período`
  - **Intercept (β₀)**: `X.XX pp`
  - **Equação**: `ŷ = β₀ + β₁·x` (renderizada com valores)
  - **SSE**: `X.XX`
  - **Residual σ (SEE)**: `X.XX pp`
  - **Graus de liberdade**: `n−2 = X`
  - **fitN**: `N períodos`
  - **Modo de banda**: `SEE` ou `PI 95% (t=Y.YY)`
  - **x̄ / Sxx** (só se `pi95`): para auditar a fórmula PI completa
- Um parágrafo curto de rodapé explicando: "σ menor = ajuste mais aderente; |slope| baixo = sem tendência clara; SSE cresce com ruído."
- Acessível: `<summary>` com role/aria padrão do `<details>`, `aria-label` no card.

**3. `src/components/win-loss/ScenarioForecastChart.tsx`**
- Importar e renderizar `<ScenarioForecastAuditPanel />` logo após o `<CardContent>` do gráfico (dentro do mesmo `<Card>`, em um bloco separado com borda superior leve `border-t`), passando os campos novos do hook.
- Não renderizar quando `fitN < 3` (já cai no early-return existente).

### Detalhes técnicos
- Sem novas libs; `<details>/<summary>` + classes Tailwind existentes.
- Tipos novos (`intercept`, `sse`, `dof`, `meanX`, `sxx`) são campos adicionais — não quebram chamadas existentes.
- Painel é puramente apresentacional, memoizado por props.

### Arquivos
- **Modificar**: `src/hooks/win-loss/useWinLossScenarios.ts`
- **Criar**: `src/components/win-loss/ScenarioForecastAuditPanel.tsx`
- **Modificar**: `src/components/win-loss/ScenarioForecastChart.tsx`
- **Modificar**: `src/test/hooks/useWinLossScenarios.test.ts` — adicionar 2 testes: (a) `intercept + slope reconstrói meanY no centro`; (b) `sse ≈ 0 para dados perfeitamente lineares`.

### Ordem
1. Estender retorno do hook + testes (rodar `vitest run src/test/hooks/useWinLossScenarios.test.ts` — esperado 15/15).
2. Criar `ScenarioForecastAuditPanel`.
3. Plugar no `ScenarioForecastChart`.

