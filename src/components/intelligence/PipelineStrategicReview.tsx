import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  AlertCircle,
  Clock,
  FileText,
  ChevronRight,
  Target,
} from 'lucide-react';
import type {
  InspectionDeal,
  WinRateRow,
} from '@/hooks/revenue/useRevenueIntelligenceHub';

const FLAG_LABELS: Record<string, string> = {
  stale_stage: 'Estágio parado',
  no_recent_activity: 'Sem atividade recente',
  no_decision_maker: 'Sem decisor mapeado',
  single_threaded: 'Single-threaded',
};

interface PipelineStrategicReviewProps {
  winRateBreakdown: WinRateRow[];
  inspection: {
    total_inspected: number;
    flag_counts: Record<string, number>;
    deals: InspectionDeal[];
  };
  onNavigateTab?: (tab: string) => void;
}

export const PipelineStrategicReview = ({
  winRateBreakdown,
  inspection,
  onNavigateTab,
}: PipelineStrategicReviewProps) => {
  const won = winRateBreakdown.reduce((s, r) => s + Number(r.won_deals || 0), 0);
  const lost = winRateBreakdown.reduce((s, r) => s + Number(r.lost_deals || 0), 0);
  const winRate = won + lost > 0 ? `${Math.round((won / (won + lost)) * 100)}%` : '—';

  const deals = inspection.deals;
  const avgDaysInStage =
    deals.length > 0
      ? `${(deals.reduce((s, d) => s + Number(d.days_in_stage || 0), 0) / deals.length).toFixed(1)} dias`
      : '—';
  const flaggedDeals = deals.filter(d => (d.risk_flags ?? []).length > 0).length;
  const flagEntries = Object.entries(inspection.flag_counts ?? {}).filter(
    ([, count]) => count > 0
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-primary/20 bg-linear-to-br from-card to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-section-title flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Revisão Estratégica do Pipeline
              </CardTitle>
              <CardDescription>
                Resumo da última inspeção do pipeline e do win rate dos últimos 180 dias
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-3"
            >
              {inspection.total_inspected} deals inspecionados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Executive Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryStat
              label="Tempo médio no estágio"
              value={avgDaysInStage}
              icon={Clock}
            />
            <SummaryStat label="Win rate (180 dias)" value={winRate} icon={Target} />
            <SummaryStat
              label="Deals com alerta"
              value={deals.length > 0 ? String(flaggedDeals) : '—'}
              icon={AlertCircle}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="size-4 text-primary" />
              Alertas da inspeção
            </h3>

            {flagEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sem dados suficientes ainda. Rode a inspeção do pipeline para gerar
                alertas.
              </p>
            ) : (
              <div className="grid gap-3">
                {flagEntries.map(([flag, count]) => (
                  <InsightCard
                    key={flag}
                    type="warning"
                    title={FLAG_LABELS[flag] ?? flag}
                    description={`${count} ${count === 1 ? 'deal sinalizado' : 'deals sinalizados'} na última inspeção do pipeline.`}
                  />
                ))}
              </div>
            )}
          </div>

          {onNavigateTab && (
            <div className="pt-4 border-t flex justify-end">
              <Button
                variant="outline"
                className="gap-2 group"
                onClick={() => onNavigateTab('inspection')}
              >
                Ver inspeção do pipeline
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface SummaryStatProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

const SummaryStat = ({ label, value, icon: Icon }: SummaryStatProps) => (
  <div className="p-4 rounded-xl border bg-card/50 space-y-2">
    <div className="flex items-center justify-between">
      <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <Icon className="size-4" />
      </div>
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

interface InsightCardProps {
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
}

const InsightCard = ({ type, title, description }: InsightCardProps) => {
  const styles = {
    opportunity: 'border-success/20 bg-success/5 text-success',
    warning: 'border-warning/20 bg-warning/5 text-warning',
    info: 'border-primary/20 bg-primary/5 text-primary',
  }[type];

  return (
    <div className={`p-3 rounded-lg border flex gap-3 ${styles}`}>
      <div className="mt-0.5">
        {type === 'opportunity' && <TrendingUp className="size-4" />}
        {type === 'warning' && <AlertCircle className="size-4" />}
        {type === 'info' && <BarChart3 className="size-4" />}
      </div>
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-xs opacity-90 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
};
