

## Painel "Saúde de entregas de webhooks" — falhas por tentativa + taxa de sucesso

### Objetivo
Visualização compacta dentro do hub Win/Loss que, para a janela recente de entregas (`winloss_webhook_deliveries`), mostra:

1. **Taxa de sucesso global** (KPI) — `succeeded=true / total`.
2. **Falhas por tentativa** (gráfico de barras com 3 colunas: 1, 2, 3) — quantas entregas falharam em cada tentativa.

Permite identificar gargalos: se a maioria das falhas se concentra na tentativa 3 → endpoint instável; se concentra na 1 e raramente chega na 3 → recovery está funcionando bem.

### Estado atual
- `winloss_webhook_deliveries` já registra `attempt` (1..3), `succeeded`, `created_at`.
- `WebhookSubscriptionsPanel` lista subscriptions; o drawer mostra histórico individual — **não há visão agregada** de saúde.
- Stack de gráficos: Recharts (já em uso, ex. `WinLossTrendChart`).

### Mudanças

**1. Novo hook** — `src/hooks/win-loss/useWebhookDeliveryStats.ts`
- Query `winloss_webhook_deliveries` filtrando últimos 7 dias (`created_at >= now() - 7d`), `limit(2000)` por segurança.
- Agregação client-side:
  ```ts
  {
    total: number,
    succeeded: number,
    failed: number,
    successRate: number,            // 0..100
    failuresByAttempt: [
      { attempt: 1, failures, total },
      { attempt: 2, failures, total },
      { attempt: 3, failures, total },
    ]
  }
  ```
- `staleTime: 30s`.

**2. Novo componente** — `src/components/win-loss/WebhookHealthPanel.tsx`
- `<Card>` com header "Saúde de entregas (últimos 7 dias)" + ícone `Activity`.
- **Linha de KPIs** (3 stats compactos):
  - Taxa de sucesso (% grande; verde se ≥95, âmbar 80-94, destrutivo <80 — via tokens semânticos).
  - Total de entregas.
  - Total de falhas.
- **Mini gráfico de barras** (Recharts `BarChart`, height 160px):
  - X = `tentativa 1/2/3`; Y = nº de falhas.
  - Tooltip: `N falhas de M tentativas`.
  - Cor da barra: `hsl(var(--destructive))`.
- Empty state: "Nenhuma entrega registrada nos últimos 7 dias."
- Loading: skeleton compacto.
- Sem cores hardcoded; tokens semânticos.

**3. Integração** — `src/pages/WinLossIntelligence.tsx`
- Inserir `<WebhookHealthPanel />` dentro do `WinLossErrorBoundary section="Webhooks"`, **acima** do `<WebhookSubscriptionsPanel />` (linha ~362).

### Notas técnicas
- Sem mudanças no edge function nem em tabelas.
- Agregação client-side (volume baixo — janela 7d, max alguns milhares de linhas).
- Acessibilidade: `aria-label` no card e summary textual ("85% de sucesso, 12 falhas no total").

### Arquivos
- **Criar**: `src/hooks/win-loss/useWebhookDeliveryStats.ts`
- **Criar**: `src/components/win-loss/WebhookHealthPanel.tsx`
- **Modificar**: `src/pages/WinLossIntelligence.tsx` (1 import + 1 linha de uso)

### Verificação
1. `/win-loss-intelligence` renderiza o novo painel sem erros.
2. KPIs e barras refletem dados reais.
3. Empty state aparece quando não há entregas no período.

