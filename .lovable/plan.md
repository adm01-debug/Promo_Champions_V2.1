

## Fallback estável para `chartKey` no `ScenarioForecastChart`

### Problema
Hoje `chartKey` é construído a partir de `data` (mapeada de `series`), `stdDev`, `fitN` e parâmetros de banda. Quando `series` está vazia ou parcial:
- `data.length === 0` → o componente já faz early-return com card de "sem dados", mas o `chartKey` ainda é avaliado em re-renders posteriores e pode oscilar entre `"scenario-see-z1.00-h3-0-0-0.00-"` e versões com 1–2 pontos enquanto o React Query rehidrata.
- `stdDev`/`fitN` em `0` durante o estado intermediário do hook (`n<3`) produz keys colidentes entre datasets diferentes mas igualmente "vazios", levando o Recharts a reusar internals (escalas/tooltip cache) de uma série antiga.
- A `signature` concatenada cresce O(n) e nunca tem fallback determinístico — se um ponto vier com `period` `undefined` (granularity trocada mid-flight), a key vira `undefined:NaN:NaN:NaN:0` e dispara remounts inconsistentes.

### Mudanças

**1. `src/components/win-loss/ScenarioForecastChart.tsx`**

Substituir o `useMemo` do `chartKey` (linhas 200-205) por uma função `buildChartKey` com 3 estados explícitos:

- **`empty`** (`data.length === 0` ou `fitN === 0`): retorna constante `"scenario-empty"`. Garante que qualquer dataset vazio compartilhe a mesma key — Recharts não re-monta à toa enquanto o usuário troca filtros que zeram o resultado.
- **`insufficient`** (`fitN > 0 && fitN < 3`): retorna `"scenario-insufficient-{fitN}-{firstPeriod}"`. Inclui o primeiro `period` como discriminador estável (não depende de stdDev=0).
- **`ready`** (`fitN >= 3`): mantém a key atual, **mas** usa hash determinístico curto (djb2 de 32-bit em hex) da signature em vez de concatenar a string inteira. Evita keys de 2–10kB em horizontes longos e elimina o risco de `undefined`/`NaN` no meio da string (a função de hash trata cada char numericamente).

Adicionar guarda no map da `signature`: se `d.period` for falsy ou qualquer numérico for `NaN`, pular o ponto e marcar a key como `…-partial` para sinalizar fallback.

Pseudocódigo:
```text
function buildChartKey(data, fitN, bandMode, confidenceZ, horizon, stdDev):
  if data.length === 0 || fitN === 0:
    return "scenario-empty"
  if fitN < 3:
    return `scenario-insufficient-${fitN}-${data[0]?.period ?? "x"}`
  let partial = false
  let hash = 5381
  for d of data:
    if !d.period || isNaN(d.realistic) || isNaN(d.optimistic) || isNaN(d.pessimistic):
      partial = true
      continue
    for ch of `${d.period}:${d.realistic}:${d.pessimistic}:${d.optimistic}:${d.isForecast?1:0}`:
      hash = ((hash << 5) + hash + ch.charCodeAt(0)) | 0
  const sig = (hash >>> 0).toString(16)
  return `scenario-${bandMode}-z${confidenceZ.toFixed(2)}-h${horizon}-n${data.length}-fit${fitN}-σ${stdDev.toFixed(2)}-${sig}${partial?"-partial":""}`
```

Mover a função para fora do componente (puro, testável), exportá-la nomeadamente para os testes.

**2. `src/test/components/winloss/ScenarioChartKey.test.ts`** (novo, ~60 linhas)

Cobrir os 4 cenários:
1. `data=[]` → `"scenario-empty"`.
2. `fitN=2` com 2 pontos → começa com `"scenario-insufficient-2-"`.
3. Série completa (`fitN=12`, 15 pontos) → key começa com `"scenario-see-z1.00-h3-n15-fit12-"` e termina com hash hex de 8 chars; chamar 2x com mesma entrada → mesma key (determinismo).
4. Série com 1 ponto contendo `period: undefined` → key contém sufixo `-partial`.
5. Duas séries diferentes de tamanho igual mas valores distintos → keys diferentes (anti-colisão).

### Não-mudanças
- Hook `useWinLossScenarios`, painel de auditoria, strip de diagnósticos, modal de explicação, fórmulas das bandas, modos `see`/`pi95` permanecem intactos.
- Comportamento visual do gráfico em estado pronto é idêntico (Recharts ainda re-monta quando deve, só que agora com key compacta e estável).
- Nenhuma migração de localStorage.

### Critério de aceite
1. Trocar filtros que zeram o dataset não causa remount visual oscilante do gráfico (key constante `"scenario-empty"`).
2. Em transição `n=2 → n=3 → n=12`, a key muda exatamente uma vez por transição de estado (insufficient → ready) e uma vez quando os dados realmente mudam.
3. Para horizonte 12 com 24 pontos históricos, a key tem ≤ ~80 chars (vs. ~2kB hoje).
4. Série com `period: undefined` em qualquer ponto não quebra o gráfico nem produz key com `"undefined"` literal — recebe sufixo `-partial`.
5. 5 testes novos verdes; nenhuma regressão nos 18 testes do hook nem nos snapshots existentes.

