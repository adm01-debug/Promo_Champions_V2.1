

## Simulação e validação do `winloss-webhook-dispatcher`

Objetivo: confirmar que a edge function dispara POST para webhooks ativos com retries (até 3 tentativas, backoff linear de 500ms × tentativa), atualiza `last_dispatch_at` / `last_status` e gera logs úteis para troubleshooting.

---

### Estado atual (verificado no código)

`supabase/functions/winloss-webhook-dispatcher/index.ts`:
- Aceita `POST { event, ...payload }`.
- Busca `winloss_webhook_subscriptions` com `active=true` e filtra por `events.includes(event)`.
- Loop `while (attempts < 3)`: tenta `fetch`, sai se `2xx`, espera `500 * attempts` ms entre tentativas.
- Atualiza `last_dispatch_at` e `last_status` na tabela.
- `console.error` em falha de tentativa e em erro geral.

Lacunas identificadas:
1. Não há tabela de **delivery logs** — só o último status fica salvo, dificultando auditoria histórica.
2. Backoff é linear (500/1000/1500ms); padrão melhor seria exponencial com jitter.
3. Logs não incluem `subscription_id` nem número da tentativa de forma estruturada.

---

### Plano de execução

#### 1. Cenários de simulação (via `supabase--curl_edge_functions`)
Criar 3 inscrições temporárias via SQL e disparar a função para cada cenário:

| Cenário | URL alvo | Resultado esperado |
|---|---|---|
| A — Sucesso 200 | `https://httpbin.org/status/200` | 1 tentativa, `last_status=200` |
| B — Falha permanente 500 | `https://httpbin.org/status/500` | 3 tentativas, `last_status=500`, ~1.5s total |
| C — Timeout/DNS inválido | `https://invalid-domain-xyz-test.local` | 3 tentativas com `console.error`, `last_status=0` |
| D — Evento não inscrito | qualquer | 0 dispatches (`targets` vazio) |

Para cada um:
- `supabase--curl_edge_functions` POST `/winloss-webhook-dispatcher` com `{event:"critical_pattern", deal_id:"sim-1", severity:"high"}`.
- `supabase--read_query` em `winloss_webhook_subscriptions` para conferir `last_dispatch_at`/`last_status`.
- `supabase--edge_function_logs` para `winloss-webhook-dispatcher` filtrando pelo cenário.

#### 2. Melhorias na edge function (após simulação)
- **Tabela `winloss_webhook_deliveries`** (migration): `id`, `subscription_id`, `event`, `payload jsonb`, `attempt`, `status`, `error_message`, `duration_ms`, `created_at`. RLS: leitura só admin.
- **Backoff exponencial com jitter**: `Math.min(8000, 2 ** attempt * 250) + Math.random()*250`.
- **Logs estruturados**: `console.log(JSON.stringify({ fn, sub_id, event, attempt, status, duration_ms }))`.
- **Insert de delivery** após cada tentativa (sucesso ou falha) para histórico completo.
- **AbortSignal.timeout(8000)** por tentativa para evitar travamento em endpoints lentos.

#### 3. Painel de troubleshooting
Adicionar em `WebhookSubscriptionsPanel.tsx` um botão "Ver entregas" por webhook → drawer com últimas 20 entregas (`useWebhookDeliveries` hook) mostrando attempt, status, duração, erro.

#### 4. Validação final
- Re-executar cenários A/B/C, conferir registros em `winloss_webhook_deliveries`.
- `tsc --noEmit`, atualizar `mem://features/win-loss-intelligence-module` com nota de observabilidade de webhooks.

### Detalhes técnicos
- Sem novos secrets, sem novas dependências.
- Migration única: 1 tabela + RLS (`has_role(auth.uid(),'admin')` para SELECT, service_role para INSERT).
- Cleanup pós-simulação: `DELETE FROM winloss_webhook_subscriptions WHERE url LIKE 'https://httpbin.org/%' OR url LIKE '%invalid-domain-xyz-test%'`.

### Ordem (sequencial, sem pausas)
1. Migration `winloss_webhook_deliveries` + RLS.
2. Refactor `winloss-webhook-dispatcher` (backoff exp+jitter, timeout, logs estruturados, insert delivery).
3. Deploy + simulação dos 4 cenários via curl.
4. Verificação SQL + leitura de logs.
5. Hook `useWebhookDeliveries` + drawer de entregas no painel admin.
6. Cleanup de inscrições simuladas + `tsc --noEmit` + atualização de memória + relatório.

