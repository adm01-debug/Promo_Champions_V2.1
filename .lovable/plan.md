

## Testes automatizados para retries com backoff do `winloss-webhook-dispatcher`

### Objetivo
Garantir, via testes Deno determinísticos (sem rede), que o dispatcher:
1. Para na 1ª tentativa quando o endpoint responde 2xx.
2. Faz exatamente 3 tentativas em falhas persistentes (5xx, timeout, exceção de rede).
3. Aguarda backoff exponencial correto entre tentativas (250ms, 500ms — antes da 2ª e 3ª; jitter ≤250ms; cap 8s).
4. Não dorme após a tentativa final (3ª).
5. Retorna sucesso quando uma tentativa intermediária (ex: 2ª) responde 2xx.
6. Persiste 1 linha de delivery por tentativa em `winloss_webhook_deliveries`.

### Mudanças

#### 1. Refatorar para testabilidade — `supabase/functions/winloss-webhook-dispatcher/retry.ts` (novo)
Extrair `MAX_ATTEMPTS`, `TIMEOUT_MS`, `backoffDelay`, e a função `dispatchOne` para módulo isolado, com **injeção de dependências**:
```ts
export interface DispatchDeps {
  fetchFn: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  insertDelivery: (row: DeliveryRow) => Promise<void>;
  updateSubscription: (id: string, status: number) => Promise<void>;
  now?: () => number;
}
export const MAX_ATTEMPTS = 3;
export function backoffDelay(attempt: number, rand = Math.random): number { ... }
export async function dispatchOne(sub, payload, deps): Promise<Result> { ... }
```
- `index.ts` importa de `./retry.ts` e injeta `fetch`, `setTimeout`-based sleep, e closures que escrevem no Supabase. Comportamento em produção idêntico.

#### 2. Testes — `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (novo)
Usar `Deno.test` + `std/assert`. Sem rede: `fetchFn` é mock que retorna `Response` ou rejeita. `sleep` é mock que registra delays sem realmente esperar. `insertDelivery`/`updateSubscription` são spies em arrays.

Casos:

| # | Cenário | Verificações |
|---|---------|--------------|
| 1 | `backoffDelay(1)` com rand=0 → 250; rand=0.999 → ≈499 | matemática base + jitter |
| 2 | `backoffDelay(2)` → 500–749; `backoffDelay(3)` → 1000–1249 | exponencial |
| 3 | `backoffDelay(20)` → cap 8000 + jitter | clamp |
| 4 | Sucesso 200 na 1ª | 1 fetch, 0 sleeps, `succeeded=true`, `attempts=1`, 1 delivery |
| 5 | Falha persistente 500 | 3 fetches, 2 sleeps (após 1ª e 2ª), `succeeded=false`, `attempts=3`, 3 deliveries com status=500 |
| 6 | Exceção de rede persistente (`fetchFn` rejeita) | 3 tentativas, `error_message` preservada em cada delivery, `status=0` |
| 7 | Timeout simulado (rejeita com `AbortError`) | 3 tentativas, error contém "AbortError" |
| 8 | Recuperação: 500 → 500 → 200 | 3 fetches, 2 sleeps, `succeeded=true`, `attempts=3`, última delivery `succeeded=true` |
| 9 | Sleeps registrados respeitam ordem (sleep[0] ∈ [250,499], sleep[1] ∈ [500,749]) | ordem do backoff |
| 10 | `updateSubscription` chamado 1× ao final com `last_status` correto | side-effect final |
| 11 | Falha de `insertDelivery` não interrompe loop | resiliência do logging (tentativa segue) |

Para determinismo do jitter, exporto `backoffDelay(attempt, rand)` e passo `() => 0` ou `() => 0.5` nos testes.

#### 3. Validação
- Rodar via `supabase--test_edge_functions` com `functions: ["winloss-webhook-dispatcher"]`.
- Garantir que `index.ts` continua compilando (nenhum import quebrado).
- Sem mudanças em UI, tabela ou contrato externo.

### Detalhes técnicos
- Sem migrations.
- `index.ts` mantém comportamento idêntico em produção (apenas reorganização).
- Testes 100% offline e síncronos lógicos (mock `sleep` resolve imediato).
- Cobre as 3 famílias de falha citadas no requisito: HTTP 5xx, timeout, exceção de rede.

### Ordem (sequencial)
1. Criar `retry.ts` extraindo `backoffDelay` + `dispatchOne` com DI.
2. Atualizar `index.ts` para importar de `./retry.ts` e injetar deps reais.
3. Criar `retry_test.ts` com os 11 casos.
4. `supabase--test_edge_functions` para validar.
5. Atualizar `mem://features/winloss-webhook-observability` mencionando cobertura de testes.

