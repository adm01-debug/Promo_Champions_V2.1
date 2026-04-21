

## Remover a aproximação legada das bandas — só fórmula PI completa

### Estado atual
- **SEE (default)** → já usa `width = z · σ̂ · √(1 + 1/n + (x−x̄)²/Sxx)` ✅
- **PI 95%** → já usa `width = t · σ̂ · √(1 + 1/n + (x−x̄)²/Sxx)` ✅
- **SEE legado (opt-in)** → ainda usa `width = z · σ̂ · √(1 + step/n)` ← vamos remover

### Mudanças

**`src/hooks/win-loss/useWinLossScenarios.ts`**
- Remover `seeUseOlsInflation` de `ScenarioOptions`, `ScenarioForecast` e da assinatura.
- Remover o branch `else { width = ... · Math.sqrt(1 + step/n); }` do cálculo.
- `bandLabel` SEE simplifica para `"SEE z=1.00 (PI)"` (sempre PI).
- Atualizar JSDoc de cabeçalho: remover seção "Modo legado", manter só PI.
- Atualizar atalho legacy `useWinLossScenarios(points, 3)` para remover a flag.

**`src/components/win-loss/ScenarioForecastChart.tsx`**
- Remover state `seeUseOlsInflation`, helper `readSeeOlsInflation`, chave `SEE_OLS_KEY` e `useEffect` de persistência.
- Remover props relacionadas no `ScenarioForecastAuditPanel`.
- Migração silenciosa do `localStorage`: ao montar, se a chave `winloss-scenario-see-ols-inflation` existir, removê-la.
- `chartKey` perde o segmento `${... ? "ols" : "step"}`.

**`src/components/win-loss/ScenarioForecastAuditPanel.tsx`**
- Remover props `seeUseOlsInflation` e `onToggleSeeOlsInflation`.
- Remover o bloco do `Switch` "Usar aproximação legada √(1+step/n)" e o helper `Label`/`Switch` se não usados em outro lugar.
- Linha "Modo de banda" sempre mostra `bandLabel` direto do hook.

**`src/test/hooks/useWinLossScenarios.test.ts`**
- Remover o teste `"confidenceZ also scales the legacy √(1+step/n) approximation"`.
- Remover qualquer asserção/uso de `seeUseOlsInflation: false`.
- Atualizar testes que passam `seeUseOlsInflation: true` explicitamente — apenas remover a chave (default já é PI).
- Adicionar 1 teste novo: `"hook does not expose seeUseOlsInflation in result"` — `expect(result.current).not.toHaveProperty("seeUseOlsInflation")`.

### Critério de aceite
1. `useWinLossScenarios` aceita apenas `{ forecastSteps, bandMode, confidenceZ }`; não há mais código de fallback `√(1+step/n)`.
2. `ScenarioForecast` não expõe `seeUseOlsInflation`.
3. UI: o card de cenários não tem mais o toggle "aproximação legada"; painel de auditoria mostra só linhas estatísticas.
4. Usuários com a antiga chave `winloss-scenario-see-ols-inflation: "0"` salva no `localStorage` veem agora a fórmula PI (a chave é limpa silenciosamente no mount).
5. Suíte `useWinLossScenarios.test.ts`: 18 testes verdes (remove 1 legado, adiciona 1 novo).
6. Sem regressão em `ScenarioForecastChart`, `ScenarioForecastAuditPanel`, hooks AtRisk ou suítes Deno.

