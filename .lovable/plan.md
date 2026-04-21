

## Bandas via Prediction Interval por padrão + teste com exemplo manual

### Mudança de comportamento
Atualmente o modo SEE usa por padrão a aproximação `width = σ · √(1 + step/n)`, que cresce muito devagar com o horizonte. O modo PI 95% já usa o intervalo de previsão OLS correto. **Vamos tornar PI o padrão também no SEE** (1σ ≈ 68% de confiança), mantendo a aproximação antiga apenas como flag de debug:

```
SEE (default):   width = σ · √(1 + 1/n + (x − x̄)² / Sxx)        # 1σ PI
PI 95%:          width = t · σ · √(1 + 1/n + (x − x̄)² / Sxx)    # inalterado
SEE legacy:      width = σ · √(1 + step/n)                       # opt-in
```

Resultado: as bandas abrem coerentemente com a distância do ponto previsto ao centro `x̄` dos dados de ajuste, em ambos os modos. A razão `pi95/see` passa a ser exatamente `t` em qualquer step.

### Arquivos editados

**`src/hooks/win-loss/useWinLossScenarios.ts`**
- Trocar default de `seeUseOlsInflation` de `false` → `true` (na sobrecarga do objeto e no atalho numérico legado).
- Atualizar JSDoc da `ScenarioOptions` e do hook explicando que SEE agora usa PI 1σ; legado fica como opt-in (`seeUseOlsInflation: false`).
- Atualizar `bandLabel` SEE default para `"SEE 1σ (PI)"` (o caso legacy continua `"SEE ±σ"`).
- Lógica de cálculo do `width` permanece como está (já suporta os 3 caminhos).

**`src/components/win-loss/ScenarioForecastChart.tsx`**
- `readSeeOlsInflation()` passa a retornar `true` quando a chave `winloss-scenario-see-ols-inflation` não existir no `localStorage` (default novo). Só retorna `false` se o usuário tiver desligado explicitamente (valor `"0"`).
- Tooltip do toggle SEE no header atualizado: `"Banda 1σ via PI · √(1+1/n+(x−x̄)²/Sxx)"`.

**`src/components/win-loss/ScenarioForecastAuditPanel.tsx`**
- Texto do toggle renomeado para **"Usar aproximação legada √(1+step/n)"** (invertido), para deixar claro que desligar volta ao comportamento antigo. `checked={!seeUseOlsInflation}`, `onCheckedChange={(v) => onToggleSeeOlsInflation(!v)}`.
- Linha "Modo de banda" exibe `"SEE 1σ (PI)"` ou `"SEE ±σ · √(1+step/n)"` conforme o estado.

### Testes (`src/test/hooks/useWinLossScenarios.test.ts`)

Atualizar testes que assumiam SEE legacy:
- `"forecast bands widen with horizon"` continua válido (PI também alarga, e mais fortemente).
- `"legacy numeric arg ≡ { forecastSteps, bandMode: 'see' }"` — atualizar para incluir `seeUseOlsInflation: true` no comparador explícito.
- `"pi95 produces wider bands than see for the same data"` — passa a valer com a razão exata `t`.

Adicionar **2 novos testes**:

1. **Exemplo manual reproduzível** — dados controlados para conferir o cálculo passo a passo:
   ```ts
   // y = [10, 14, 19, 22] em x = [0, 1, 2, 3]
   // OLS: meanX=1.5, meanY=16.25, slope=4.1, intercept=10.1
   //   ŷ = [10.1, 14.2, 18.3, 22.4]; resíduos = [-0.1, -0.2, 0.7, -0.4]
   //   SSE = 0.01+0.04+0.49+0.16 = 0.70; dof=2; σ = √(0.35) ≈ 0.5916
   //   Sxx = 1.5²+0.5²+0.5²+1.5² = 5
   // Para step=1 → x=4:
   //   factor = √(1 + 1/4 + (4−1.5)²/5) = √(1 + 0.25 + 1.25) = √2.5 ≈ 1.5811
   //   width_see  = 0.5916 · 1.5811 ≈ 0.9354
   //   width_pi95 = 4.303 · 0.9354  ≈ 4.0250
   //   base_4 = 10.1 + 4.1·4 = 26.5
   ```
   Assertions com `toBeCloseTo(..., 3)` em `slope`, `intercept`, `stdDev`, `sxx`, `meanX`, `realistic[+1]`, `optimistic[+1] − pessimistic[+1]` (= `2 · width`) para SEE e PI 95%.

2. **Razão pi95/see ≡ tCritical em qualquer step** — varrendo `step ∈ {1..6}`, `width_pi95(step) / width_see(step)` deve ser ≈ `tCritical(dof)` com tolerância 1e-9 (prova analítica da nova fórmula).

### Critério de aceite
1. SEE-default abre bandas com a curvatura PI (mais largo no step 6 que no step 1, e mais largo que a fórmula `√(1+step/n)` para o mesmo dataset).
2. PI 95% inalterado em valores e shape.
3. Toggle do painel de auditoria continua funcionando — agora controla ligar/desligar a aproximação legada.
4. Persistência via `localStorage`: usuários novos veem PI; quem tinha `"0"` salvo mantém legacy até regravar.
5. Exemplo manual bate com tolerância 3 casas decimais; razão `pi95/see` = `t` exata.
6. Suíte completa de `useWinLossScenarios.test.ts` verde (13 antigos + 2 novos = 15).
7. Sem regressão em `ScenarioForecastChart`, `ScenarioForecastAuditPanel`, hooks AtRisk, edge functions ou suítes Deno.

