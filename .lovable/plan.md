

## Modal de confirmação antes de reenviar

### O que será adicionado
Um `AlertDialog` (já usado no projeto) que intercepta tanto o reenvio individual quanto o em lote. Mostra resumo da operação e exige confirmação explícita.

### Comportamento

1. **Reenvio individual** (botão `RotateCw` por linha):
   - Em vez de disparar `replay([id])`, abre o modal com:
     - Título: `"Confirmar reenvio"`.
     - Resumo: `"1 entrega será reenviada."` + chip mostrando o evento (ex: `quote.created`) e os primeiros 8 chars do ID.
2. **Reenvio em lote** (`"Reenviar selecionados"`):
   - Abre o modal com:
     - Título: `"Confirmar reenvio em lote"`.
     - Resumo: `"N entregas serão reenviadas."` (com `N` em destaque).
     - Detalhe: agrupamento por evento — ex: `quote.created · 3`, `quote.updated · 2`. Renderiza como badges.
     - Aviso suave em `text-muted-foreground`: `"Cada entrega criará uma nova tentativa no histórico."`.
3. **Botões do modal**:
   - **Cancelar** (`AlertDialogCancel`) — fecha sem ação.
   - **Reenviar N** (`AlertDialogAction`, variante destrutiva neutra) — dispara `replay(...)` e mantém toda a lógica atual de `processingIds` / `lastResults` / inline progress / toast agregado.
4. **A11y**: `AlertDialog` já é modal nativo, com foco gerenciado e `aria-describedby` automático.

### Mudanças

**`src/components/win-loss/WebhookDeliveriesDrawer.tsx`** (~+50 linhas):
- Importa `AlertDialog*` de `@/components/ui/alert-dialog`.
- Novo state `confirm: { ids: string[] } | null` substitui a chamada direta a `replay`.
- `handleReplay(id)` e `handleReplaySelected()` apenas setam `confirm = { ids: [...] }`.
- Novo `handleConfirm()` executa a lógica que hoje vive nos handlers (popular `processingIds`, chamar `replay`, limpar seleção se for lote).
- Render do `<AlertDialog open={!!confirm}>` no fim do componente, dentro do `<Drawer>` (após `</TooltipProvider>` e antes de `</DrawerContent>`).
- Helper `summarizeByEvent(ids)` que mapeia IDs → contagem por `event` consultando `data`.

**Sem mudanças** em `useWebhookDeliveries`, edge function ou demais arquivos.

### Verificação
1. Clicar `RotateCw` em uma linha → modal abre com `"1 entrega"` e o evento → confirmar dispara o reenvio com toda UX inline existente.
2. Selecionar 5 falhas → "Reenviar selecionados" → modal mostra `"5 entregas"` + breakdown por evento → confirmar dispara replay em lote.
3. Cancelar não dispara `replay` nem afeta `processingIds`.
4. Fechar drawer com modal aberto → ambos fecham; nenhuma chamada vazada.

