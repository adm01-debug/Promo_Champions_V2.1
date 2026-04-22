

## Atualizar testes de circuit breaker/backoff para constantes e remover `Math.random()`

### Contexto
Os testes determinísticos de backoff (`useBackoffJitter.test.ts`, `useBackoffMaxDelayCap.test.ts`, `useBackoffEdgeCases.test.ts`) já injetam `rand` via `constRand`. Falta varrer o restante da suíte para: (a) eliminar usos residuais de `Math.random()` em testes que tocam backoff/circuit breaker, e (b) trocar magic numbers por constantes exportadas (`JITTER_FACTOR` de `useRetryMutation` e `SECURITY.*` de `@/config/constants`).

### Investigação a fazer antes da edição
1. `grep -r "Math.random" src/test` — localizar todo uso em testes.
2. `grep -r "useCircuitBreaker\|circuitBreaker\|useRetryMutation" src/test` — mapear suítes afetadas.
3. Conferir se `useCircuitBreaker.ts` exporta defaults (`failureThreshold=5`, `resetTimeout=30000`) — se não, considerar exportá-los como `CIRCUIT_BREAKER_DEFAULTS` para reuso nos testes (sem alterar comportamento).
4. Verificar `useLoginRateLimiter.test.ts` — usa `BASE_LOCKOUT_SECONDS=30` e `MAX_ATTEMPTS=5` hardcoded; cruzar com `SECURITY.MAX_LOGIN_ATTEMPTS` e `SECURITY.LOCKOUT_DURATION_MINUTES` em `src/config/constants.ts`.

### Mudanças

**1. `src/hooks/useCircuitBreaker.ts`** (mínima — só exportar)
- Promover `DEFAULT_CONFIG` a `export const CIRCUIT_BREAKER_DEFAULTS` (ou exportar nomes individuais). Sem alterar valores nem comportamento.

**2. `src/test/hooks/useBackoffJitter.test.ts`**
- Substituir literais `0.3` (já usa `JITTER_FACTOR` ✓) e `1 + JITTER_FACTOR` onde aparecer `1.3` cru.
- Trocar `r=0.999` / `0.999999` por uma constante local `MAX_RAND` no topo (consistência com `useBackoffMaxDelayCap.test.ts`).
- Garantir que nenhuma assertion dependa de `Math.random` direta ou indiretamente (já não depende — confirmar).

**3. `src/test/hooks/useBackoffMaxDelayCap.test.ts` / `useBackoffEdgeCases.test.ts`**
- Auditar e padronizar: importar `JITTER_FACTOR` em vez de `0.3` literal onde houver.
- Compartilhar `constRand` / `MAX_RAND` (deixar inline em cada arquivo — já é trivial; sem extrair helper para evitar dependência cruzada entre suítes).

**4. Testes de circuit breaker** (se existirem — confirmar via grep)
- Se houver testes que chamam `useCircuitBreaker(name, { failureThreshold: 5, resetTimeout: 30000 })` com literais, trocar para `CIRCUIT_BREAKER_DEFAULTS.failureThreshold` etc.
- Se algum teste usar `Math.random()` para gerar nomes de circuito únicos, trocar por `crypto.randomUUID()` (determinístico-suficiente, sem flakiness de PRNG) ou por contador incremental no `beforeEach`.

**5. `src/test/hooks/useLoginRateLimiter.test.ts`**
- Trocar `BASE_LOCKOUT_SECONDS = 30` e `MAX_ATTEMPTS = 5` locais por:
  ```ts
  import { SECURITY } from '@/config/constants';
  const MAX_ATTEMPTS = SECURITY.MAX_LOGIN_ATTEMPTS;
  // BASE_LOCKOUT permanece local pois 30s é específico do limiter,
  // não aparece em SECURITY.LOCKOUT_DURATION_MINUTES (15min) — manter literal documentado.
  ```
- Apenas se os valores realmente coincidirem; caso contrário, manter local com comentário explicando a divergência intencional.

**6. Varredura final `Math.random` em `src/test/**`**
- Para cada ocorrência: substituir por `seq([...])` determinístico, `constRand(v)`, ou `crypto.randomUUID()` quando for só geração de id único.
- Documentar no topo de cada arquivo afetado: `// Determinístico: nenhum Math.random — todos os PRNGs são injetados.`

### Não-mudanças
- Comportamento de produção em `useCircuitBreaker.ts` e `useRetryMutation.ts` (apenas exportar constante de defaults, se necessário).
- Edge functions (`backoffDelay` em `winloss-webhook-dispatcher/retry.ts`) — fora do escopo deste pedido (frontend only).

### Critério de aceite
1. `grep -r "Math.random" src/test` retorna **zero** ocorrências em testes ligados a backoff/circuit breaker/rate limiter.
2. Magic numbers `0.3`, `1.3`, `5` (failureThreshold), `30000` (resetTimeout) substituídos por importações de `JITTER_FACTOR` / `CIRCUIT_BREAKER_DEFAULTS` / `SECURITY.*` onde semanticamente equivalentes.
3. Suítes existentes (`useBackoffJitter`, `useBackoffMaxDelayCap`, `useBackoffEdgeCases`, `useLoginRateLimiter`, e quaisquer testes de `useCircuitBreaker` encontrados) continuam **100% verdes**.
4. Nenhuma alteração de comportamento em produção — só refactor de testes + 1 export adicional opcional.

