### Plano de Implementação: Pricing Intelligence Hub 10/10

O Pricing Intelligence Hub será transformado em um cockpit de proteção de margem de elite, utilizando IA para identificar elasticidade e evitar vazamento de receita.

#### Passo 1: IA Elasticity Curve & Price Shield
- **Visualização de Elasticidade**: Criar `src/components/pricing/PriceElasticityChart.tsx` para mostrar a correlação entre preço e win-rate por categoria.
- **Price Shield**: Adicionar indicadores de "Preço Ótimo" baseados em modelos preditivos.

#### Passo 2: Revenue Leakage Analysis
- **Mapa de Vazamento**: Detalhar o impacto financeiro de descontos excessivos e perda de margem por concorrente.
- **Micro-interações**: Animações de contagem e glow dinâmico para destacar prejuízos críticos.

#### Passo 3: Refatoração Visual "Glow & Glass"
- Atualizar `src/components/pricing/PricingIntelligenceHub.tsx` com o padrão visual imersivo de alta performance (borders transparentes, blur de fundo, count-up animations).

#### Passo 4: Notificações de Margem Crítica
- Implementar disparos de alertas proativos quando a margem de um deal fechado cair abaixo de 15% ou divergir drasticamente do benchmark.

---
**Detalhes Técnicos:**
- **Hooks**: Expandir `usePricingIntelligence` para fornecer dados de elasticidade.
- **Componentes**: Novo `RevenueLeakageCard.tsx`.
- **UI**: Framer Motion para gráficos e tabelas.
