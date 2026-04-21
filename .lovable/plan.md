

## Endpoint para reprocessar eventos a partir do histórico de falhas

### Status atual
Já existe `winloss-webhook-replay` que reprocessa a partir da DLQ (`winloss_webhook_dead_letters`). **Falta** suportar reprocessamento a partir de qualquer entrega falha registrada em `winloss_webhook_deliveries` — útil para casos onde a falha não chegou a 3 tentativas (ex.: você corrigiu o endpoint e quer reenviar mesmo um 500 isolado) ou quando você quer reenviar uma tentativa específica do log bruto.

### O que será adicionado

**1. Extensão do endpoint `winloss-webhook-replay`** (mesma função, novo modo)

Aceita 2 fontes mutuamente exclusivas no body:
```json
// modo DLQ (já existe)
{ "dead_letter_ids": ["uuid", ...] }

// modo histórico (novo)
{ "delivery_ids": ["uuid", ...] }
```
- Validações: 1–50 UUIDs, admin obrigatório (já em vigor), exatamente uma das duas chaves.
- Modo `delivery_ids`:
  - Lê `winloss_webhook_deliveries` (id, subscription_id, event, payload, succeeded).
  - Bloqueia entregas com `succeeded=true` (retorna `{succeeded:false, error:"already_succeeded"}` para esse id).
  - Invoca `winloss-webhook-dispatcher` com `{ ...payload, event, __target_subscription_id }` (sem `__replay_of` — não há linha DLQ para atualizar).
  - Resultado é só do dispatcher; nenhuma persistência adicional além do log natural de delivery (uma nova linha em `winloss_webhook_deliveries` será criada pelo próprio dispatcher).
- Logs estruturados ganham `source: "dlq" | "delivery"` para troubleshooting.
- Resposta inclui `requestId` + `source` + `results[]` com `{ id, succeeded, status, error }`.

**2. Hook React `useWebhookDeliveries`** ganha mutation `replay`
- `replay({ deliveryIds })` chama o endpoint com `delivery_ids`.
- Toast com sucesso/falha agregado, invalida cache de `winloss-webhook-deliveries`.

**3. UI no `WebhookDeliveriesDrawer`**
- Linhas de delivery com `succeeded=false` ganham botão **Reenviar** (ícone `RotateCw`).
- Botão dispara `replay` e mostra resultado inline (badge verde/vermelha temporária).
- Se a entrega foi bem sucedida, botão fica desabilitado com tooltip "Já entregue com sucesso".

### Detalhes técnicos
- Reuso total do `dispatcher` — sem duplicação de retry/backoff/fan-out.
- `__target_subscription_id` garante que só a subscription original recebe (não vira broadcast).
- Sem novas tabelas, sem migration. RLS de `winloss_webhook_deliveries` já permite admin SELECT; a função usa service role.
- Edge function continua com role check explícito (`has_role(uid, 'admin')`) — defesa em profundidade.
- Não duplica linha DLQ: replay de delivery só atinge DLQ se as 3 novas tentativas falharem (caminho normal do dispatcher).

### Ordem
1. Estender `winloss-webhook-replay/index.ts` (modo `delivery_ids` + validação mutuamente exclusiva).
2. Adicionar mutation `replay` em `useWebhookDeliveries.ts`.
3. Atualizar `WebhookDeliveriesDrawer.tsx` com botão reenviar por linha falha.
4. Atualizar `mem://features/winloss-webhook-observability` registrando o novo modo.

