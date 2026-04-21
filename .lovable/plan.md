

## Correlação consistente por `subscriptionId` em todos os logs

### Objetivo
Padronizar o campo `subscriptionId` (camelCase) em **todas** as etapas dos logs estruturados do `winloss-webhook-dispatcher`, e adicionar um log de "fan-out plan" individualizado **por subscription** no início do dispatcher, permitindo filtrar logs por `subscriptionId=<id>` e seguir o fluxo completo de uma assinatura específica do começo ao fim.

### Estado atual
Análise dos logs no edge function:

**`retry.ts`** (já consistente — 8/8 logs com `subscriptionId`):
- `subscription_dispatch_start`, `delivery_attempt`, `delivery_log_insert_failed`, `backoff_scheduled`, `update_subscription_failed`, `dead_letter_recorded`, `dead_letter_insert_failed`, `subscription_dispatch_complete`.

**`index.ts`** (parcial — gaps):
- ✅ `replay_subscription_missing`, `replay_subscription_inactive`: já têm.
- ❌ `invalid_payload`: sem (não há sub envolvida — OK).
- ❌ `fetch_subscriptions_failed`: sem (etapa pré-fan-out — OK).
- ❌ `dispatch_start` (linha 127): tem `target_ids` (array) mas **não emite uma linha por sub** — difícil filtrar.
- ❌ `dispatch_complete` (linha 162): mesmo problema — agrega tudo em `results`.
- ❌ `dispatcher_fatal` (linha 176): sem (erro genérico — OK).

### Mudanças

**Arquivo único**: `supabase/functions/winloss-webhook-dispatcher/index.ts`

1. **Após `dispatch_start` (broadcast plan), emitir 1 log por subscription**:
   ```ts
   for (const t of targets) {
     structuredLog("info", {
       msg: "subscription_planned",
       event,
       mode: replayOf ? "replay" : "broadcast",
       subscriptionId: t.id,
       url: t.url,
     }, requestId);
   }
   ```
   → Garante que mesmo antes da execução, cada `subscriptionId` tem uma entrada rastreável.

2. **Após `Promise.all(...dispatchOne)`, emitir 1 log de outcome por subscription**:
   ```ts
   for (const r of results) {
     structuredLog(r.succeeded ? "info" : "warn", {
       msg: "subscription_outcome",
       event,
       subscriptionId: r.id,
       succeeded: r.succeeded,
       final_status: r.status,
       attempts: r.attempts,
       total_latency_ms: r.total_latency_ms,
       error: r.error,
     }, requestId);
   }
   ```
   → Permite ao operador filtrar logs por `subscriptionId=<id>` e ver: planned → start → attempts (1..3) → backoff → outcome → complete, em ordem cronológica.

3. **Manter o `dispatch_complete` agregado** (visão geral da invocação) — não substituir.

4. **Garantir camelCase consistente**: o resto já usa `subscriptionId` (não `subscription_id`); confirmado em todas as chamadas. Nenhum rename necessário.

### Como rastrear o fluxo (após o deploy)
1. Capturar `X-Request-Id` ou `requestId` da resposta HTTP.
2. Filtrar logs com `requestId=<id>` AND `subscriptionId=<id>` → sequência completa de uma assinatura.
3. Ou apenas `subscriptionId=<id>` → histórico da subscription através de múltiplas invocações.

### Notas técnicas
- Sem mudanças em `retry.ts` (já está correto).
- Sem mudança em tabelas, RLS ou frontend.
- 2 novos `msg`: `subscription_planned`, `subscription_outcome`.
- Volume: + (2 × N targets) linhas por invocação. Aceitável (N tipicamente < 10).

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/index.ts` (~12 linhas adicionadas).

### Verificação
1. Deploy de `winloss-webhook-dispatcher`.
2. `supabase--curl_edge_functions` dispara um evento.
3. `supabase--edge_function_logs` com `search=<subscriptionId>` retorna a sequência completa: `subscription_planned` → `subscription_dispatch_start` → `delivery_attempt`×N → `backoff_scheduled`×(N−1) → `subscription_dispatch_complete` → `subscription_outcome`.

