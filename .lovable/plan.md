

## Verificação de persistência por tentativa + ausência de sleep na última

### Objetivo
Adicionar testes determinísticos em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` que comprovem dois invariantes do `dispatchOne`:

1. **Cada tentativa persiste UMA linha** em `winloss_webhook_deliveries` com `attempt`, `status`, `succeeded` e ordem cronológica corretos — mesmo quando o status varia entre tentativas.
2. **A última tentativa NUNCA dorme**: `sleeps.length === fetches - 1` em qualquer caminho de saída (sucesso na 1ª/2ª/3ª ou falha persistente).

### Estado atual
`retry_test.ts` (28 testes) cobre contagens agregadas (`deliveries.length`, `sleeps.length`) mas não valida:
- Ordem de inserção quando o **status muda** por tentativa.
- Que o `insert` acontece **antes** do `sleep` (delivery durável mesmo se o backoff falhasse depois).
- O invariante "sem sleep após a última tentativa" como propriedade explícita parametrizada.

### Mudanças

**Arquivo único**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — nova seção com 6 `Deno.test`:

1. **`falha persistente 500 grava 3 linhas com attempt=1,2,3 em ordem`** — verifica `deliveries[i].attempt === i+1` e cronologia.
2. **`status varia por tentativa (502 → 503 → 200) é refletido linha-a-linha`** — `deliveries === [{1,502,false},{2,503,false},{3,200,true}]`.
3. **`mistura HTTP + erro de rede preserva status=0 só onde há throw`** — 500 / throw ENETDOWN / 200 → `[{500,error_message:null}, {0,"...ENETDOWN..."}, {200,null}]`.
4. **`invariante sleeps === fetches-1 em 4 cenários`** — sucesso 1ª/2ª/3ª e falha persistente; em todos `sleeps.length === fetches - 1 === deliveries.length - 1`.
5. **`insert precede sleep — sequência exata em falha persistente`** — instrumenta `insertDelivery`/`sleep` para gravar marcadores num array `events`. Esperado: `["insert:1","sleep:1","insert:2","sleep:2","insert:3"]` (prova ausência de sleep após a 3ª).
6. **`sucesso na 2ª tentativa: sequência é exatamente insert:1, sleep:1, insert:2`** — mesmo instrumentador.

### Detalhes técnicos
- `makeHarness` já registra `deliveries` por `push` em ordem cronológica.
- Testes #5 e #6 sobrescrevem `deps.insertDelivery` e `deps.sleep` localmente após `makeHarness()` para gravar marcadores ordenados — sem alterar o harness base.
- Nenhuma mudança no código de produção (`retry.ts`/`index.ts`).

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~100 linhas).

### Verificação
`deno test ...retry_test.ts` — esperado **28 atuais + 6 novos = 34 ✓**.

