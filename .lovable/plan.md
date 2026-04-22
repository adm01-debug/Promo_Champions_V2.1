

## Asserts de DLQ após 3 AbortError: `last_error`, `attempts=3` e `payload` esperado

### Contexto
`retry.ts` chama `onDeadLetter` exatamente uma vez após esgotar `MAX_ATTEMPTS=3` sem sucesso, com `DeadLetterEntry { subscription_id, event, payload, last_status, last_error, attempts, total_latency_ms }`. O `payload` repassado é o **mesmo objeto recebido por `dispatchOne`** (não o `outbound` sanitizado nem o body serializado com `dispatched_at`).

Cobertura existente em `retry_test.ts`:
- `:193` valida DLQ após AbortError com `attempts` e `last_status=0`, mas **não** valida o `payload` nem o `last_error` exato.
- `:498` valida todos os campos da entry — mas com falha HTTP 502, não AbortError.

Falta um teste único que combine, **no cenário AbortError persistente**, asserts simultâneos sobre `last_error` (string exata `"AbortError: <msg>"`), `attempts === 3`, e `payload` (igualdade profunda + identidade referencial + preservação de chaves internas `__*`).

### Arquivo
Adicionar 1 teste ao final de `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` (suíte temática mais próxima — naming/error_message). Reaproveita o harness local já existente, estendendo `makeHarness` para opcionalmente capturar entradas de DLQ.

### Mudanças no harness local
- Adicionar campo `deadLetters: DeadLetterEntry[]` ao `Harness`.
- Adicionar opção `opts: { withDeadLetter?: boolean }` em `makeHarness`; quando `true`, popular `onDeadLetter` que faz `push` da entry recebida.
- Importar `DeadLetterEntry` de `./retry.ts`.

Isso não afeta os 6 testes existentes (não passam `opts`).

### Novo teste
```
"DLQ após 3 AbortError: last_error exato, attempts=3 e payload preservado (deep-eq + identity + chaves __*)"
```

**Setup**:
- `payload = { event: "x", data: { foo: 1, nested: [1, 2] }, __dispatch_id: "trace-abc", __replay: true }`.
- `fetchImpl = () => { throw makeNamedError("AbortError", "aborted by deadline"); }`.
- `withDeadLetter: true`.

**Asserts**:
1. `r.succeeded === false`, `r.attempts === MAX_ATTEMPTS` (3), `r.error === "AbortError: aborted by deadline"`.
2. `h.deadLetters.length === 1` (chamado exatamente 1×).
3. Entry da DLQ:
   - `entry.subscription_id === SUB.id`
   - `entry.event === "x"`
   - `entry.attempts === MAX_ATTEMPTS` (3)
   - `entry.last_status === 0`
   - `entry.last_error === "AbortError: aborted by deadline"` (igualdade exata, mesmo formato `Name: message` das deliveries)
   - `entry.total_latency_ms` é número ≥ 0
4. **Payload preservado**:
   - `assertEquals(entry.payload, payload)` (deep-eq, inclui `data.nested`).
   - `entry.payload === payload` (identidade referencial — confirma que `retry.ts` repassa o objeto original sem clonar).
   - Chaves internas mantidas: `entry.payload.__dispatch_id === "trace-abc"`, `entry.payload.__replay === true` (DLQ recebe o payload **não-sanitizado**, ao contrário do body do fetch).
5. **Coerência com deliveries**: `h.deliveries[2].error_message === entry.last_error` (DLQ reflete o erro da última tentativa).

### Não-mudanças
- `retry.ts`, `index.ts`, demais arquivos de teste permanecem intactos.

### Critério de aceite
1. 1 novo teste verde via `supabase--test_edge_functions`.
2. `retry_error_naming_test.ts` passa de 6 → 7 testes, todos verdes.
3. Suítes `retry_test.ts` (52) e `retry_backoff_sleep_test.ts` (9) seguem 100% verdes.
4. Asserts cobrem simultaneamente: AbortError, `last_error` exato, `attempts=3` e payload (deep-eq + identidade + chaves `__*`).

