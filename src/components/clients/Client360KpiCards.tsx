import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Client360Data } from '@/hooks/crm/useClient360';
import { formatCurrency, computeSegmentDiff } from './Client360ViewHelpers';

interface Client360KpiCardsProps {
  data: Client360Data;
}

function DiffBadge({ diff }: { diff: number }) {
  const positive = diff >= 0;
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {positive ? (
        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
      ) : (
        <ArrowDownRight className="h-3 w-3 text-rose-500" />
      )}
      <span
        className={cn(
          'text-[9px] font-bold uppercase',
          positive ? 'text-emerald-500' : 'text-rose-500'
        )}
      >
        {Math.abs(diff).toFixed(1)}% vs média segmento
      </span>
    </div>
  );
}

export function Client360KpiCards({ data }: Client360KpiCardsProps) {
  const ltvDiff = computeSegmentDiff(data.ltv, data.segmentAverageLtv);
  const ticketDiff = computeSegmentDiff(data.averageTicket, data.segmentAverageTicket);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden relative group backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-primary/20 transition-all" />
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            LTV Absoluto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-primary tabular-nums drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
            {formatCurrency(data.ltv)}
          </div>
          <DiffBadge diff={ltvDiff} />
        </CardContent>
      </Card>

      <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-sm overflow-hidden relative group backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-indigo-500/20 transition-all" />
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Ticket Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-indigo-500 tabular-nums drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">
            {formatCurrency(data.averageTicket)}
          </div>
          <DiffBadge diff={ticketDiff} />
        </CardContent>
      </Card>

      <Card className="bg-emerald-600/10 border-emerald-500/20 shadow-sm overflow-hidden relative group backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all" />
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Esforço de Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-emerald-500 tabular-nums drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            {data.engagementRatio.toFixed(1)}x
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold tracking-tight">
            Interações por conversão
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border-indigo-500/20 shadow-sm overflow-hidden relative group backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-all" />
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Posição na Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-indigo-500 tabular-nums drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
            TOP {100 - data.percentile}%
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold tracking-tight">
            Percentil de faturamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
