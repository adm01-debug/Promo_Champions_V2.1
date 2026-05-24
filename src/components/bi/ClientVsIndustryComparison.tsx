import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Benchmark {
  metric: string;
  client: number;
  sector: number;
  unit: string;
  insight: string;
}

interface ClientVsIndustryComparisonProps {
  data: Benchmark[];
}

export function ClientVsIndustryComparison({ data }: ClientVsIndustryComparisonProps) {
  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl group rounded-3xl h-full">
      <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
        <BarChart3 className="size-5 text-primary" /> Cliente × <span className="text-primary">Setor</span>
      </h3>
      <div className="space-y-6">
        {data.map((b, i) => {
          const diff = ((b.client - b.sector) / b.sector) * 100;
          return (
            <div key={b.metric} className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{b.metric}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black font-mono">{b.client}{b.unit}</span>
                  <span className={`text-[9px] font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(b.client / (b.client + b.sector)) * 100}%` }} 
                  transition={{ duration: 1, delay: i * 0.1 }} 
                  className="h-full bg-primary relative z-10" 
                />
                <div className="absolute top-0 h-full w-0.5 bg-white/20 z-20" style={{ left: '50%' }} />
              </div>
              <p className="text-[9px] text-muted-foreground font-medium italic mt-1 leading-tight">{b.insight}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
