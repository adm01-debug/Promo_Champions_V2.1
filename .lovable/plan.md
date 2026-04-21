

## Multi-seleção + replay em lote no `WebhookDeliveriesDrawer`

### O que será adicionado

1. **Checkbox por linha** de delivery falha (`succeeded === false`). Linhas com sucesso ficam sem checkbox (não são reenviáveis).
2. **Barra de seleção fixa no topo** do `ScrollArea` aparece quando há ≥1 selecionado:
   - Texto: `"N selecionado(s)"` + link `"Limpar"`.
   - Botão **"Reenviar selecionados"** (ícone `RotateCw`, com `Loader2` em loading).
   - Disabled enquanto `isReplaying` ou `selected.size === 0`.
3. **Checkbox "Selecionar todas as falhas"** no header da lista (à esquerda, mesma linha do contador). Marca/desmarca todas as `!succeeded`. Estado indeterminado quando alguns selecionados.
4. **Limite de 50** (espelha o `idArray.max(50)` do schema): se usuário tentar selecionar a 51ª, o checkbox fica disabled com tooltip `"Máx 50 por reenvio"`.
5. **Reset de seleção**:
   - Ao fechar/abrir o drawer.
   - Após `onSettled` do replay em lote (sucesso ou erro).
6. **Compatibilidade total** com replay individual existente — o botão `RotateCw` por linha continua funcionando exatamente como hoje.

### Mudanças

**`src/components/win-loss/WebhookDeliveriesDrawer.tsx`** (~+70 linhas):
- Novo state: `const [selected, setSelected] = useState<Set<string>>(new Set())`.
- Helpers: `toggleOne(id)`, `toggleAll(failedIds)`, `clearSelection()`.
- `useEffect` reseta `selected` quando `open` muda para `false`.
- Computa `failedIds = (data ?? []).filter(d => !d.succeeded).map(d => d.id)`.
- Render:
  - Header da lista ganha `<Checkbox checked={...} indeterminate={...} />` + label + contador.
  - Barra flutuante condicional (`selected.size > 0`) com botão `Reenviar selecionados`.
  - Cada `<li>` falha ganha `<Checkbox>` à esquerda do ícone de status.
  - Itens com sucesso renderizam um espaçador (`w-4`) no lugar do checkbox para manter alinhamento.
- Handler `handleReplaySelected()`:
  - Chama `replay(Array.from(selected), { onSettled: clearSelection })`.
  - Reaproveita o agregado de toast já presente em `useWebhookDeliveries`.

**`src/hooks/win-loss/useWebhookDeliveries.ts`**: nenhuma mudança. A `replay` mutation já aceita `string[]` de qualquer tamanho (até 50, validado server-side).

### Detalhes de UX

- Checkbox usa o componente `@/components/ui/checkbox` (já existe no projeto).
- Estado `indeterminate` aplicado via `data-state="indeterminate"` quando `0 < selected.size < failedIds.length`.
- Barra flutuante: `sticky top-0 z-10` com `bg-background/95 backdrop-blur` e borda inferior — não rola junto com a lista.
- A11y: `aria-label` em cada checkbox (`"Selecionar entrega de {event}"`), `aria-live="polite"` no contador.
- Tooltip de limite usa `TooltipProvider` já presente.

### Verificação
- Selecionar 3 falhas → barra aparece com "3 selecionado(s)" → clicar "Reenviar selecionados" → toast agregado de `useWebhookDeliveries` mostra "3 sucesso · 0 falha" (ou variantes).
- Selecionar todas (com mix de sucessos/falhas) → só falhas entram na seleção.
- Tentar marcar a 51ª falha → checkbox disabled + tooltip.
- Fechar e reabrir drawer → seleção zerada.

