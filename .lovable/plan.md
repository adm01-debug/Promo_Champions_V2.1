

## Asserts dos atrasos de backoff (sleeps) entre as 3 tentativas em AbortError

### Contexto
`supabase/functions/winloss-webhook-dispatcher/retry.ts` aplica:
```
backoffDelay(attempt, rand) = 2^(attempt-1) * 250 + floor(rand() * 250)
```
Loop: tenta → registra delivery → se falhou e ainda há tentativa, `sleep(backoffDelay)` antes do próximo `fetch`.

`retry_test.ts` já tem testes de AbortError validando 3 fetches / 2 sleeps / dead-letter / error_message. Falta **suíte focada nos VALORES e na ORDEM dos sleeps** quando a falha é AbortError, varrendo o jitter completo e a relação ordem-temporal sleep ↔ delivery.

### Arquivo novo
`supabase/functions/winloss-webhook-dispatcher/retry_backoff_sleep_test.ts`

Reusa harness existente importando-o do `retry_test.ts` **não** é prática boa (testes não devem importar entre si); em vez disso o novo arquivo declara um harness mínimo local com 1 extensão: **timeline ordenada** registrando eventos `{kind: "fetch"|"sleep"|"delivery", value?: number, attempt?: number}` para asserts de ordem.

### Casos (8 testes, todos AbortError)

1. **rand=0 (mínimo)** → `sleeps == [250, 500]` exatos.
2. **rand=()=>0.999… (máximo prático)** → `sleeps == [250+249, 500+249] == [499, 749]` (jitter = `floor(0.9999*250) = 249`).
3. **rand=0.5** → `sleeps == [250+125, 500+125] == [375, 625]`.
4. **rand sequencial `[0.1, 0.9]`** → `sleeps == [250+25, 500+225] == [275, 725]` (cada sleep usa o próximo valor de rand).
5. **Fórmula geral**: para `rand=()=>r` fixo, `sleeps[i] === 2**i * 250 + Math.floor(r*250)` para `i ∈ {0,1}`. Loop `[0, 0.25, 0.5, 0.75]`, recriando harness por iteração.
6. **Cap de 8000ms (proteção da fórmula)**: chama `backoffDelay(6, ()=>0.999)` direto e assert `<= 8000 + 249` e que `2^5 * 250 = 8000` foi limitado por `Math.min(8000, …)`. Cobertura defensiva — não é executado pelo loop de 3 tentativas, mas valida o `Math.min` do código.
7. **Ordem temporal**: timeline deve ser exatamente `[fetch#1, delivery#1, sleep(v1), fetch#2, delivery#2, sleep(v2), fetch#3, delivery#3]` (sleep SEMPRE entre delivery N e fetch N+1, NUNCA depois do último delivery).
8. **Sucesso na 2ª tentativa após 1 AbortError** → `sleeps.length === 1`, `sleeps[0] === 250` (rand=0), e timeline confirma `[fetch, delivery(fail), sleep(250), fetch, delivery(success)]` sem 3º fetch nem 2º sleep.

### Detalhes técnicos
- Constantes esperadas derivadas de `MAX_ATTEMPTS=3`, `TIMEOUT_MS=8000` e da fórmula `backoffDelay` — importadas de `./retry.ts` (não duplicar números mágicos onde possível; `250` é constante interna de `retry.ts`, então definir `BASE = 250` localmente com comentário referenciando a fórmula).
- `rand` injetado via `deps.rand` do `dispatchOne`; nunca `Math.random` direto.
- AbortError construído via helper `makeAbortError(name="AbortError")` (igual ao já presente no arquivo de testes existente, mas redeclarado localmente para isolamento).
- `sleep` do harness empurra para `sleeps[]` E para `timeline[]` simultaneamente; `fetch` e `insertDelivery` também empurram para `timeline[]`.
- Sem dependência de tempo real — `now` retorna contador determinístico se necessário; sleeps resolvem imediatamente.

### Não-objetivos
- Não alterar `retry.ts` nem `index.ts` (comportamento já correto).
- Não tocar `retry_test.ts` (mantém como está, 100% verde).
- Não cobrir cenários HTTP 500 / mistos (já cobertos).

### Critério de aceite
1. 8 testes novos em `retry_backoff_sleep_test.ts`, todos verdes via `supabase--test_edge_functions`.
2. Cada sleep validado por **igualdade exata** em ms, derivado da fórmula `2^(n-1)*250 + floor(rand*250)`.
3. Pelo menos 1 teste valida **ordem temporal** completa fetch↔delivery↔sleep.
4. Suíte existente `retry_test.ts` continua 100% verde.
5. Zero uso de `Math.random` direto; todo jitter vem de `rand` injetado.

