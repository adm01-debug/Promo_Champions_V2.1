
## Próxima Melhoria: Pricing Intelligence Hub

Já entreguei: Notificações, Inteligência Preditiva, Automação Inteligente, Coaching, RevOps, Customer Success, Sales Enablement e Conversational Intelligence.

Próximo módulo de alto impacto para o roadmap 10/10: **Pricing Intelligence Hub** — análise de descontos, margem e elasticidade de preços nos deals fechados, com recomendações de IA para proteger margem.

### O que será criado

1. **Edge Function `pricing-intelligence`**
   - Agrega `sales` + `deals` dos últimos N dias
   - KPIs: ticket médio, desconto médio %, margem estimada, deals com desconto > threshold, perda de receita por descontos
   - Distribuição de descontos por faixa (0%, 1-10%, 11-20%, 21-30%, >30%)
   - Top vendedores que mais descontam (alerta de margem)
   - Recomendação de "preço ideal" por produto baseado em win-rate histórico

2. **Hook `usePricingIntelligence.ts`**
   - Fetch via edge function com horizonte (30/60/90 dias)
   - Cache React Query 5min

3. **UI `PricingIntelligenceHub.tsx`**
   - Banner de saúde de pricing (excellent/healthy/warning/critical)
   - KPI grid: ticket médio, desconto médio, receita perdida, deals em alerta
   - Gráfico de distribuição de descontos (Recharts)
   - Tabela de vendedores com maior desconto médio
   - Lista de produtos com sugestão de reajuste

4. **Página `PricingIntelligenceHub.tsx`** com Helmet/SEO + ProtectedRoute (admin/manager)

5. **Roteamento e Navegação**
   - Rota `/pricing-intelligence` em `AppRoutes.tsx` + `lazyPages.ts`
   - Item no sidebar "Análises" (`sidebarMenuData.ts`)
   - Breadcrumb em `DesktopTopBar.tsx`

### Padrões obrigatórios
- Sora títulos / Inter body, tokens semânticos, dark theme
- Framer motion, skeleton loading, memoization
- ≤400 linhas por arquivo (extrair helpers se necessário)
- Zero console errors, strict TS

Após este, sigo para os próximos módulos do roadmap (Territory Optimization AI, Win/Loss Intelligence, Onboarding Coach IA) sem pausas.
