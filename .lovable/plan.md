
Usuário quer notificar todos os vendedores quando um colega fecha uma venda, mostrando o valor.

## Análise do que já existe

Pelo código fornecido (`src/hooks/useSalesRealtime.ts` + `salesRealtimeUtils.ts`):
- Já há **toast** (`🔥 ${salesperson.name} fechou uma venda!` com valor formatado) para todos os usuários conectados via realtime.
- Já há **Web Notification** do navegador (apenas se `currentSalespersonId !== newSale.salesperson_id`).
- Já há filtro `shouldReceiveNotification` por papel (SDR/Closer/Hybrid).
- Já existe edge function `send-push-notification` (web push para dispositivos offline).
- Já existe sistema interno de notificações (`useNotifications` + RPC `send_notification` + tabela `notifications`).

## Gap

A notificação atual depende do usuário estar **online** (realtime). Quem estiver offline, em outra aba, ou no mobile sem o app aberto **não recebe nada**. Além disso, não fica registro persistente no sino de notificações in-app.

## Proposta — "Sale Broadcast"

Quando uma venda `completed` é inserida, disparar para **todos os vendedores ativos exceto o vendedor da venda**:

1. **Notificação persistente in-app** (tabela `notifications`, aparece no sino) — categoria `sales`, com nome do colega + valor formatado em BRL.
2. **Web Push** (via `send-push-notification`) — para quem tem subscription registrada e está offline.
3. **Manter** o toast/realtime atual para quem está online (zero mudança visual para usuários ativos).

## Implementação

### 1. Edge function `broadcast-sale-notification` (verify_jwt = false; chamada por trigger)
- Input: `{ sale_id, salesperson_id, salesperson_name, client_name, amount }`.
- Busca todos `salespeople` ativos com `user_id` definido, exceto o vendedor da venda.
- Para cada destinatário:
  - Chama RPC `send_notification` (categoria `sales`, prioridade `medium`, título `🔥 {nome} fechou uma venda!`, mensagem `{cliente} — {valor BRL}`, `action_url=/vendas`, metadata `{ sale_id, amount, seller_id }`).
- Coleta `user_ids` e chama `send-push-notification` em batch (chunks de 100).
- Retorna `{ notified: N, pushed: M }`.

### 2. Database trigger `trg_broadcast_sale_completed` em `sales`
- AFTER INSERT OR UPDATE OF status — quando `NEW.status = 'completed'` e (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed').
- Faz `pg_net.http_post` para `broadcast-sale-notification` com payload incluindo nome do vendedor (JOIN com `salespeople`).
- Garantia de não duplicar: usar `pg_advisory_xact_lock` ou checar coluna `broadcast_sent_at` (adicionar em `sales`).

### 3. UI — controle de preferência (opcional, mínimo)
- Em `useSystemSoundSettings` já existe categoria `newSale`. Manter.
- Adicionar toggle "Avisos de vendas dos colegas" em Configurações → Notificações que grava em `notification_preferences` (se já existir) ou novo campo. Edge function respeita esse opt-out antes de inserir.

### 4. Realtime atual permanece
- `useSalesRealtime` continua mostrando toast + confetti para usuários online (UX instantâneo).
- Como o realtime de `notifications` (`useNotifications`) já está ativo, o sino atualiza sozinho.

## Arquivos
- **Migration**: 1 (coluna `broadcast_sent_at` em `sales` + trigger + grant `pg_net`).
- **Edge function**: 1 (`broadcast-sale-notification`) + entrada em `supabase/config.toml`.
- **Sem mudanças** em componentes React (sino já consome notifications em realtime).

## Validação
- Inserir venda `completed` → todos os outros vendedores recebem entrada no sino + push (se subscritos) + toast (se online).
- O próprio vendedor da venda **não** recebe broadcast (evita auto-notificação).
- `supabase--linter` zero novos warnings.

Após esta entrega, sigo para a próxima atômica do roadmap mestre.
