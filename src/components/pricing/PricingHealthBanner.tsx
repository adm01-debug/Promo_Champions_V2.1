import { motion } from 'framer-motion';
import { Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/utils/csvExport';
import { getLocalISODate } from '@/utils/dateHelpers';
import { healthMeta } from './pricing-ui';
import type {
  PricingHealth,
  PricingIntelligenceResponse,
} from '@/hooks/usePricingIntelligence';

interface PricingHealthBannerProps {
  health: PricingHealth;
  dealsCount: number;
  details?: PricingIntelligenceResponse;
}

export function PricingHealthBanner({
  health,
  dealsCount,
  details,
}: PricingHealthBannerProps) {
  const meta = healthMeta[health];

  const handleExport = () => {
    const rows: Record<string, string | number>[] = [
      {
        Bloco: 'Resumo',
        Item: 'Status da operação',
        Detalhe: `${meta.label} — ${meta.desc}`,
        Deals: dealsCount,
        'Ticket Medio (R$)': details?.kpis.avg_ticket ?? '',
        'Desconto Medio (%)': details
          ? Number((details.kpis.avg_discount_pct * 100).toFixed(2))
          : '',
        'Receita (R$)': details?.kpis.total_revenue ?? '',
        'Receita Perdida (R$)': details?.kpis.revenue_lost ?? '',
        'Preco Medio (R$)': '',
        'Preco Recomendado (R$)': '',
        'Uplift (%)': '',
      },
      {
        Bloco: 'Resumo',
        Item: 'Janela analisada',
        Detalhe: details
          ? `${details.days} dias · limite ${details.threshold}% · ${details.kpis.alerted_deals} deals em alerta`
          : '',
        Deals: '',
        'Ticket Medio (R$)': '',
        'Desconto Medio (%)': '',
        'Receita (R$)': '',
        'Receita Perdida (R$)': '',
        'Preco Medio (R$)': '',
        'Preco Recomendado (R$)': '',
        'Uplift (%)': '',
      },
    ];

    for (const bucket of details?.distribution ?? []) {
      rows.push({
        Bloco: 'Faixa de desconto',
        Item: bucket.label,
        Detalhe: '',
        Deals: bucket.count,
        'Ticket Medio (R$)': '',
        'Desconto Medio (%)': '',
        'Receita (R$)': bucket.revenue,
        'Receita Perdida (R$)': '',
        'Preco Medio (R$)': '',
        'Preco Recomendado (R$)': '',
        'Uplift (%)': '',
      });
    }

    for (const seller of details?.top_discounters ?? []) {
      rows.push({
        Bloco: 'Vendedor',
        Item: seller.salesperson_name,
        Detalhe: '',
        Deals: seller.deals_count,
        'Ticket Medio (R$)': seller.avg_ticket,
        'Desconto Medio (%)': Number((seller.avg_discount_pct * 100).toFixed(2)),
        'Receita (R$)': seller.total_revenue,
        'Receita Perdida (R$)': seller.revenue_lost,
        'Preco Medio (R$)': '',
        'Preco Recomendado (R$)': '',
        'Uplift (%)': '',
      });
    }

    for (const product of details?.product_recommendations ?? []) {
      rows.push({
        Bloco: 'Produto',
        Item: product.product_name,
        Detalhe: '',
        Deals: product.deals_count,
        'Ticket Medio (R$)': '',
        'Desconto Medio (%)': '',
        'Receita (R$)': '',
        'Receita Perdida (R$)': '',
        'Preco Medio (R$)': product.avg_price,
        'Preco Recomendado (R$)': product.recommended_price,
        'Uplift (%)': Number((product.uplift_pct * 100).toFixed(2)),
      });
    }

    exportToCSV(rows, `auditoria_pricing_${getLocalISODate()}`);
    toast({
      title: 'Auditoria exportada',
      description: `${rows.length} linha(s) · status ${meta.label}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl',
        meta.tone,
        'border-white/10 backdrop-blur-md'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-10 bg-linear-to-r',
          health === 'critical'
            ? 'from-destructive via-transparent to-transparent'
            : 'from-primary via-transparent to-transparent'
        )}
      />

      <div className="flex items-center gap-5 relative z-10">
        <div
          className={cn(
            'p-4 rounded-2xl bg-white/10 border border-white/20 shadow-inner',
            meta.ring
          )}
        >
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase opacity-70">
              Status da Operação
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
          </div>
          <div className="text-3xl font-black font-sora tracking-tighter">
            Pricing {meta.label}
          </div>
          <div className="text-sm font-medium opacity-80 mt-1">{meta.desc}</div>
        </div>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <div className="text-right hidden sm:block">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Volume Analisado
          </div>
          <div className="text-xl font-bold">
            {dealsCount}{' '}
            <span className="text-xs opacity-60 font-medium tracking-normal">deals</span>
          </div>
        </div>
        <Button
          onClick={handleExport}
          className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-8 shadow-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          EXPORTAR AUDITORIA
        </Button>
      </div>
    </motion.div>
  );
}
