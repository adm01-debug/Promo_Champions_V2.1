### Plano de Implementação: Customer Success Hub 10/10

O Customer Success Hub será elevado ao padrão de excelência "Glow & Glass" com inteligência preditiva para antecipar churn e identificar expansões.

#### Passo 1: IA Churn Predictor & Engagement Radar
- **Refatoração Visual**: Atualizar `src/components/customer-success/CustomerSuccessHub.tsx` com o design system cibernético.
- **Predição de Churn**: Adicionar detalhes sobre *por que* o score caiu (ex: baixa atividade, sentimento negativo em chamadas).
- **Engagement Radar**: Criar mini-indicadores de saúde (Uso, Suporte, Sentimento, Financeiro).

#### Passo 2: Oportunidades de Expansão (Upsell)
- **Expansão Inteligente**: Implementar lógica visual para destacar contas com alto health score e renovação próxima como "Oportunidades de Ouro".
- **Revenue Projection**: Mostrar o valor potencial de expansão diretamente na lista.

#### Passo 3: Integração de Notificações de CS
- **Alertas Proativos**: Configurar gatilhos para notificar o gestor/CSM quando:
  - Uma conta entra em "Risco Crítico".
  - Uma conta atinge "Expansion Ready".

#### Passo 4: Refinamento Estético e Micro-interações
- **Glassmorphism**: Aplicar efeitos de transparência e brilho nos cards.
- **Animações**: Framer motion para entrada de listas e transição de estados de health.

---
**Detalhes Técnicos:**
- **Hooks**: Expandir `useCustomerSuccess` para incluir detalhes dos fatores de risco.
- **Componentes**: Criar `ChurnRiskDetailDialog.tsx` para explicar as predições da IA.
- **UI**: Uso extensivo de `framer-motion` e `lucide-react`.
