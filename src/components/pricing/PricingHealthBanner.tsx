import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { healthMeta } from './pricing-ui';
import type { PricingHealth } from '@/hooks/usePricingIntelligence';

interface PricingHealthBannerProps {
  health: PricingHealth;
  dealsCount: number;
}

export function PricingHealthBanner({ health, dealsCount }: PricingHealthBannerProps) {
  const meta = healthMeta[health];

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
          'absolute inset-0 opacity-10 bg-gradient-to-r',
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
        <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-8 shadow-xl">
          EXPORTAR AUDITORIA
        </Button>
      </div>
    </motion.div>
  );
}
