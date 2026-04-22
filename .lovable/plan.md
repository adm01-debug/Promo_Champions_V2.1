

## Teste: AbortError × 2 + 200 na 3ª — `error_message` null só na bem-sucedida

### Contexto
Pedido: validar que, em uma sequência `[AbortError, AbortError, 200]`, o `error_message` fica `null` **apenas** na delivery #3.

Já existe teste equivalente em `retry_test.ts:231` ("recovery após 2 timeouts → 3ª tentativa 200, error_message null só na última"). Para evitar duplicação literal, adiciono uma variante **reforçada** em `retry_backoff_sleep_test.ts` que cobre, no mesmo cenário, asserts extras consistentes com o tema desse arquivo (sleeps + ordem temporal) — fechando o gap entre as duas suítes.

### Mudança
1 teste novo em `supabase/functions/winloss-webhook-dispatcher/retry_backoff_sleep_test.ts`, ao final do arquivo:

```
"backoff sleeps: AbortError × 2 + 200 na 3ª → error_message null apenas na delivery #3"
```

Asserts:
- `h.fetches() === 3` e `h.sleeps === [250, 500]` (backoff determinístico, `rand=()=>0`).
- `r.attempts === 3`, `r.succeeded === true`, `r.status === 200`, `r.error === null`.
- `h.deliveries[0].error_message === "AbortError: timeout #1"`, `succeeded=false`, `status=0`.
- `h.deliveries[1].error_message === "AbortError: timeout #2"`, `succeeded=false`, `status=0`.
- `h.deliveries[2].error_message === null`, `succeeded=true`, `status=200`.
- **Invariante**: `deliveries.filter(d => d.error_message === null)` tem comprimento 1 e é a entrega bem-sucedida.
- **Timeline exata**: `[fetch#1, delivery#1(fail), sleep(250), fetch#2, delivery#2(fail), sleep(500), fetch#3, delivery#3(success)]` — sem sleep após o último delivery.

### Não-mudanças
- `retry.ts` e `index.ts` inalterados.
- `retry_test.ts` inalterado (teste pré-existente segue verde).

### Critério de aceite
1. 1 teste novo verde via `supabase--test_edge_functions`.
2. Suíte `retry_backoff_sleep_test.ts` passa de 8 → 9 testes, todos verdes.
3. `retry_test.ts` segue 100% verde (52/52).
4. Zero `Math.random` direto — `rand` injetado.

