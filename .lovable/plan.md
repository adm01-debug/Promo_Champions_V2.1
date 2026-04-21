## Validação client-side de delivery IDs antes do replay

### Estado atual
- O `useWebhookDeliveries.replay` envia `delivery_ids` direto para o edge function.
- Validação UUID + max 50 só roda **server-side** (`schema.ts`). Erro volta como toast genérico tardio.
- Limite de 50 já é parcialmente respeitado pelos checkboxes, mas reenvio individual e chamadas programáticas não validam.

### O que será adicionado

1. **Helper compartilhado** `src/hooks/win-loss/validateReplayIds.ts`:
   - `MAX_REPLAY_IDS = 50`, regex UUID v4-ish.
   - `validateReplayIds(ids)` retorna `{ ok: true; ids }` (deduplicado) ou `{ ok: false; message }` com mensagem pronta para toast:
     - vazio → "Selecione ao menos 1 entrega para reenviar."
     - >50 → "Máximo de 50 por reenvio (selecionado: N)."
     - UUID ruim → "IDs inválidos detectados: a1b2c3d4…"

2. **`useWebhookDeliveries`**: `mutationFn` chama o helper antes do `invoke`. Se inválido, `throw new Error(message)` → toast via `onError` existente. Protege qualquer consumidor futuro.

3. **`WebhookDeliveriesDrawer`**: no `requestReplay(ids)`, valida ANTES de abrir o `AlertDialog`. Se inválido, `toast.error(message)` e **não** abre o modal. Importa `MAX_REPLAY_IDS` do helper (remove `MAX_REPLAY` duplicado).

### Mudanças
- **Criar**: `src/hooks/win-loss/validateReplayIds.ts` (~30 linhas).
- **Modificar**: `src/hooks/win-loss/useWebhookDeliveries.ts`.
- **Modificar**: `src/components/win-loss/WebhookDeliveriesDrawer.tsx`.
- Sem alteração no edge function.

### Verificação
1. 0 IDs → toast "Selecione ao menos 1…", modal não abre.
2. 51 IDs (forçado) → toast "Máximo de 50 (selecionado: 51)", modal não abre.
3. UUID malformado → toast "IDs inválidos detectados: …".
4. Fluxo normal 1–50 UUIDs → modal abre, replay funciona.
