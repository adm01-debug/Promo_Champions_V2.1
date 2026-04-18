
Win/Loss Intelligence entregue. Próximo bloco rumo a 10/10: **Smart Lead Routing** — distribuição automática e inteligente de leads para o vendedor certo (closer) com base em ICP, especialização, capacidade e performance histórica.

## Smart Lead Routing

### Conceito
Quando um SDR qualifica um lead ou um lead novo entra no sistema, uma engine roteia automaticamente para o closer ideal baseado em: match de ICP (segmento/ticket), especialização do vendedor (vertical/produto), capacidade atual (nº deals abertos vs limite), win rate histórico naquele segmento, e balanceamento round-robin como tiebreaker. Tudo auditável e com override manual pelo gestor.

### Backend
**Migration**:
- Tabela `routing_rules`: `id`, `name`, `priority`, `conditions` (jsonb: segment, value_min/max, vertical, source), `target_strategy` (`best_match`|`round_robin`|`specific_user`), `target_user_id` (nullable), `is_active`, `created_by`, `created_at`
- Tabela `salesperson_capacity`: `user_id`, `max_open_deals` (default 25), `current_open_deals` (trigger-mantido), `specializations` (text[]), `preferred_segments` (text[]), `accepting_leads` (bool)
- Tabela `lead_routing_log`: `id`, `lead_id`, `assigned_to`, `rule_id`, `score` (jsonb com breakdown: icp_match, capacity, win_rate, history), `routed_at`, `routed_by` (`auto`|`manual`|`override`)
- View `routing_performance_view`: agrega tempo médio até atribuição, % aceitos, conversão por vendedor
- Trigger `auto_route_new_lead` em `sales` (insert): chama edge function via pg_net quando `assigned_to IS NULL`
- RLS: gestor/admin gerenciam regras; vendedor vê apenas seu próprio capacity

**Edge function `smart-lead-router`**:
- Aceita `lead_id` ou batch `lead_ids[]`
- Para cada lead: avalia regras ativas em ordem de priority, calcula score por candidato (ICP 40% + capacity 25% + win_rate 25% + recency 10%)
- Usa Lovable AI (gemini-2.5-flash) APENAS para casos ambíguos (score top-2 com diferença <5 pontos) para desempate qualitativo
- Atualiza `sales.assigned_to`, registra em `lead_routing_log`, dispara notificação in-app

### Frontend (`src/components/lead-routing/`)
- `LeadRoutingHub.tsx` (≤300L): hub admin/gestor com tabs (Regras / Capacidade / Histórico / Performance)
- `RoutingRulesEditor.tsx`: CRUD visual de regras com builder de condições (segmento, ticket range, vertical) e seleção de estratégia
- `CapacityDashboard.tsx`: grid de vendedores com bars de utilização (current/max), toggle accepting_leads, tags de especialização
- `RoutingHistoryTable.tsx`: log de roteamentos recentes com score breakdown expandível e botão "Reatribuir"
- `RoutingPerformanceCard.tsx`: KPIs (tempo médio até atribuição, taxa de aceitação, conversão por vendedor)
- `ManualReassignDialog.tsx`: modal para gestor forçar reatribuição com motivo
- `routingHelpers.ts`: score calculator client-side preview, formatters, color tokens
- Hooks: `useRoutingRules.ts`, `useSalespersonCapacity.ts`, `useRoutingLog.ts`, `useRouteLeadMutation.ts`

### Integração
- Botão "Rotear Automaticamente" em `Sales.tsx` para leads sem `assigned_to`
- Badge "Auto-roteado" em cards do Kanban com tooltip do score
- Nova entrada no menu Admin: "Roteamento de Leads"
- Card resumo "Capacidade do Time" no Dashboard executivo

### Arquivos
- Migration: 3 tabelas + view + trigger + RLS + índices
- Edge: `supabase/functions/smart-lead-router/index.ts`
- Hooks: 4 em `src/hooks/lead-routing/`
- Componentes: 6 em `src/components/lead-routing/`
- Helpers: `routingHelpers.ts`
- Página: `src/pages/LeadRouting.tsx`
- Editar: `AppRoutes.tsx`, `lazyPages.ts`, navegação Admin, `Sales.tsx` (botão), card do Kanban (badge)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L por arquivo, strict TS, RLS com `has_role`, trigger pg_net seguro.
