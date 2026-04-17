
**Novo módulo: Inteligência de Compras — Heatmap + Análise Preditiva 360°**

## Visão geral
Módulo robusto que cruza **histórico real de compras de cada cliente** (com o vendedor logado **e** com outros vendedores da casa) em um **heatmap temporal** + camada de **IA preditiva** (passado/presente/futuro) para revelar padrões de recompra, sazonalidade, churn iminente e janela ideal de aproximação.

## Estado atual
- `sales` tem `client_name`, `salesperson_id`, `created_at`, `final_value`, `status`.
- `clients` tem `id`, `name`, `total_value`, `last_purchase_date`.
- `salespeople` para resolver nomes.
- `predictive-intelligence` já existe (forecast geral) mas **não tem visão por cliente × vendedor**.
- Sem heatmap temporal de compras por cliente; sem comparativo "minhas vendas vs concorrência interna".

## Arquitetura

### 1. Banco (1 migration)
- **RPC `get_client_purchase_heatmap(_client_id uuid?, _months int default 24)`**
  - Retorna grid `{month, week, salesperson_id, salesperson_name, is_current_user, deal_count, revenue}`.
  - Agregação por (cliente × mês × vendedor) cruzando `sales` ↔ `clients` ↔ `salespeople`.
- **RPC `get_purchase_intelligence_summary(_client_id uuid)`**
  - Retorna stats: `total_purchases`, `total_revenue`, `avg_ticket`, `avg_cycle_days`, `last_purchase_date`, `share_with_me_pct`, `share_with_others_pct`, `top_competitor_internal` (vendedor que mais vendeu pra esse cliente), `predicted_next_purchase_date`, `predicted_amount`, `churn_risk_score`.
- **View `client_purchase_seasonality`** — média de compras por mês-do-ano por cliente (input do heatmap sazonal).
- RLS: salesperson vê próprio + clientes onde já vendeu; manager/admin vê tudo.

### 2. Edge function `purchase-intelligence-forecast` (`verify_jwt = true`)
- Input: `{ client_id }`.
- Lê histórico via RPCs acima + sazonalidade.
- Chama Lovable AI (`google/gemini-3-flash-preview`) com tool calling estruturado:
  - `predicted_next_purchase_date`, `predicted_amount`, `confidence` (0-1).
  - `churn_risk_score` (0-100) + `risk_reasons[]`.
  - `recommended_action` (texto curto) + `best_contact_window` (`morning|afternoon|evening`).
  - `pattern_insight` (1 frase descrevendo o padrão temporal).
- Retorna JSON unificado, cacheado 4h via React Query.

### 3. Hooks `src/hooks/purchase-intelligence/`
- `usePurchaseHeatmap(clientId?, months)` — RPC heatmap.
- `usePurchaseIntelligence(clientId)` — RPC summary + invoke da edge function.
- `useTopRebuyers(limit)` — top clientes com janela próxima.

### 4. UI — Página `/inteligencia-compras` (lazy)
- **`PurchaseIntelligenceHub.tsx`** (≤200L) — orquestrador com 3 abas:
  - **Visão por Cliente** (default)
  - **Top Recompradores** (lista priorizada)
  - **Sazonalidade Global** (heatmap agregado)
- **`PurchaseHeatmapGrid.tsx`** (≤220L) — heatmap 24 meses × semanas:
  - Células coloridas por intensidade (revenue).
  - **Borda azul sólida** = compra com vendedor logado.
  - **Borda âmbar tracejada** = compra com outro vendedor (mostra nome no tooltip).
  - Tooltip rico com data, valor, vendedor, status.
- **`PurchaseTimelinePast.tsx`** (≤160L) — linha do tempo cronológica das últimas 10 compras com avatar do vendedor responsável.
- **`PurchasePredictionCard.tsx`** (≤180L) — card com:
  - Próxima compra prevista (data + valor + ring de confiança).
  - Churn risk score com barra colorida.
  - Janela ideal de contato.
  - Pattern insight em destaque.
  - Botão "Criar follow-up automático" (cria activity).
- **`SalespersonShareDonut.tsx`** (≤120L) — donut "minha fatia × outros vendedores" com nomes.
- **`TopRebuyersTable.tsx`** (≤180L) — clientes com janela ≤30 dias, ordenados por valor previsto.
- **`SeasonalityHeatmap.tsx`** (≤160L) — heatmap 12 meses × dia-da-semana agregado.
- **`purchaseIntelligenceHelpers.ts`** — labels, escalas de cor, formatadores, detecção de cadência.

### 5. Integração
- **Sidebar** (`sidebarMenuData.ts`): novo item "Inteligência de Compras" no grupo Analytics.
- **Rotas** (`AppRoutes.tsx` + `lazyPages.ts`): `/inteligencia-compras`.
- **`ClientDetailDrawer.tsx`**: nova aba "Compras 360°" embedando `PurchaseHeatmapGrid` + `PurchasePredictionCard` filtrados pelo cliente.
- **`config.toml`**: `[functions.purchase-intelligence-forecast] verify_jwt = true`.

### 6. Validação
- Linter zero warnings novos.
- Edge function testada via curl em cliente real → JSON válido.
- Heatmap mostra borda azul vs âmbar conforme `salesperson_id` na sale.

## Arquivos
- **Migration**: 1 (2 RPCs + 1 view + RLS)
- **Criar**: `supabase/functions/purchase-intelligence-forecast/index.ts`
- **Criar**: 3 hooks em `src/hooks/purchase-intelligence/`
- **Criar**: 8 componentes/helpers em `src/components/purchase-intelligence/`
- **Criar**: `src/pages/PurchaseIntelligence.tsx`
- **Editar**: `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`, `src/components/clients/ClientDetailDrawer.tsx`, `supabase/config.toml`

Após esta entrega, retomo o ciclo automático fechando **Conversation Intelligence 4/4** (Momentos Críticos com Notificações) e seguindo para o próximo bloco do `GAPS_CLASSE_MUNDIAL.md`.
