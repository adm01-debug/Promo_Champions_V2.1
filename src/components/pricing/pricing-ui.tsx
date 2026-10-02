import type { PricingHealth } from '@/hooks/usePricingIntelligence';

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const healthMeta: Record<
  PricingHealth,
  { label: string; tone: string; ring: string; desc: string }
> = {
  excellent: {
    label: 'Excelente',
    tone: 'bg-success/15 text-success border-success/30',
    ring: 'ring-success/40',
    desc: 'Margem protegida. Descontos sob controle.',
  },
  healthy: {
    label: 'Saudável',
    tone: 'bg-info/15 text-info border-info/30',
    ring: 'ring-info/40',
    desc: 'Pricing está em linha. Continue monitorando.',
  },
  warning: {
    label: 'Atenção',
    tone: 'bg-warning/15 text-warning border-warning/30',
    ring: 'ring-warning/40',
    desc: 'Descontos elevados em parte da carteira. Revise política.',
  },
  critical: {
    label: 'Crítico',
    tone: 'bg-destructive/15 text-destructive border-destructive/30',
    ring: 'ring-destructive/40',
    desc: 'Erosão de margem significativa. Ação imediata necessária.',
  },
};
