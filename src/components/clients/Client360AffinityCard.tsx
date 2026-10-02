import { motion } from 'framer-motion';
import { PieChart, Info, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CategoryPie } from './CategoryPie';
import type { Client360Data } from '@/hooks/crm/useClient360';

export function Client360AffinityCard({ data }: { data: Client360Data }) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-section-title flex items-center justify-between uppercase font-black tracking-tighter">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-500" />
            Afinidade & Cross-sell
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Análise de mix e sugestões preditivas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <CategoryPie data={data.categoryDistribution} />

        <div className="w-full mt-6 pt-6 border-t border-white/10">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Matriz de Afinidade (Cross-sell)
          </span>
          <div className="space-y-3">
            {[
              {
                title: 'Linha Premium Gold',
                conversion: '+34%',
                category: 'Upgrade',
                color: 'text-amber-500',
              },
              {
                title: 'Manutenção Preventiva',
                conversion: '+21%',
                category: 'Serviço',
                color: 'text-emerald-500',
              },
              {
                title: 'Kit Acessórios V.4',
                conversion: '+18%',
                category: 'Bundle',
                color: 'text-indigo-500',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <ShoppingBag className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase leading-tight">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('text-[8px] font-black uppercase', item.color)}>
                        {item.conversion} Conv.
                      </span>
                      <div className="h-0.5 w-0.5 rounded-full bg-white/20" />
                      <span className="text-[7px] font-bold text-muted-foreground uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
