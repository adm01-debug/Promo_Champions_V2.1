import { Brain } from 'lucide-react';

export interface InsightBannerData {
  preferredTimeOfDay: string;
  preferredDayOfWeek: string;
  priceSensitivity: string;
  churnRisk: number;
  orders: Array<{ created_at: string }>;
}

interface InsightBannerProps {
  data: InsightBannerData;
}

export function InsightBanner({ data }: InsightBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-transparent border border-indigo-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Brain className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter text-indigo-400">
            Sumário Cognitivo da IA
          </h3>
          <p className="text-xs font-medium text-foreground/80 leading-relaxed">
            Cliente com{' '}
            <span className="text-indigo-400 font-bold">Alta Fidelidade</span>, prefere
            comprar{' '}
            <span className="text-indigo-400 font-bold">{data.preferredTimeOfDay}</span>{' '}
            às{' '}
            <span className="text-indigo-400 font-bold">
              {data.preferredDayOfWeek}s
            </span>
            . Sensibilidade a preço:{' '}
            <span className="text-indigo-400 font-bold">
              {data.priceSensitivity.toUpperCase()}
            </span>
            .
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase">
            Tempo de Casa
          </p>
          <p className="text-lg font-black text-foreground">
            {data.orders.length > 0
              ? `${Math.floor((new Date().getTime() - new Date(data.orders[data.orders.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`
              : 'N/A'}
          </p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase">
            Conversão
          </p>
          <p className="text-lg font-black text-emerald-500">{100 - data.churnRisk}%</p>
        </div>
      </div>
    </div>
  );
}
