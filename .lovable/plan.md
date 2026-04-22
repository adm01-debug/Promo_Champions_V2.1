

## Página de Detalhe do Pedido `/meus-pedidos/:id`

Criar a página de detalhe de um pedido individual, com timeline das etapas, itens e resumo financeiro. **Pré-requisito**: depende das tabelas `orders`, `order_items`, `order_status_events` (planejadas anteriormente). Esta etapa cria a migração caso ainda não exista e a página de detalhe.

### Escopo funcional

1. **Rota `/meus-pedidos/:id`** (lazy-loaded em `AppRoutes.tsx`, protegida por auth).
2. **Header do pedido**: número do pedido, data de criação, badge de status atual (semantic tokens), botão "Voltar para Meus Pedidos".
3. **Timeline vertical** (`OrderStatusTimeline`):
   - 5 etapas fixas: Criado → Confirmado → Em preparação → Enviado → Entregue.
   - Etapas concluídas: ícone preenchido + linha conectora em `success`; etapa atual: pulse animado em `primary`; futuras: muted.
   - Cada etapa concluída exibe data/hora real vinda de `order_status_events`.
   - Caso `cancelled`: exibe etapa final em `destructive` com motivo.
4. **Card "Itens do pedido"**: tabela/lista com produto, quantidade, preço unitário e subtotal por linha.
5. **Card "Resumo financeiro"**: subtotal, frete, total (formatado em BRL).
6. **Loading**: Skeletons. **Empty/Erro**: pedido não encontrado → mensagem + link para listagem. **404** se o pedido não pertencer ao usuário (RLS bloqueia naturalmente).

### Backend (caso ainda não exista)

Migração idempotente:

- **`orders`**, **`order_items`**, **`order_status_events`** com RLS (`auth.uid() = user_id`, admin via `has_role`).
- Trigger `AFTER UPDATE OF status ON orders` insere registro em `order_status_events`.
- Seed de 2-3 pedidos mock para o usuário atual (apenas se nenhum existir).

### Detalhes técnicos

**Arquivos novos**:
- `src/pages/OrderDetailPage.tsx` (≤200 linhas) — orquestra hook + componentes.
- `src/components/orders/OrderStatusTimeline.tsx` — timeline com Framer Motion (stagger).
- `src/components/orders/OrderItemsCard.tsx`.
- `src/components/orders/OrderSummaryCard.tsx`.
- `src/components/orders/orderHelpers.ts` — `STATUS_STEPS`, `statusLabel`, `statusTone`, `formatBRL`.
- `src/hooks/orders/useOrder.ts` — React Query: busca `orders` + `order_items` + `order_status_events` por id.

**Arquivos editados**:
- `src/routes/AppRoutes.tsx` — rota lazy `/meus-pedidos/:id` dentro do bloco autenticado.

**Padrões aplicados**: React Query, Framer Motion (timeline com stagger), Skeleton loading, Helmet (SEO), semantic tokens (`success`/`primary`/`destructive`/`muted`), Sora em títulos / Inter em corpo, formato BRL via `Intl.NumberFormat('pt-BR')`. Sem hardcoded colors.

### Diagrama da página

```text
┌─────────────────────────────────────────────┐
│ ← Voltar     Pedido #1024     [Em preparação]│
├──────────────────────────┬──────────────────┤
│  Timeline                │  Itens do pedido │
│  ● Criado     12/04 09:00│  • Caneca x2  R$ │
│  ● Confirmado 12/04 09:05│  • Camisa x1  R$ │
│  ◉ Preparação 12/04 10:30│  ...             │
│  ○ Enviado    —          ├──────────────────┤
│  ○ Entregue   —          │  Resumo          │
│                          │  Subtotal  R$ X  │
│                          │  Frete     R$ Y  │
│                          │  Total     R$ Z  │
└──────────────────────────┴──────────────────┘
```

