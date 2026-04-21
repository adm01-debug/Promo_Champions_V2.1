

## Testes de timeout via AbortError no `winloss-webhook-dispatcher`

### Objetivo
Adicionar testes determinísticos em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` que simulem timeout via `AbortError` (e a variante `TimeoutError`) e confirmem que o dispatcher:
1. Faz **exatamente 3 tentativas** (`MAX_ATTEMPTS`).
2. Registra o **`error_message` correto em cada uma das 3 entregas** (`winloss_webhook_deliveries`).
3. Propaga o erro corretamente para o **dead-letter** após esgotar as tentativas.

### Estado atual
O arquivo já possui um teste superficial (linhas 139-149) que apenas confere `r.attempts === 3` e `r.error includes "TimeoutError"` — não inspeciona o conteúdo de cada delivery, não testa `AbortError` (só `TimeoutError`), não valida o DLQ nem o cenário misto (timeouts + recovery).

A infraestrutura necessária já existe:
- `makeHarness()` captura `deliveries[]`, `sleeps[]`, `deadLetters[]`.
- `fetchImpl(attempt)` permite injetar erro/resposta por tentativa.
- `rand: () => 0` torna o backoff determinístico (`[250, 500]`).

### Mudanças

**Arquivo único modificado**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts`

Inserir, logo após o teste atual de `AbortError` (linha 149), um novo bloco "**timeout via AbortError: 3 tentativas + error_message por entrega**" com 6 testes:

1. **Helper `makeAbortError(msg)`** — fabrica `Error` com `name="AbortError"` (espelha o que `AbortSignal.timeout()` lança).

2. **`AbortError persistente → 3 fetches, 2 sleeps, 3 deliveries`**
   - `fetches === MAX_ATTEMPTS` (3)
   - `sleeps === [250, 500]` (backoff determinístico com `rand=0`)
   - `deliveries.length === 3`, `r.status === 0`, `r.succeeded === false`.

3. **`cada uma das 3 entregas registra error_message="AbortError: ..."`**
   - Loop sobre `deliveries[i]`: `attempt === i+1`, `status === 0`, `succeeded === false`, `error_message === "AbortError: The signal has been aborted"`, `subscription_id` e `event` corretos.

4. **`dead-letter capturado com last_error e attempts=3`**
   - Após 3 timeouts, `deadLetters[0]` tem `attempts=3`, `last_status=0`, `last_error="AbortError: aborted by timeout"`, `payload === PAYLOAD`.

5. **`error_message muda por tentativa quando o erro varia`**
   - Cada attempt lança `AbortError` com mensagem distinta (`try 1/2/3`). Verifica que cada `deliveries[i].error_message` reflete o erro daquela tentativa, e que `r.error` preserva apenas o último.

6. **`recovery após 2 timeouts → 3ª tentativa 200, error_message null só na última`**
   - Tentativas 1 e 2 lançam `AbortError`; tentativa 3 retorna 200. Confere: `r.succeeded=true`, `r.error=null`, `deliveries[0].error_message="AbortError: timeout #1"` (succeeded=false), `deliveries[1]` análogo, `deliveries[2].error_message=null` e `succeeded=true`.

7. **`TimeoutError variant: todas as 3 entregas registram 'TimeoutError: ...'`**
   - Cobre o caso real de `AbortSignal.timeout()` em runtimes Deno modernos (DOMException com `name="TimeoutError"`).

### Detalhes técnicos
- Asserts estritos com `assertEquals` em `error_message` (string exata `"<name>: <message>"` — bate com o formato `${e.name}: ${e.message}` em `retry.ts:131`).
- Backoff continua determinístico via `rand: () => 0` herdado do harness — sleeps esperados `[250, 500]`.
- O teste superficial existente (linhas 139-149) é mantido por compatibilidade.
- Nenhuma mudança no código de produção (`retry.ts`/`index.ts`).

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~110 linhas, 6 novos `Deno.test`).

### Verificação
Rodar `deno test supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — esperado **todos os existentes + 6 novos = passando**.

