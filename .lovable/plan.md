

## Validação client-side de delivery IDs antes do replay

### Estado atual
- `useWebhookDeliveries.replay` envia `delivery_ids` direto para o edge function.
- Validação UUID + max 50 só roda **server-side** (`schema.ts`). Erro volta como toast genérico tardio.
- Limite de 50 já é parcialmente respeitado pelos checkboxes, mas reenvio individual e chamadas programáticas não validam.

### O que será adicionado

1. **Helper compartilhado** `src/hooks/win-loss/validateReplayIds.ts`:
   - Exporta `MAX_REPLAY_IDS = 50` e regex UUID.
   - `validateReplayIds(ids: string[])` retorna `{ ok: true; ids }` (deduplicado) ou `{ ok: false; message }` com mensagem pronta para toast:
     - vazio → `"Selecione ao menos 1 entrega para reenviar."`
     - count > 50 → `"Máximo de 50 por reenvio (selecionado: N)."`
     - UUID malformado → `"IDs inválidos detectados: a1b2c3d4…"` (até 3 amostras truncadas).

2. **`useWebhookDeliveries`** (defesa em profundidade): `mutationFn` chama o helper antes do `supabase.functions.invoke`. Se inválido, `throw new Error(message)` → cai no `onError` já existente e mostra toast vermelho. Protege qualquer consumidor futuro do hook.

3. **`WebhookDeliveriesDrawer`** (UX imediata): no `requestReplay(ids)`, valida **antes** de abrir o `AlertDialog`. Se inválido, dispara `toast.error(message)` e **não** abre o modal de confirmação (evita confirmar algo que vai falhar). Importa `MAX_REPLAY_IDS` do helper e remove a constante local `MAX_REPLAY` duplicada.

### Mudanças
- **Criar**: `src/hooks/win-loss/validateReplayIds.ts` (~30 linhas).
- **Modificar**: `src/hooks/win-loss/useWebhookDeliveries.ts` — gate no início do `mutationFn`.
- **Modificar**: `src/components/win-loss/WebhookDeliveriesDrawer.tsx` — gate no `requestReplay`, troca de constante.
- Sem alteração no edge function (validação server permanece como verdade última).

### Verificação
1. Reenviar com 0 IDs (programaticamente) → toast `"Selecione ao menos 1…"`, modal não abre.
2. Forçar 51 IDs → toast `"Máximo de 50 (selecionado: 51)"`, modal não abre.
3. Passar UUID malformado → toast `"IDs inválidos detectados: …"`, modal não abre.
4. Fluxo normal (1–50 UUIDs válidos) → modal de confirmação abre como hoje e o replay roda.

