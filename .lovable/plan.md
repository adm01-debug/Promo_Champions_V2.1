

## Controle de z-score (confidence level) das bandas no painel de cenários

### Objetivo
Permitir ao usuário escolher o **multiplicador `z`** aplicado à largura da banda no modo SEE — substituindo o `z=1` fixo (1σ ≈ 68%) por presets de confiança comuns (68% / 80% / 90% / 95%) ou um valor livre via slider. PI 95% (t-Student) continua intacto como modo paramétrico separado.

```
SEE atual:   width = 1   · σ̂ · √(1 + 1/n + (x − x̄)² / Sxx)         (1σ, ~68%)
SEE novo:    width = z   · σ̂ · √(1 + 1/n + (x − x̄)² / Sxx)         (z configurável)
PI 95%:      width = t   · σ̂ · √(1 + 1/n + (x − x̄)² / Sxx)         (inalterado)
```

Mapeamento canônico de presets:
| Cobertura | z |
|---|---|
| 68%  | 1.00 |
| 80%  | 1.28 |
| 90%  | 1.645 |
| 95%  | 1.96 |

Default novo: `z = 1` (preserva visual atual). O legado `√(1+step/n)` também aceita `z`.

### Arquivos editados

**`src/hooks/win-loss/useWinLossScenarios.ts`**
- Adicionar `confidenceZ?: number` em `ScenarioOptions` (default `1`, clamp `[0.1, 5]` para evitar lixo).
- Adicionar `confidenceZ: number` em `ScenarioForecast` (devolvido para o UI).
- Multiplicar `width` por `z` em ambos os caminhos do modo `see` (PI 1σ default e legado). PI 95% **não** aplica `z`.
- Atualizar `bandLabel` SEE para refletir `z`: `"SEE z=1.00 (PI)"` / `"SEE z=1.96 (PI)"` / `"SEE z=1.96 · √(1+step/n)"` etc.
- Comentário inline no bloco do `width` reforçando que `z` só atua em SEE.
- JSDoc do header mencionando `confidenceZ` na seção "Como SEE vira banda histórica".

**`src/components/win-loss/ScenarioForecastChart.tsx`**
- Nova chave `localStorage`: `winloss-scenario-confidence-z` (string numérica; default `"1"`). Helpers `readConfidenceZ()` / persistência via `useEffect`.
- State `confidenceZ: number`, passado para `useWinLossScenarios`.
- No header do card, **visível apenas quando `bandMode === "see"`**, novo sub-controle compacto:
  - `Popover` (gatilho: pequeno chip `z=1.00 (68%)`).
  - Conteúdo: `RadioGroup` com 4 presets (68/80/90/95%) + `Slider` livre `[0.5 … 3.0]` step `0.05` para fine-tuning.
  - "Restaurar (z=1)" botão fantasma.
- Tooltip do chip explica: `"z multiplica a largura da banda SEE. 1.96 ≈ 95%."`.
- Atualizar `chartKey` para incluir `confidenceZ.toFixed(2)`.
- Atualizar texto do badge à direita do título (linha 261-268) para incluir `z=…` em modo SEE.
- Tooltip do `CustomTooltip` (rodapé): em modo SEE mostra `Modo: SEE z=1.96` em vez de `SEE ±σ` fixo.

**`src/components/win-loss/ScenarioForecastAuditPanel.tsx`**
- Receber `confidenceZ: number` por props.
- Linha "Modo de banda" passa a usar o `bandLabel` direto do hook (já contém `z`).
- Nova linha auditável: `"z (multiplicador SEE)"` mostrando `confidenceZ.toFixed(3)` + dica `"1.00=68% · 1.28=80% · 1.645=90% · 1.96=95%"`.

### Testes

**`src/test/hooks/useWinLossScenarios.test.ts`** — 3 novos testes:
1. **`"confidenceZ escala linearmente a largura SEE"`** — mesmo dataset; `width(z=2) ≈ 2 · width(z=1)` e `width(z=1.96) ≈ 1.96 · width(z=1)` em todos os steps (tol 1e-12).
2. **`"confidenceZ não afeta bandMode pi95"`** — rodar `pi95` com `confidenceZ: 1` vs `2.5`: arrays `optimistic`/`pessimistic` idênticos.
3. **`"confidenceZ respeita modo legacy √(1+step/n)"`** — `seeUseOlsInflation: false`, `confidenceZ: 1.96`; assert width = `1.96 · σ · √(1 + step/n)`.

Testes existentes (16) continuam verdes (default `z=1` preserva tudo).

**`src/test/components/winloss/ScenarioForecastChart.test.tsx`** *(criar se não existir, caso contrário estender)* — smoke test garantindo que o popover aparece só em modo SEE e que clicar no preset 95% atualiza o chip para `z=1.96`.

### UX

```text
┌────────────────────────────────────────────────────┐
│ ⚡ Forecast com cenários  [3│6│12] [SEE│PI95]       │
│                            ╰─ z=1.00 (68%) ▾       │  ← novo chip (só em SEE)
│ σ ±2.4pp · z=1.00 · fit em 8                       │
└────────────────────────────────────────────────────┘
                         │
            ┌────────────┴──────────────┐
            │ Nível de confiança         │
            │ ○ 68% (z=1.00)             │
            │ ● 80% (z=1.28)             │
            │ ○ 90% (z=1.645)            │
            │ ○ 95% (z=1.96)             │
            │                            │
            │ Personalizado:  ─●─ 1.30   │
            │ [Restaurar padrão]         │
            └────────────────────────────┘
```

### Critério de aceite
1. Em SEE, abrir o popover e escolher 95% triplica visualmente a banda em relação ao default; chip mostra `z=1.96 (95%)`.
2. Em PI 95%, o chip de confiança fica oculto e os cálculos são idênticos independente do valor salvo.
3. Painel de auditoria mostra `bandLabel` correto (ex: `"SEE z=1.645 (PI)"`) e a linha `z = 1.645`.
4. `localStorage` persiste `confidenceZ` entre reloads; usuários novos veem `z=1`.
5. Slider clampa `[0.5, 3.0]`; valores fora pelo URL/storage caem para `1`.
6. Tooltip do gráfico em modo SEE mostra `Modo: SEE z=…`.
7. Suíte `useWinLossScenarios.test.ts`: 16 antigos + 3 novos = 19 verdes; sem regressão em `ScenarioForecastAuditPanel`, hooks AtRisk ou edge functions.

