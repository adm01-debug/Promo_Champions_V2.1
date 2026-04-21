
## Documentação inline no `useWinLossScenarios`: por que SEE e como vira banda

### Objetivo
Adicionar uma **seção de documentação no topo do arquivo** (bloco JSDoc grande) explicando o racional estatístico do uso do **Standard Error of the Estimate (SEE / σ residual)**, e **comentários inline** nos pontos-chave do cálculo. Sem mudar nenhum comportamento, sem renomear nada, sem novos exports.

### Mudança única: `src/hooks/win-loss/useWinLossScenarios.ts`

**1. Cabeçalho do arquivo (antes dos imports)** — bloco `/** ... */` com a seção de documentação:

```
================================================================================
WIN/LOSS SCENARIO FORECAST — Background estatístico
================================================================================

Por que Standard Error of the Estimate (SEE) dos resíduos?
----------------------------------------------------------
Ajustamos uma reta OLS  ŷ = β₀ + β₁·x  sobre a série histórica de winRate.
O SEE  σ̂ = √(SSE / (n−2))  mede o "ruído típico" em torno dessa reta — ou
seja, o quanto a realidade costuma se desviar do modelo nos próprios dados
de treino. É a métrica natural para responder "quão errado eu costumo estar?"
sem precisar assumir uma distribuição prévia: vem direto dos resíduos
observados (y − ŷ).

Escolhemos SEE em vez de:
  - desvio-padrão simples de y → ignora a tendência (slope), superestima
    incerteza quando há trend claro;
  - bootstrap / IC empírico → custoso para n pequeno (séries curtas de
    winRate por período), instável e sem forma fechada para auditoria;
  - intervalos bayesianos → exigiria prior, fora do escopo de um forecast
    leve client-side.

Como SEE vira "banda histórica" (fan de cenários)?
--------------------------------------------------
Para cada step futuro x, o **valor central** (cenário realista) é a própria
predição OLS  ŷ(x). A **largura da banda** é σ̂ multiplicado por um fator
de inflação que cresce conforme x se afasta do centro x̄ dos dados:

    width(x) = σ̂ · √( 1 + 1/n + (x − x̄)² / Sxx )       [PI 1σ, ~68%]
    width(x) = t · σ̂ · √( 1 + 1/n + (x − x̄)² / Sxx )    [PI 95%, t-Student]

  - O termo  1            → variância irredutível de uma observação futura.
  - O termo  1/n          → incerteza no intercept (β₀).
  - O termo  (x−x̄)²/Sxx  → incerteza no slope, que se amplifica longe do
    centro do treino. É **isso** que faz a banda se abrir no horizonte.

Cenários otimista/pessimista são  ŷ(x) ± width(x), depois clamp em [0, 100]
porque winRate é percentual.

Pontos históricos têm banda colapsada (otimista = realista = pessimista =
winRate observado): só medimos incerteza onde estamos extrapolando.

Modo legado  width = σ̂ · √(1 + step/n)  é mantido como opt-in
(`seeUseOlsInflation: false`) para comparação visual; cresce muito devagar
e ignora o efeito da distância ao centróide.

Limitações conhecidas
---------------------
  - Assume ruído homocedástico e aproximadamente normal (válido para n ≥ ~6).
  - n < 3 → bandas colapsam (sem regressão); o caller deve tratar como
    "dados insuficientes".
  - dof ≥ 30 → t convergência para 1.96 (fallback normal).
================================================================================
```

**2. Comentários inline curtos** ancorando a teoria ao código:

- Acima de `T_TABLE_975` (linha 58): manter o comentário existente, adicionar 1 linha:
  `// Usado apenas no modo PI 95%; para SEE 1σ o multiplicador é implicitamente 1.`

- Antes do bloco do cálculo OLS (linha 143, antes de `const meanX`): bloco curto:
  ```
  // ── OLS fit ────────────────────────────────────────────────────────────
  // β₁ = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²    β₀ = ȳ − β₁·x̄
  ```

- Acima de `const residualStdDev` (linha 157):
  ```
  // SEE: σ̂ = √(SSE / dof). Mede o desvio típico dos resíduos do ajuste —
  // base de toda a banda de incerteza (ver doc do topo do arquivo).
  ```

- Acima de `const olsFactor` (linha 168):
  ```
  // Fator de inflação do prediction interval OLS:
  //   √(1 + 1/n + (x−x̄)²/Sxx)
  // Cresce com a distância de x ao centro dos dados → banda abre no futuro.
  ```

- Dentro do `for` de forecast (linha 175, acima do `let width`):
  ```
  // width = (multiplicador) · σ̂ · (fator de inflação)
  //   pi95 → t-Student;  see+OLS → 1;  see legado → √(1+step/n) sem (x−x̄).
  ```

- Acima do `historical: ScenarioPoint[]` (linha 160):
  ```
  // Pontos históricos: banda colapsada — só extrapolamos incerteza no futuro.
  ```

### Critério de aceite
1. `useWinLossScenarios.ts` ganha o bloco JSDoc de documentação no topo (~50 linhas) + 6 comentários inline curtos.
2. Zero mudança de runtime: nenhum identificador renomeado, nenhuma assinatura alterada, nenhuma constante movida.
3. Suítes existentes (`useWinLossScenarios.test.ts`, etc.) continuam verdes sem ajuste.
4. Lint/Prettier passam (comentários `//` e `/** */` padrão do projeto, sem caracteres de largura > 100 em runs de código).
