

## Resiliência: falha em `insertDelivery` não interrompe o loop de retries

### Objetivo
Adicionar testes determinísticos em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` que provem que, mesmo quando `insertDelivery` falha (rejeita) em **toda** chamada, o `dispatchOne`:

1. **Continua o loop completo** — executa as 3 tentativas de fetch (`fetches === MAX_ATTEMPTS`).
2. **Mantém o backoff intacto** — exatamente 2 sleeps registrados (`[250, 500]` com `rand=0`).
3. **Conclui com sucesso quando o fetch eventualmente passa** — retorna `succeeded:true` se a 3ª (ou 2ª) tentativa retornar 200, mesmo com inserts falhando antes.
4. **Aciona dead-letter na falha terminal** — quando todos os fetches falham e os inserts também, o `onDeadLetter` ainda é chamado com `attempts: 3`.
5. **Captura erros de log sem propagar** — a Promise final resolve normalmente; nenhum throw escapa do `dispatchOne`.

### Estado atual
- `makeHarness` já aceita `insertThrows: true` (linhas 18, 32-36).
- `dispatchOne` envolve `insertDelivery` em try/catch (retry.ts:159-178), então o invariante existe no código mas **não é coberto por nenhum teste** — qualquer regressão (ex: remover o try/catch) passaria silenciosamente.

### Mudanças

**Arquivo único**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — nova seção com 4 `Deno.test`:

1. **`insertDelivery falha em todas: dispatcher executa as 3 tentativas mesmo assim`**
   - Cenário: fetch sempre 500, `insertThrows: true`.
   - Asserts: `h.fetches === 3`, `h.sleeps.length === 2`, `h.sleeps === [250, 500]`, `h.deliveries.length === 0` (nada persistido), resultado `{ succeeded: false, attempts: 3, status: 500 }`.

2. **`insertDelivery falha em todas + sucesso na 3ª: dispatcher retorna succeeded`**
   - Cenário: fetch 500 → 500 → 200, `insertThrows: true`.
   - Asserts: `h.fetches === 3`, `h.sleeps.length === 2`, `h.deliveries.length === 0`, resultado `{ succeeded: true, attempts: 3, status: 200, error: null }`.

3. **`insertDelivery falha + falha terminal: dead-letter ainda é chamado`**
   - Cenário: fetch sempre 500, `insertThrows: true`, `withDeadLetter: true`.
   - Asserts: `h.deadLetters.length === 1`, `h.deadLetters[0].attempts === 3`, `h.deadLetters[0].last_status === 500`.

4. **`insertDelivery falha em todas: dispatchOne resolve sem lançar`**
   - Cenário: fetch sempre throws (network error), `insertThrows: true`.
   - Asserts: a chamada `await dispatchOne(...)` resolve (não rejeita); `h.fetches === 3`, `h.sleeps.length === 2`, resultado `succeeded: false` com `error` preenchido.

### Detalhes técnicos
- Reutiliza 100% o `makeHarness` existente (já tem `insertThrows`).
- `rand: () => 0` para sleeps determinísticos `[250, 500]`.
- Nenhuma mudança em `retry.ts` ou `index.ts`.

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~60 linhas).

### Verificação
`deno test supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — esperado **34 atuais + 4 novos = 38 ✓**.

