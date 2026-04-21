

## Backoff jitter determinístico — RNG injetável + testes do intervalo permitido

### Objetivo
Tornar o jitter de `calculateBackoffDelay` testável de forma determinística (sem flakiness), aceitando uma função `rand` injetável, e cobrir com testes que validem o intervalo permitido em cada tentativa.

### Estado atual
`src/hooks/useRetryMutation.ts` linhas 29-38 usa `Math.random()` direto:

```ts
const exponentialDelay = baseDelay * Math.pow(multiplier, attemptNumber - 1);
const jitter = Math.random() * 0.3 * exponentialDelay; // até 30% jitter
return Math.min(exponentialDelay + jitter, maxDelay);
```

Os testes atuais em `src/test/hooks/useCircuitBreaker.test.ts` validam apenas faixas aproximadas (ex.: `≤ base + 30%`), sujeitos a flakiness e sem cobrir os limites com `maxDelay`.

### Mudanças

**1. `src/hooks/useRetryMutation.ts`** — RNG injetável + constante exportada
- Exportar `JITTER_FACTOR = 0.3`.
- Adicionar 5º parâmetro opcional `rand: () => number = Math.random`.
- 100% retrocompatível (o default usa `Math.random`).

```ts
export const JITTER_FACTOR = 0.3;

export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number,
  rand: () => number = Math.random,
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attemptNumber - 1);
  const jitter = rand() * JITTER_FACTOR * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}
```

**2. Novo `src/test/hooks/useBackoffJitter.test.ts`** — suíte 100% determinística

Cobre:
- **Borda inferior (`rand=0`)**: para n=1..6 com `base=1000, mult=2`, espera **exatamente** `base · 2^(n-1)` (sem jitter).
- **Borda superior (`rand≈1`, usa `0.999999`)**: espera `expDelay · (1 + JITTER_FACTOR)`.
- **Meio (`rand=0.5`)**: espera `expDelay · 1.15`.
- **Intervalo permitido**: rand sequencial `[0, 0.25, 0.5, 0.75, 0.999]` — cada delay ∈ `[expDelay, expDelay·1.3]` e bate com `expDelay·(1 + 0.3·r)`.
- **Cap em `maxDelay`**: n=20 com `rand=0.999` → resultado **===** `maxDelay` mesmo com jitter máximo.
- **Cap quando jitter empurra acima**: `n=4, base=1000, mult=2, max=8500, rand=0.999` → expDelay=8000, com jitter daria ~10.397 → capado em 8500.
- **`baseDelay=0`**: sempre 0 independente do rand.
- **`multiplier=1`**: delay ∈ `[base, base·1.3]` para qualquer n.
- **Snapshot da progressão (`rand=0.5`)**: `base=100, mult=2`, n=1..5 → `[115, 230, 460, 920, 1840]`.
- **Monotonicidade com rand fixo**: `delay(n+1) > delay(n)` enquanto não capado.
- **Auditoria de não-acumulação**: 100 chamadas com `rand=0.5` somam exatamente `100 · 1000 · 1.15 = 115_000` (verifica ausência de drift).

Total: ~11 casos determinísticos, sem `Math.random()`.

### Detalhes técnicos
- Injeção opcional → zero impacto em `withRetry` / `useRetryMutation` / chamadores existentes.
- Asserts usam igualdade exata onde a matemática permite (rand=0) e `toBeCloseTo(_, 6)` apenas onde envolve floats não inteiros.
- `JITTER_FACTOR` vira fonte única da verdade — testes referenciam a constante em vez de hardcodar 0.3.
- A suíte antiga em `useCircuitBreaker.test.ts` continua passando (default inalterado).

### Arquivos
- **Modificar**: `src/hooks/useRetryMutation.ts` — adicionar param `rand` + exportar `JITTER_FACTOR`.
- **Criar**: `src/test/hooks/useBackoffJitter.test.ts` — suíte determinística.

### Ordem
1. Editar `useRetryMutation.ts` (param opcional + constante).
2. Criar a nova suíte.
3. Rodar `npx vitest run src/test/hooks/useBackoffJitter.test.ts src/test/hooks/useCircuitBreaker.test.ts` — esperado os 11 novos + a suíte antiga ✓.

