

## Logs estruturados ricos no `winloss-webhook-dispatcher`

### Objetivo
Tornar o troubleshooting trivial: cada linha de log é JSON com os campos solicitados (`event`, `subscriptionId`, `attempt`, `status`, `latency_ms`) mais correlação por `requestId`, classificação de falha e métricas agregadas.

### Mudanças

#### 1. `supabase/functions/winloss-webhook-dispatcher/retry.ts`
Enriquecer todos os `log?.()` para padronizar nomes de campos e adicionar contexto:

| Evento (`msg`) | Quando | Campos chave |
|---|---|---|
| `subscription_dispatch_start` | início do dispatch para 1 subscription | `event`, `subscriptionId`, `url`, `max_attempts`, `timeout_ms` |
| `delivery_attempt` | após cada fetch | `event`, `subscriptionId`, `url`, `attempt`, `max_attempts`, `status`, `latency_ms`, `outcome` (`success`/`http_error`/`network_error`), `error_name`, `error` |
| `backoff_scheduled` | antes de dormir | `event`, `subscriptionId`, `attempt`, `next_attempt`, `wait_ms` |
| `delivery_log_insert_failed` | falha em persistir delivery row | `event`, `subscriptionId`, `attempt`, `error` |
| `update_subscription_failed` | falha no UPDATE final | `event`, `subscriptionId`, `error` |
| `subscription_dispatch_complete` | fim por subscription | `event`, `subscriptionId`, `succeeded`, `final_status`, `attempts`, `total_latency_ms`, `error` |

Também: capturar `error.name` separadamente (`TimeoutError`, `TypeError`, etc.) para facilitar filtros, e expor `total_latency_ms` no `DispatchResult`.

#### 2. `supabase/functions/winloss-webhook-dispatcher/index.ts`
- Gerar um `requestId = crypto.randomUUID()` por invocação e propagá-lo em todos os logs (correlação ponta-a-ponta entre payload recebido → N subscriptions → N tentativas).
- Novos eventos de nível request:
  - `invalid_payload` (warn) com `reason`.
  - `fetch_subscriptions_failed` (error) com `event` + `error`.
  - `dispatch_start` (info) com `event`, `candidates`, `targets`, `target_ids`.
  - `dispatch_complete` (info ou warn se houve falhas) com `dispatched`, `succeeded`, `failed`, `total_latency_ms`, `results`.
  - `dispatcher_fatal` (error) com `error.name + message` e `latency_ms`.
- Resposta HTTP passa a incluir `requestId`, `succeeded`, `failed` para que o cliente consiga referenciar o id no troubleshooting.

#### 3. Validação
- Reaproveitar os 14 testes existentes em `retry_test.ts`. O contrato de logging usa `log?.()` injetado — só ajustar 1 teste se ficar dependente de campo renomeado (sleeps/contagens não mudam).
- Rodar `supabase--test_edge_functions` para garantir que tudo segue verde.
- Atualizar `mem://features/winloss-webhook-observability` listando os novos eventos e o `requestId` de correlação.

### Como diagnosticar no Supabase logs (exemplo)
```
SELECT event_message
FROM function_logs
WHERE event_message LIKE '%"requestId":"<id>"%'
ORDER BY timestamp;
```
Filtra a invocação inteira, do recebimento até cada tentativa de cada subscription.

### Detalhes técnicos
- Sem migrations, sem novas dependências, sem mudança de comportamento de retry/backoff.
- `DispatchResult` ganha `total_latency_ms` (campo novo, não-breaking — UI atual ignora).
- Logs continuam em JSON single-line (compatível com qualquer log shipper).

### Ordem
1. Atualizar `retry.ts` (campos de log + `total_latency_ms` + classificação `outcome`/`error_name`).
2. Atualizar `index.ts` (requestId, eventos request-level, resposta enriquecida).
3. Rodar `supabase--test_edge_functions` (corrigir teste se quebrar).
4. Atualizar memória.

