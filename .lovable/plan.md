

## Tooltip + Modal "Como as bandas são calculadas?"

### Objetivo
Adicionar uma explicação visual acessível diretamente do card de Forecast, cobrindo: (1) de onde vem σ residual (SEE), (2) como ele se transforma em banda via prediction interval da OLS, (3) o que cada termo da fórmula significa, (4) como `z` e `t` controlam a cobertura.

### UX

Novo botão **"?"** discreto no header do `ScenarioForecastChart` (ao lado dos toggles de modo), com:
- **Tooltip curto** no hover: "Como as bandas são calculadas?"
- **Click** abre um **Dialog (modal)** com a explicação completa, dividida em 4 seções visuais.

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Forecast com cenários  [3│6│12] [SEE│PI95] [z=…] [?] │
└─────────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
   ┌──────────────────────────────────────────────────────┐
   │ Como as bandas são calculadas?                    ✕  │
   ├──────────────────────────────────────────────────────┤
   │ 1️⃣ Ajustamos uma reta (OLS)                          │
   │   ┌─ ASCII chart ─────────────────────────────┐      │
   │   │  •         ŷ = β₀ + β₁·x                  │      │
   │   │     •  ╱─•      (resíduo = y − ŷ)        │      │
   │   │   ╱─    •                                 │      │
   │   │ ╱─•                                       │      │
   │   └───────────────────────────────────────────┘      │
   │                                                      │
   │ 2️⃣ σ residual (SEE) = √(SSE / (n−2))                 │
   │   "desvio típico dos pontos em torno da reta"        │
   │   No seu caso: σ = 2.4pp · n = 8 · dof = 6           │
   │                                                      │
   │ 3️⃣ Largura da banda no horizonte x:                  │
   │   ┌──────────────────────────────────────────┐       │
   │   │ width(x) = z · σ · √(1 + 1/n + (x−x̄)²/Sxx)│      │
   │   └──────────────────────────────────────────┘       │
   │   • 1     → variância irredutível da observação      │
   │   • 1/n   → incerteza no intercept (β₀)              │
   │   • (x−x̄)²/Sxx → incerteza no slope (abre no futuro) │
   │                                                      │
   │ 4️⃣ Multiplicador (cobertura):                        │
   │   SEE z=1.00 → ~68%   z=1.96 → ~95%                  │
   │   PI 95% → t-Student (t=2.45 com seus dados)         │
   │                                                      │
   │              [Entendi]                               │
   └──────────────────────────────────────────────────────┘
```

### Arquivos

**Novo: `src/components/win-loss/ScenarioFormulaExplainerDialog.tsx`**
- Componente `Dialog` controlado via prop `open`/`onOpenChange`.
- Recebe stats reais do hook (`stdDev`, `fitN`, `dof`, `meanX`, `confidenceZ`, `bandMode`, `tCritical`) para personalizar a explicação ("No seu caso: σ = 2.4pp…").
- 4 seções com ícones (`TrendingUp`, `Sigma`, `Calculator`, `Target`) e blocos `<code>` para fórmulas.
- Mini-SVG inline (~120×60) ilustrando a reta OLS com 4 pontos e resíduos pontilhados — semantic tokens (`stroke-primary`, `stroke-muted-foreground`).
- Bloco final colapsável com a referência matemática completa (link para Wikipedia/ISLR opcional, sem dependência externa).

**Editado: `src/components/win-loss/ScenarioForecastChart.tsx`**
- Importar `HelpCircle` do `lucide-react` e o novo `ScenarioFormulaExplainerDialog`.
- State `explainerOpen: boolean` (default `false`).
- Adicionar botão **"?"** (variant=`ghost`, h-6 w-6, com `UITooltip` "Como as bandas são calculadas?") no header, depois do popover de `z`.
- Renderizar `<ScenarioFormulaExplainerDialog open={explainerOpen} onOpenChange={setExplainerOpen} stats={…} />` no fim do `Card`.
- Sem mudanças no chart, no hook, no painel de auditoria ou na lógica de cálculo.

### Acessibilidade
- Botão tem `aria-label="Abrir explicação das bandas de incerteza"`.
- Modal usa `DialogTitle` semântico ("Como as bandas são calculadas?") e `DialogDescription` curta para screen readers.
- ESC fecha (built-in do Radix), focus trap built-in.
- Fórmulas em `<code>` com `aria-label` descritivo na primeira ocorrência ("z vezes sigma vezes raiz de…").

### Critério de aceite
1. Botão "?" aparece no header do card, com tooltip no hover.
2. Click abre modal com 4 seções + mini-SVG da reta OLS.
3. Valores reais (`σ`, `n`, `dof`, `t`, `z`, `bandMode`) aparecem dentro do texto, não placeholders.
4. Modal fecha por ESC, click fora ou botão "Entendi".
5. Nenhuma mudança em `useWinLossScenarios`, `ScenarioForecastAuditPanel` ou suítes de teste.
6. Sem regressão visual no card; botão "?" não quebra layout em mobile (wrap natural).

