
User quer notificações automáticas avisando cada vendedor sobre sua posição no pódium, gap para o 1º e gap para o próximo acima.

Já existe `useCompetitiveRanking` que calcula `rank`, `gapToFirst`, `gapToNext`. Preciso entender canal de entrega e gatilho.

**Canais possíveis:** toast in-app, notificação persistente (sino/badge), email, WhatsApp.
**Gatilho:** ao logar, manualmente pelo gestor, automático diário, ou em tempo real quando posição muda.

Para MVP coerente com o sistema atual (que tem toasts, realtime, gamificação), proponho **notificação in-app persistente + toast de boas-vindas ao logar**, com opção de disparo manual pelo gestor. Email/WhatsApp ficam para fase 2.

## Plano

### 1. Migration
Tabela `ranking_notifications`:
- `id`, `salesperson_id` (FK), `rank int`, `total_sales numeric`, `gap_to_first numeric`, `gap_to_next numeric`, `next_competitor_name text`, `period_start date`, `message text`, `read_at timestamptz`, `created_at timestamptz`
- Único `(salesperson_id, period_start)` para evitar duplicação no mesmo mês
- RLS: vendedor lê apenas o próprio; admin/manager escreve
- Realtime ativado

### 2. Edge function `notify-ranking-position` (verify_jwt=true)
- Busca ranking competitivo do mês corrente
- Para cada vendedor ativo gera mensagem personalizada:
  - "🥇 Você está em 1º! R$ X em vendas. Mantenha o ritmo!"
  - "🥈 Você está em 2º. Faltam R$ Y para ultrapassar [Nome]."
  - "Você está em Nº. R$ Z para o pódium, R$ W para o próximo."
- Upsert em `ranking_notifications` (1 por vendedor por mês)
- Retorna contagem de notificações enviadas

### 3. Hooks `src/hooks/useRankingNotifications.ts`
- `useMyRankingNotification()` — busca a mais recente do vendedor logado
- `useUnreadRankingCount()` — contador para badge
- `useMarkRankingNotificationRead()` — marca como lida
- `useSendRankingNotifications()` — mutation para gestor disparar
- Subscription realtime para atualizar badge

### 4. Componentes
- `RankingPositionBanner.tsx` — banner dismissível no topo do dashboard mostrando posição + gaps com CTA para Ranking
- `SendRankingNotificationsButton.tsx` — botão no painel admin/manager para disparar broadcast manual
- Integração no sino de notificações existente (se houver) ou novo dropdown

### 5. Disparo automático
- Cron job pg_cron toda segunda 09h chamando `notify-ranking-position`
- Garante que vendedores recebem update semanal sem intervenção

### 6. Integração visual
- Banner no `Dashboard` (acima do conteúdo)
- Toast de boas-vindas no login se houver notificação não lida (1x por sessão)
- Botão de disparo manual em `RankingHub` para gestores

## Arquivos
- Migration: 1 (tabela + RLS + realtime + cron)
- Edge function: 1
- Criar: 1 hook, 2 componentes
- Editar: `Dashboard` (banner), hub de ranking (botão admin), `supabase/config.toml`
