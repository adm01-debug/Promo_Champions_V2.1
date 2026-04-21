

## Debounce de `points` no `ScenarioForecastChart`

### Objetivo
Evitar que cada troca de filtro (que muda `points` instantaneamente) dispare em cascata: hook OLS pesado → `useMemo` do `data` → `chartKey` → remount do Recharts. Atrasar a reação a `points` em ~200ms acumula múltiplas mudanças rápidas (ex: trocar período + alternar canal) num único recálculo.

### Estratégia

Debounce **interno** ao componente, sobre a prop `points`. O componente já é `memo` e centraliza todo o pipeline pesado (hook + memos + key). Não tocar no `useWinLossFilters` — ele já tem debounce de 250ms para URL, mas isso é um nível diferente (URL → `localFilters` → `monthly` → `points`).

### Mudanças

**1. `src/hooks/useDebouncedValue.ts`** (novo, ~25 linhas, se ainda não existir)
- Hook genérico `useDebouncedValue<T>(value: T, delayMs = 200): T`.
- `useState` inicializado com `value`; `useEffect` com `setTimeout` que atualiza após `delayMs`; cleanup em mudança/unmount.
- Verificar antes se já existe `useDebounce`/`useDebouncedValue` no projeto e reaproveitar.

**2. `src/components/win-loss/ScenarioForecastChart.tsx`**
- Adicionar `const debouncedPoints = useDebouncedValue(points, 200);` no topo do componente.
- Trocar `useWinLossScenarios(points, …)` → `useWinLossScenarios(debouncedPoints, …)`.
- **Não** debouncear `horizon`, `bandMode`, `confidenceZ` — são interações diretas no próprio card; resposta deve ser instantânea.
- Empty-state (`!data.length`) e estado `fitN < 3` continuam reagindo do mesmo hook (que já lê o input debounced) — não bloqueia skeleton inicial porque o `useState` do debounce é inicializado com o valor atual no primeiro render.

**3. `src/test/hooks/useDebouncedValue.test.ts`** (novo, 3 testes)
- `vi.useFakeTimers()`.
- Caso 1: valor inicial retornado imediatamente (sem esperar delay).
- Caso 2: múltiplos `rerender` em <delay → valor permanece o anterior; após `vi.advanceTimersByTime(delay)` → atualiza para o último.
- Caso 3: trocar `delay` em runtime aplica o novo timeout.

**4. `src/test/components/winloss/ScenarioForecastChartKey.test.tsx`** — ajuste mínimo
- O teste "muda quando os points (filtros externos) mudam" hoje espera atualização síncrona. Com debounce de 200ms, precisará usar `vi.useFakeTimers()` + `vi.advanceTimersByTime(200)` antes do segundo `getKey()`. Setup/teardown de fake timers só nesse caso (`describe.each` ou bloco isolado).
- Os outros 4 testes não trocam `points` durante o teste — permanecem síncronos.

### Não-mudanças
- Hook `useWinLossScenarios`: assinatura, lógica e bandas idênticos.
- `buildScenarioChartKey`: idêntico.
- `WinLossIntelligence.tsx`: continua passando `monthly` direto — debounce é encapsulado no filho.
- Painel de auditoria, modal de explicação, strip de diagnósticos: idênticos (mesmo hook, input debounced).

### Critério de aceite
1. Trocar 3+ filtros em sequência rápida (<200ms entre eles) dispara **uma** recomputação do hook OLS, não três.
2. Toggles internos do card (horizonte, modo, z) reagem instantaneamente.
3. Primeiro render mostra dados imediatamente (sem aguardar 200ms inicial).
4. `useDebouncedValue.test.ts`: 3 testes verdes.
5. `ScenarioForecastChartKey.test.tsx`: 5 testes verdes (1 ajustado para fake timers).
6. Sem regressão em outras suítes.

