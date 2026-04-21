

## Indicador inline de progresso por delivery durante replay

### Estado atual
- Replay individual: linha mostra `Loader2` no botão (via `pendingId === d.id`).
- Replay em lote: enquanto roda, **nenhum** indicador inline aparece nas linhas selecionadas — só o botão "Reenviar selecionados" mostra spinner. Não dá para distinguir quais entregas estão no lote.

### O que será adicionado

1. **Novo state** em `WebhookDeliveriesDrawer`:
   - `processingIds: Set<string>` — IDs do lote em execução.
   - `lastResults: Map<string, "ok" | "skipped" | "fail">` — resultado transitório por ID (4s).
2. **Marcar `processingIds`**:
   - Individual: ao clicar `RotateCw`, `new Set([id])`.
   - Lote: ao clicar "Reenviar selecionados", snapshot `new Set(selected)` antes de limpar a seleção.
   - Limpa em `onSettled` de cada chamada `replay(...)`.
3. **Capturar resultado por ID** via `onSuccess` (segundo arg de `replay(ids, { onSuccess, onSettled })`):
   - Para cada `r` em `data.results`: `"skipped"` se `r.skipped`, senão `"ok"`/`"fail"` por `r.succeeded`.
   - `setTimeout` 4s remove cada entrada; refs de timers limpos no unmount.
4. **Componente local `<DeliveryReplayStatus />`** (~30 linhas no mesmo arquivo), renderizado dentro da `<li>` quando `processingIds.has(id) || lastResults.has(id)`:
   - **Reenviando**: `Loader2` 3×3 + `"Reenviando…"` em `text-primary` + barra inferior `h-[2px]` com gradient animado (`animate-pulse`).
   - **Sucesso**: `CheckCircle2` verde + `"Reenviado"`.
   - **Falha**: `XCircle` destrutivo + `"Falhou"` (+ msg truncada se houver).
   - **Skipped**: badge muted + `"Já entregue"`.
5. **Destaque visual da linha** em processamento: `bg-primary/5` sutil.
6. **A11y**: container do status com `aria-live="polite"`, `role="status"` no spinner.

### Por que não mostrar progresso percentual real
O endpoint `winloss-webhook-replay` responde tudo de uma vez (não é streaming). Qualquer "3/7" seria UX falsa. O indicador binário "em andamento → resultado" por linha é honesto e cobre o pedido.

### Mudanças
- **Modificar**: `src/components/win-loss/WebhookDeliveriesDrawer.tsx` (~+60 linhas).
- Sem mudança em `useWebhookDeliveries.ts` nem no edge function.

### Verificação
1. Selecionar 3 falhas → "Reenviar selecionados" → as 3 linhas mostram simultaneamente "Reenviando…" + barra animada.
2. Resultado chega → cada uma mostra ✓ / ✗ / "Já entregue" por 4s, depois some.
3. Reenvio individual: mesma UX em 1 linha.
4. Cleanup: nenhum timer vazado ao fechar drawer.

