

## Forecast de cenários: bandas ±σ baseadas em desvio histórico real e reatividade aos filtros

### Diagnóstico

**Hook `useWinLossScenarios`**:
- Bandas usam **σ populacional vs média** dos winRates históricos. Isso **infla a banda** quando há tendência (pois desvio do mean já contém o trend). O correto é σ dos **resíduos da regressão** (Standard Error of the Estimate) — só o ruído ao redor da linha ajustada.
- Bandas têm **largura fixa** ao longo do horizonte. Padrão estatístico: incerteza cresce com o passo de previsão (`σ_step = σ * √(1 + step/n)`).
- Mínimo de 2 pontos para regressão é **frágil** (resíduos = 0 com apenas 2 pontos). Subir para 3.
- Pontos históricos hoje têm `optimistic = pessimistic = realistic = winRate` — bom — mas o salto do ponto histórico para o forecast é abrupto. Isso é desejado visualmente (junção limpa) e será mantido.

**Reatividade a filtros**:
- `monthly = useWLTrend(rows, "month")` em `WinLossIntelligence.tsx` é `useMemo([rows, granularity])` ✅
- `rows = useMemo([allRows, outcomeFilter, competitorFilter])` ✅
- `useWinLossScenarios` é `useMemo([points, forecastSteps])` ✅
- `ScenarioForecastChart` é `memo()`, mas seu `useMemo` interno depende de `series` (referência nova a cada execução do hook). Reatividade está **funcional** quando filtros disparam refetch/re-render — o que é esperado.

**Contudo**, há uma melhoria importante: hoje `WinLossTrendChart` e `ScenarioForecastChart` recebem `points` em prop separada, e Recharts às vezes não re-renderiza o `<ComposedChart>` quando os dados mudam mantendo o mesmo número de elementos (problema conhecido). Vou adicionar uma `key` derivada do hash dos filtros aplicados para forçar reset do chart em troca de filtro/granularidade.

---

### Mudanças

#### 1. `src/hooks/win-loss/useWinLossScenarios.ts` — refactor estatístico
- Calcular slope/intercept (mantém OLS).
- σ = `sqrt(SSE / (n - 2))` — **Standard Error of Estimate** sobre os resíduos.
- Forecast points: `σ_step = residualσ * sqrt(1 + step/n)` → bandas se abrem no horizonte.
- Mínimo de **3 pontos** para regressão (em vez de 2). Abaixo disso, retorna série flat sem fan-out.
- Expor novo campo `fitN` (quantos pontos foram usados) para transparência.

#### 2. `src/components/win-loss/ScenarioForecastChart.tsx` — UX e reatividade
- Mostrar `fitN` no header (`σ ±X.Xpp · fit em N períodos`) — transparência sobre robustez.
- Adicionar `key={\`scenario-${data.length}-${data[0]?.period ?? ""}-${stdDev.toFixed(2)}\`}` no `<ComposedChart>` para garantir reset do internals do Recharts ao trocar filtros/granularidade.
- Tooltip enriquecido com badge "Histórico" / "Previsão" baseado em `isForecast` — usuário entende imediatamente onde a incerteza começa.
- Indicador visual: linha vertical tracejada (`<ReferenceLine>`) na junção histórico→forecast.
- Empty state explícito quando `fitN < 3`: "Necessários ao menos 3 períodos com dados para projeção confiável".

#### 3. Testes unitários
Arquivo novo `src/test/hooks/useWinLossScenarios.test.ts` (Vitest):
- Caso: <3 pontos → série flat, stdDev=0, fitN=n.
- Caso: 3 pontos sem ruído (linha perfeita) → residualσ ≈ 0, bandas colapsadas.
- Caso: 4 pontos com ruído conhecido → residualσ ≈ valor esperado matematicamente.
- Caso: forecast bands se abrem (`σ_step+1 > σ_step`).
- Caso: bandas clamped em [0, 100].
- Caso: slope correto (tendência ascendente vs descendente).
- Caso: troca de `points` retorna nova série (referencial).

#### 4. Validação visual
- `tsc --noEmit` zero erros.
- `vitest run src/test/hooks/useWinLossScenarios.test.ts`.
- Verificar no preview: trocar filtro de período / outcome / competitor → confirmar que o chart re-renderiza com bandas atualizadas e que `fitN` muda coerentemente.

---

### Detalhes técnicos

**Fórmula final do hook:**
```
slope, intercept ← OLS(xs, ys)
σ = √( Σ(yᵢ - ŷᵢ)² / (n - 2) )       // residual standard error
para step = 1..H:
  ŷ_step = slope*(n+step-1) + intercept
  σ_step = σ * √(1 + step/n)
  optimistic = clamp(ŷ_step + σ_step, 0, 100)
  pessimistic = clamp(ŷ_step - σ_step, 0, 100)
```

**Sem migrations, sem novas dependências.** Mantém contrato externo (`series`, `stdDev`, `slope` continuam expostos; `fitN` adicionado como opcional).

### Ordem (sequencial, sem pausas)
1. Refactor `useWinLossScenarios.ts` (residual σ, prediction interval, fitN, mínimo 3).
2. Atualizar `ScenarioForecastChart.tsx` (key reset, ReferenceLine na junção, fitN no header, tooltip Histórico/Previsão, empty state).
3. Criar `src/test/hooks/useWinLossScenarios.test.ts` com 7 casos.
4. `tsc --noEmit` + `vitest run` dos novos testes.
5. Atualizar memória (`mem://features/winloss-at-risk-scoring` ou criar `mem://features/winloss-scenario-forecast`).

