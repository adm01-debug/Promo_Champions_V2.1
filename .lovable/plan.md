

## Suíte determinística do cap `maxDelay` no backoff frontend

### Contexto
`calculateBackoffDelay` em `src/hooks/useRetryMutation.ts`:
```
delay(n) = min(expDelay + rand() * JITTER_FACTOR * expDelay, maxDelay)
```
Hoje só há 2 casos pontuais validando o cap em `useBackoffJitter.test.ts`. Falta cobertura sistemática dos 3 regimes + bordas, com `rand` injetado.

### O que será criado

**Novo arquivo `src/test/hooks/useBackoffMaxDelayCap.test.ts`** — 10 casos determinísticos, todos via `constRand(v)`:

| # | Caso | Garante |
|---|---|---|
| 1 | Jitter máximo, `n=1..30` | `delay ≤ maxDelay` em todas as tentativas |
| 2 | Jitter mínimo (`rand=0`), `n=1..30` | Mesma invariante no extremo inferior |
| 3 | Property test: `rand ∈ {0, 0.25, 0.5, 0.75, ~1}` × `n ∈ 1..20` | Invariante vale em 100 combinações |
| 4 | Regime 1 — sem cap | Fórmula exata `expDelay × (1 + JITTER × r)` |
| 5 | Regime 2 — jitter empurra além | `expDelay=8000, max=8500`: `rand=0.21` ativa cap em 8500 |
| 6 | Regime 3 — exponencial sozinho ≥ cap | `n=10` (expDelay=512_000) e `n=50` retornam exatamente `maxDelay` |
| 7 | Boundary `expDelay == maxDelay` | Qualquer jitter > 0 → cap |
| 8 | Monotonicidade do cap | Uma vez capado, sempre capado nas tentativas seguintes |
| 9 | `maxDelay < baseDelay` | Cap engata desde n=1 |
| 10 | `maxDelay = 0` | Todo delay é 0 |

### Não será alterado
- `src/hooks/useRetryMutation.ts` (só testes).
- `src/test/hooks/useBackoffJitter.test.ts` (continua focado em fórmula/jitter; sem duplicação).
- Edge function `backoffDelay` (contrato diferente — cap só na base; fora do escopo).

### Como rodar
```bash
npx vitest run src/test/hooks/useBackoffMaxDelayCap.test.ts
```

### Critério de aceite
1. 10 testes novos, todos verdes.
2. Cada um usa `rand` injetado — zero `Math.random` direto.
3. Cobre 3 regimes + 4 bordas (igualdade, monotonicidade, max<base, max=0).
4. Suíte existente `useBackoffJitter.test.ts` continua verde.

