# T15 — Retry/reprocessamento de falhas no multichannel

## Causa raiz

- `process-scheduled-sends` grava `status='processing'` no claim, mas o CHECK do banco
  (`scheduled_sends_status_check` em `20260417173508`) so permite
  `pending/sent/failed/cancelled` -> 23514 check_violation em todo claim, quebrando o agendamento.
- Quando o envio falha, o item era marcado `failed` permanente, sem retry (promessa quebrada).

## Status: implementado na branch `claude/fix-multichannel-retry-20261113-0900`, PR aberta (regra 8 — DDL produção)

## Correção entregue

1. Migration `20261113100000_t15_multichannel_retry.sql`:
   - corrige o CHECK para incluir `processing`;
   - adiciona `attempts int NOT NULL DEFAULT 0` e `next_retry_at timestamptz`;
   - indice parcial p/ claim de vencidos (`status=failed AND next_retry_at <= now`).
2. `process-scheduled-sends/index.ts`:
   - claim atomico aceita `pending` e `failed` com `next_retry_at` vencido;
   - no catch, backoff exponencial (`_shared/retry-policy.ts`): incrementa `attempts`,
     agenda `next_retry_at`, esgota em `MAX_RETRIES` -> `failed` definitivo;
   - erros permanentes (opt-out, destinatario invalido, etc.) -> `failed` imediato.
3. `authz_test.ts`: testes de contrato do select/filtro/claim e uso do retry-policy.

## Validacao local

- `deno lint`: ok.
- `deno test --allow-read`: 3/3 ok.

## Pendencia pos-merge

- Aplicar a migration em producao (DDL, regra 8) e deplpoyar a edge function atualizada.

## Proximo item

- Apos merge, deploy das edge functions em producao (teto pago disponivel).
