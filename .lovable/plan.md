

## Incluir `requestId` na resposta HTTP do `winloss-webhook-dispatcher`

### Objetivo
Expor o `requestId` (já gerado e usado nos logs estruturados) também no corpo JSON da resposta HTTP do dispatcher, para correlacionar a chamada cliente ↔ logs do edge function durante troubleshooting.

### Estado atual (a confirmar via leitura)
`supabase/functions/winloss-webhook-dispatcher/index.ts` — gera um `requestId` (UUID/correlation id) e emite logs estruturados com ele, mas a resposta HTTP retorna apenas `{ dispatched, results }` (ou similar), sem o `requestId`. O cliente recebe o resultado mas não tem o ID para buscar nos logs.

Já existe precedente: `winloss-webhook-replay` retorna `{ requestId, source, results }` (visto em `useWebhookDeliveries.ts`), e o frontend sabe consumir esse formato.

### Mudanças

**Arquivo único**: `supabase/functions/winloss-webhook-dispatcher/index.ts`

1. **Garantir que `requestId` existe** no escopo do handler (criar com `crypto.randomUUID()` no topo do `Deno.serve` se ainda não houver).
2. **Incluí-lo em TODAS as respostas JSON**:
   - Sucesso: `{ requestId, dispatched, results }`
   - Erro tratado (4xx/5xx no try/catch): `{ requestId, error: "..." }`
3. **Adicionar header HTTP `X-Request-Id: <requestId>`** em todas as responses (sucesso e erro) — facilita correlação mesmo sem parsear o body, e segue convenção HTTP comum.
4. **Logs já existentes** continuam emitindo o mesmo `requestId` — nenhuma mudança neles, garantindo a correlação 1:1 (resposta ↔ logs).

### Compatibilidade
- Adição **não-breaking**: clientes existentes que ignoram campos extras continuam funcionando.
- O frontend (`useWebhookSubscriptions`/`WebhookSubscriptionsPanel`) hoje não consome o retorno do dispatcher diretamente (a inserção é via `supabase.from(...).insert(...)`). Não há mudança de UI necessária neste card.

### Observabilidade
Após o deploy, o usuário poderá:
1. Capturar `requestId` do header `X-Request-Id` ou do body da resposta.
2. Buscar nos logs com `supabase--edge_function_logs` filtrando por esse ID — todos os logs de uma única invocação aparecem agrupados.

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/index.ts` (~5–10 linhas alteradas).

### Verificação
1. Deploy de `winloss-webhook-dispatcher`.
2. Chamada via `supabase--curl_edge_functions` confirma:
   - Header `X-Request-Id` presente.
   - Body contém `requestId` (UUID v4).
3. `supabase--edge_function_logs` com `search=<requestId>` retorna a sequência completa de logs daquela invocação.

