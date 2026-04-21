

## Reforçar asserções de fan-out: contagem por URL + headers + body com deal_id

### Estado atual
`retry_test.ts` já cobre parcialmente o pedido:
- **Contagem por URL**: validada nos testes das linhas 647-649, 670-672 e 726-728 (`fetchesByUrl[url] === 1` / `=== MAX_ATTEMPTS`).
- **Header `X-Winloss-Event`**: validado no teste da linha 691 (`headers["X-Winloss-Event"] === "x"`).
- **Body com `deal_id`**: validado no mesmo teste (linha 707: `body.includes('"deal_id":"d-99"')`).

Porém, essas asserções estão **espalhadas em 3 testes diferentes** e o body usa o mesmo `deal_id` para todas as subs (não prova isolamento de payload por subscription).

### O que será adicionado

Um único teste consolidado em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts`, inserido após o teste da linha 715, com asserções **explícitas e agrupadas** para fan-out de N=3 subs:

1. **Contagem de fetch por URL**: `fetchesByUrl[SUB_A.url] === 1`, idem B e C — exatamente 1 POST por subscription (sem cross-fire).
2. **Header `X-Winloss-Event` em cada init capturado**: itera `capturedInits` e assertEquals === valor do `event` do payload usado naquela chamada.
3. **Header `Content-Type: application/json`** em cada POST.
4. **Body parseável + contém `deal_id`**: para cada `capturedInit`, faz `JSON.parse(init.body)` e assert `parsed.deal_id === "deal-fan-123"` e `parsed.event === "x"`. Garante body íntegro (não só substring) e que o deal_id chega a TODAS as subscriptions sem perda.
5. **Métodos**: `init.method === "POST"` para cada um.
6. **Total de fetches** = 3 (1×N) — defesa extra contra duplicação.

Também será adicionado um segundo teste **N=20** (escala) com mesmo `deal_id` no payload, validando:
- `Object.keys(fetchesByUrl).length === 20`.
- Soma de fetches === 20.
- Todos os 20 bodies contêm o mesmo `deal_id` após `JSON.parse`.
- Todos os 20 headers carregam `X-Winloss-Event`.

### Onde
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~60 linhas, após linha 715).
- **Não modificar**: `retry.ts` (apenas testes).

### Verificação
1. `supabase--test_edge_functions` com `functions: ["winloss-webhook-dispatcher"]` — toda a suíte continua verde + 2 novos testes verdes.
2. Filtro `pattern: "fan-out"` deve listar agora 5 testes (3 existentes + 2 novos), todos `ok`.

