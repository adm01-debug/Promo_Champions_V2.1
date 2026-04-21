

## Painel admin de Dead-Letters de Webhooks

### Objetivo
Dar aos admins acesso direto, fora do módulo Win/Loss, a uma página de gestão de dead-letters com filtros por status, assinatura e evento, e reprocessamento em lote.

### O que já existe (reutilizar)
- Hook `useWebhookDeadLetters(status)` com `list`, `replay(ids)`, `archive(ids)`.
- Componente `WebhookDeadLetterPanel` com tabs pending/replayed/archived, seleção em massa, replay/arquivar e drawer de payload.
- Edge function `winloss-webhook-replay` já em produção.

### O que será adicionado

**1. Nova página `/admin/webhooks-dead-letters`** (`src/pages/admin/WebhooksDeadLettersAdmin.tsx`)
- Protegida por `ProtectedRoute requireAdminOrManager` + checagem `isAdmin` (apenas admin pode reprocessar).
- Header com título, descrição, contadores por status (pending/replayed/archived) e botão "Atualizar".
- Filtros adicionais acima da lista:
  - Busca por texto (event, URL da subscription, request_id, mensagem de erro).
  - Select de subscription (lista subscriptions ativas via `useWebhookSubscriptions`).
  - Select de evento (derivado das opções distintas presentes).
  - Faixa de data (últimos 24h / 7d / 30d / tudo).
- Renderiza `WebhookDeadLetterPanel` (refatorado para aceitar props de filtro) ocupando largura total.
- Helmet com title/description SEO.
- `PageTransition` (consistente com `AdminDashboard`).

**2. Refatoração leve de `WebhookDeadLetterPanel`**
- Aceita props opcionais: `filterText?`, `filterSubscriptionId?`, `filterEvent?`, `dateRange?`, `fullWidth?`.
- Sem props, mantém comportamento atual (continua funcionando dentro de `WinLossIntelligence`).
- Aplica filtros client-side sobre `items` antes de renderizar.
- Quando `fullWidth=true`, usa `max-h` maior (`70vh`) e mostra colunas extras na lista (created_at absoluto, request_id curto).

**3. Hook auxiliar `useDeadLettersCounts`** (`src/hooks/win-loss/useDeadLettersCounts.ts`)
- Faz uma única query agregando `count` por status (`pending`, `replayed`, `archived`) para alimentar os badges do header.
- `staleTime: 30s`.

**4. Atualizações de navegação**
- `src/routes/AppRoutes.tsx`: adicionar rota `/admin/webhooks-dead-letters` (lazy import).
- `src/components/admin/AdminQuickLinks.tsx`: novo card "Dead-Letters de Webhooks" com ícone `AlertTriangle`, descrição curta e contador de pending (usando `useDeadLettersCounts`).
- Opcional (mesma sessão): link no menu lateral admin se houver agrupamento dedicado — pular se não existir.

### Fluxo de reprocessamento em lote (já funciona, apenas exposto)
1. Admin filtra por subscription/evento/data.
2. Marca itens (ou "Selecionar todos" — opera sobre o subset filtrado).
3. Clica "Reprocessar" → `replay(ids)` chama `winloss-webhook-replay` → toast com sucessos/falhas → invalida cache.
4. Itens bem-sucedidos saem de `pending` e aparecem em `replayed`.

### Segurança
- Nenhuma mudança de RLS necessária — `winloss_webhook_dead_letters` já tem policy admin-only para SELECT, e `winloss-webhook-replay` valida role no servidor.
- Rota protegida no client + checagem `isAdmin` dentro do componente (defesa em profundidade).

### Arquivos
- **Criar**: `src/pages/admin/WebhooksDeadLettersAdmin.tsx`
- **Criar**: `src/hooks/win-loss/useDeadLettersCounts.ts`
- **Modificar**: `src/components/win-loss/WebhookDeadLetterPanel.tsx` (props opcionais de filtro, sem quebrar uso atual)
- **Modificar**: `src/routes/AppRoutes.tsx` (nova rota)
- **Modificar**: `src/components/admin/AdminQuickLinks.tsx` (novo card)

### Verificação
1. `/admin` → card "Dead-Letters de Webhooks" exibe contagem de pendentes.
2. Clique abre `/admin/webhooks-dead-letters` com filtros funcionais.
3. Filtrar por subscription + selecionar todos + Reprocessar dispara `winloss-webhook-replay`; toast mostra resultado.
4. Tabs pending/replayed/archived navegam corretamente; contadores no header atualizam após replay/arquivar.
5. Acesso negado para usuário não-admin (rota protegida + componente retorna `null`).

