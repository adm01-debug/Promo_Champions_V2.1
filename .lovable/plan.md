

## Simulação fan-out: 1 evento → N subscriptions, validação por destino

### Objetivo
Provar de forma determinística (sem rede, sem Supabase) que ao disparar um único evento o dispatcher:
1. Faz **1 POST** para cada subscription elegível (URL e header corretos).
2. Cada subscription tem retries/backoff próprios — falhas em uma não afetam as outras.
3. `updateSubscription(id, status)` é chamado **uma vez por subscription**, com o `last_status` final daquela subscription (independente).
4. Resultados retornados (`results[]`) preservam status individual por `id`.

### Como
Adicionar bloco novo de testes em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (não cria arquivo novo — mantém tudo no test-runner Deno já validado).

**Novo helper** `makeFanoutHarness(subs, fetchByUrl)`:
- `fetchFn` roteia por `request.url` para a função-resposta correta — cada sub tem seu próprio contador de tentativas.
- `insertDelivery`, `updateSubscription` agregam por `subscription_id`.
- Chamado via `Promise.all(subs.map((s) => dispatchOne(s, payload, deps)))` (igual ao `index.ts`).

**4 casos novos** ("fan-out"):

1. **`fan-out: 3 subs todas 2xx → 1 POST cada, last_status=200 cada`**
   - Subs A/B/C → 200. Asserts: `fetchesByUrl = {A:1, B:1, C:1}`; `updates` contém `{A,200},{B,200},{C,200}` (ordem livre); `deliveries.length === 3`; cada `results[i].succeeded === true`.

2. **`fan-out: sucesso e falha são independentes`**
   - A→200 (1ª), B→500x3, C→200 (1ª). Asserts: A 1 POST, B 3 POSTs, C 1 POST (total 5); `updates` traz `{A,200},{B,500},{C,200}`; só B aparece em `deadLetters` quando `withDeadLetter: true`; resultados preservam `succeeded` correto por `id`.

3. **`fan-out: header X-Winloss-Event e payload corretos por sub`**
   - Captura `init` de cada `fetch` e verifica `headers["X-Winloss-Event"] === "x"`, `method === "POST"`, body parseável e contém `deal_id`. Garante que payload externo **não** contém chaves `__*` (sanitização preservada na fan-out).

4. **`fan-out: ordem de updateSubscription não acopla — falha lenta de B não bloqueia A/C`**
   - A/C respondem imediato 200; B faz 3 falhas (sleeps registrados). Verifica que `updates` para A e C ocorrem mesmo com B ainda em retry (via contagem de `sleeps` apenas vindos de B = 2, e total `fetches = 1+3+1`).

### Detalhes técnicos
- Reuso total de `dispatchOne` + `DispatchDeps` — nenhuma mudança em `retry.ts` ou `index.ts`.
- `sleep` continua mock-resolve-imediato (sem latência real).
- Roteamento por URL no `fetchFn` é a única adição estrutural ao harness.
- Mantém estilo dos 18 testes existentes (sem dependências novas).
- Validação final: `supabase--test_edge_functions` para `winloss-webhook-dispatcher` (esperado 22/22 passando).

### Ordem
1. Adicionar `makeFanoutHarness` + 4 testes no final de `retry_test.ts`.
2. Rodar `supabase--test_edge_functions` (somente esta função).
3. Atualizar `mem://features/winloss-webhook-observability` mencionando cobertura fan-out.

