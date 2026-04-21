

## Provar isolamento temporal: backoff de uma sub não atrasa nem impede updateSubscription das demais

### Estado atual
O teste **"fan-out: retries de uma sub não acoplam às outras (sleeps isolados)"** (linha ~717 de `retry_test.ts`) já valida fetches por URL e que `updateSubscription` é chamado 1× por sub. Porém:
- Mede sleeps por **URL** (via `currentUrl` global no harness — racy sob `Promise.all`).
- Não comprova os **valores exatos** dos backoffs de B.
- Não valida temporalmente que A e C não esperaram pelos backoffs de B.

### O que será adicionado
Um teste autônomo em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts`, inserido após o teste da linha ~808, com **harness próprio por subscription**:
- Cada `dispatchOne` recebe um `DispatchDeps` exclusivo via closure → `sleeps` e `fetches` são amarrados ao `subId`, não a estado global racy.
- `rand: () => 0` (jitter zero) para backoff determinístico: `[250, 500]` em B.
- Relógio virtual `virtualNow` avançado apenas pelos `sleep()` daquela thread.

Cenário: A=200 (1 fetch), B=500 em todas (esgota), C=200 (1 fetch).

### Asserções
1. **fetches por id**: A=1, B=`MAX_ATTEMPTS`, C=1.
2. **sleeps por id**:
   - A e C: zero sleeps.
   - B: exatamente `[250, 500]`.
3. **updates por id**: cada sub fez `updateSubscription` exatamente 1×, com status final correto (200, 500, 200).
4. **prova temporal** via `virtualNow` no momento do update:
   - `byId["sub-B"].at >= 750` (B esperou seus 2 backoffs).
   - A e C não acumularam sleeps próprios.
5. **total de sleeps no fan-out** = `MAX_ATTEMPTS - 1` = 2 (apenas B).

### Onde
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~85 linhas, após linha 808).
- **Não modificar**: `retry.ts`.

### Verificação
`supabase--test_edge_functions` com `functions: ["winloss-webhook-dispatcher"]`, `pattern: "fan-out"` — deve listar 8 testes (7 atuais + 1 novo), todos `ok`.

