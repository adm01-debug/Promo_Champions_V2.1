import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const CountUp = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useMemo(() => {
    const start = 0;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = progress * (end - start) + start;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export function PricingKpiCard({
  icon: Icon,
  label,
  numericValue,
  isCurrency = false,
  isPercent = false,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  numericValue: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="glass overflow-hidden border-white/5 relative group">
        <div
          className={cn(
            'absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500',
            accent.includes('success')
              ? 'bg-success'
              : accent.includes('destructive')
                ? 'bg-destructive'
                : 'bg-primary'
          )}
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
              {label}
            </span>
            <div
              className={cn(
                'p-2 rounded-lg bg-background/50 border border-white/5',
                accent
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col relative">
            <div
              className={cn(
                'text-4xl font-black font-display tracking-tight drop-shadow-sm',
                accent
              )}
            >
              <CountUp
                value={numericValue}
                prefix={isCurrency ? 'R$ ' : ''}
                suffix={isPercent ? '%' : ''}
                decimals={isPercent ? 1 : 0}
              />
            </div>
            {isPercent && numericValue > 15 ? (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-destructive font-black tracking-widest animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                EROSÃO CRÍTICA
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-success font-black tracking-widest opacity-80">
                <ShieldCheck className="h-3 w-3" />
                PROTEÇÃO ATIVA
              </div>
            )}

            {/* Neural Sync Spark */}
            <div className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
