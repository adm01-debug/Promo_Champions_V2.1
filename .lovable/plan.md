

## Suíte: nome+mensagem corretos em `error_message` para AbortError vs TimeoutError

### Contexto
`describeError` em `retry.ts` produz `error_message = "${e.name}: ${e.message}"` para qualquer `Error` lançado pelo `fetchFn`. Hoje há cobertura espalhada em `retry_test.ts`, mas o pareamento **nome ↔ mensagem ↔ delivery** não está isolado em uma suíte dedicada nem é validado de forma paramétrica para os dois `name`s (`AbortError`, `TimeoutError`) lado a lado.

### Arquivo novo
`supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts`

Harness mínimo local (não importa de outros testes) — registra apenas `deliveries` e `r.error`. `rand=()=>0` e `sleep` resolve imediato. Usa `MAX_ATTEMPTS` importado de `./retry.ts`.

### Casos (6 testes — 3 por nome, em paralelo)

**Bloco AbortError (`name="AbortError"`)**
1. **Mensagem fixa, persistente** — todas as 3 entregas têm `error_message === "AbortError: The signal has been aborted"`; `r.error` igual; `status=0`, `succeeded=false`.
2. **Mensagem variando por tentativa** — `["aborted #1", "aborted #2", "aborted #3"]`; cada delivery reflete sua própria mensagem; `r.error === "AbortError: aborted #3"` (último).
3. **Mensagem vazia** (`new Error("")` com `name="AbortError"`) — fallback do `describeError` usa `String(e)`; assert: `error_message` começa com `"AbortError: "` e todas as 3 entregas têm o mesmo valor.

**Bloco TimeoutError (`name="TimeoutError"`)**
4. **Mensagem fixa, persistente** — análogo ao #1 com `"TimeoutError: signal timed out after 8000ms"` em todas as 3 entregas.
5. **Mensagem variando por tentativa** — `["deadline #1", "deadline #2", "deadline #3"]`; cada delivery reflete sua própria; `r.error` é o último.
6. **Recovery na 3ª** após 2 TimeoutError → deliveries `[#1, #2]` têm `error_message` com prefixo `"TimeoutError: "` e mensagens corretas; `#3` tem `error_message=null`, `succeeded=true`, `status=200`; `r.error===null`.

### Asserts por teste
- `error_message` exato (igualdade) por delivery, **separando `name` e `message`** via parsing local `(name, msg) = error_message.split(": ", 2)` para asserts independentes:
  ```ts
  const [name, ...rest] = d.error_message!.split(": ");
  const msg = rest.join(": ");
  assertEquals(name, "AbortError"); // ou "TimeoutError"
  assertEquals(msg, expectedMsgForAttempt);
  ```
- `h.deliveries.length === MAX_ATTEMPTS` (ou 3 com sucesso na última).
- Nenhum cross-talk: nenhum AbortError deve aparecer em testes de TimeoutError e vice-versa.

### Não-mudanças
- `retry.ts`, `index.ts`, `retry_test.ts`, `retry_backoff_sleep_test.ts` permanecem intactos.

### Critério de aceite
1. 6 novos testes em `retry_error_naming_test.ts`, todos verdes via `supabase--test_edge_functions`.
2. Cada delivery valida **independentemente** o `name` e a `message` (split do `error_message`).
3. Cobre AbortError e TimeoutError em 3 padrões cada: mensagem fixa, mensagem variando por tentativa, e (Timeout) recovery.
4. Suítes existentes (`retry_test.ts`, `retry_backoff_sleep_test.ts`) seguem 100% verdes.
5. Zero `Math.random` direto.

