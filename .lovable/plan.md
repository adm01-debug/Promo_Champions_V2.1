

## Diagnóstico completo: `error.name`, `error.message` e `error.stack` em todos os logs

### Objetivo
Padronizar a captura de erros em **todos** os pontos de `catch` do `winloss-webhook-dispatcher` para registrar nos logs estruturados:
- `error_name` — `Error.name` (ex: `AbortError`, `TimeoutError`, `TypeError`).
- `error` — `Error.message` puro.
- `error_stack` — `Error.stack` truncado a 4000 chars.

Diagnóstico da causa real (`AbortError` vs `TypeError` vs `PostgrestError`) com stack para localizar a origem, sem reproduzir localmente.

### Estado atual
6 pontos de catch hoje:

| Local | Linha | Hoje | Falta |
|---|---|---|---|
| `retry.ts` `delivery_attempt` (fetch) | 128-137 | `error_name`, `error: "Name: msg"` | `error_stack` |
| `retry.ts` `delivery_log_insert_failed` | 170-177 | `error: msg` | `error_name`, `error_stack` |
| `retry.ts` `update_subscription_failed` | 197-204 | `error: msg` | `error_name`, `error_stack` |
| `retry.ts` `dead_letter_insert_failed` | 227-234 | `error: msg` | `error_name`, `error_stack` |
| `index.ts` `dispatcher_fatal` | 200-204 | `error: "Name: msg"` | `error_name`, `error_stack` |

### Mudanças

**1. Helper compartilhado** — exportar de `retry.ts`:
```ts
export function describeError(e: unknown): { error_name: string; error: string; error_stack: string | null } {
  if (e instanceof Error) {
    return {
      error_name: e.name || "Error",
      error: e.message || String(e),
      error_stack: e.stack ? e.stack.slice(0, 4000) : null,
    };
  }
  return { error_name: "UnknownError", error: String(e), error_stack: null };
}
```

**2. Refatorar os 5 catches em `retry.ts`** para emitir `...describeError(e)` no log:
- `delivery_attempt`: manter `errorName`/`errorMessage` para a `DeliveryRow`/`lastError` (contrato persistido inalterado), mas o log ganha `error_stack`.
- 4 catches "best-effort" (`*_failed`): trocar `{ error: msg }` por `{ ...describeError(e) }`.

**3. Refatorar o catch em `index.ts`** (`dispatcher_fatal`):
- Log: `structuredLog("error", { msg: "dispatcher_fatal", ...describeError(e), latency_ms })`.
- Resposta HTTP permanece enxuta (`{ error: e.message, requestId }`) — **não vazar stack para o cliente**.

### Notas técnicas
- **Sem mudanças em tabelas/RLS/frontend**.
- **Formato persistido em `winloss_webhook_deliveries.error_message` preservado** (compatibilidade com UI e testes).
- **Truncamento**: 4000 chars (suficiente para stacks Deno típicas <2 KB).
- **Stack só nos logs server-side**, nunca no body HTTP de resposta.

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry.ts` (+10 linhas helper, ~15 refatoradas).
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/index.ts` (1 import, 2 linhas).

### Verificação
1. `supabase--test_edge_functions` — os 43 testes existentes devem continuar passando.
2. Deploy de `winloss-webhook-dispatcher`.
3. Forçar uma falha (URL inválida) e confirmar nos logs `error_name`, `error` e `error_stack` em todas as etapas relevantes.

