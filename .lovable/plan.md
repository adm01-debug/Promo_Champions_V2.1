
Vou abrir `docs/GAPS_CLASSE_MUNDIAL.md` para identificar o próximo gap real e implementá-lo.

## Próxima Melhoria: Territory Optimization AI

Conforme roadmap aprovado (próximo da fila após Pricing Intelligence). Módulo de IA que analisa cobertura geográfica, balanceamento de carteiras e potencial de receita por território, recomendando rebalanceamento automático.

### O que será criado

1. **Edge Function `territory-optimization`**
   - Agrega `sales_territories`, `territory_assignments`, `sales`, `clients`
   - Calcula: cobertura (clientes ativos/total), carga por vendedor, receita realizada vs. potencial, índice de desbalanceamento (Gini-like)
   - Detecta territórios sub/sobre-atendidos
   - Recomenda: realocações de vendedores, splits de território, merges

2. **Hook `useTerritoryOptimization.ts`**
   - Fetch via edge function (horizonte 30/60/90d)
   - Cache 5min, strict TS

3. **UI `TerritoryOptimizationHub.tsx`**
   - Banner de saúde (excellent/healthy/warning/critical)
   - KPI grid: territórios ativos, cobertura média, índice de balanceamento, receita perdida por sub-cobertura
   - Tabela de territórios com flags (sub-atendido / sobrecarga / saudável)
   - Lista de recomendações acionáveis (motion cards)
   - Chart de distribuição de carga por vendedor (Recharts)

4. **Página + Rota**
   - `/territory-optimization` em `AppRoutes.tsx` + `lazyPages.ts`
   - Item sidebar "Análises" (`sidebarMenuData.ts`)
   - Breadcrumb `DesktopTopBar.tsx`
   - Helmet/SEO + ProtectedRoute (admin/manager)

### Padrões obrigatórios
- Sora títulos / Inter body, tokens semânticos, dark theme
- Framer motion, skeleton loading, memoization
- ≤400 linhas por arquivo (helpers separados)
- Zero console errors, strict TS, RLS respeitado

Após aprovação, sigo para Win/Loss Intelligence e Onboarding Coach IA sem pausas.
