import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
  ChevronRight,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLatestBriefing } from '@/hooks/executive-briefing/useLatestBriefing';
import { useGenerateBriefing } from '@/hooks/executive-briefing/useGenerateBriefing';
import { useDashboardKPIsPeriod } from '@/hooks/dashboard/useDashboardKPIsPeriod';
import { formatBRL } from '@/lib/money';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveSummaryReport({ isOpen, onClose }: Props) {
  const { data: briefing, isLoading } = useLatestBriefing();
  const generate = useGenerateBriefing();
  const { data: kpis } = useDashboardKPIsPeriod('quarter');

  if (!isOpen) return null;

  const revenue = kpis?.current.totalRevenue ?? 0;
  const revenueChange = kpis?.changes.revenue ?? 0;
  const conversion = kpis?.current.conversionRate ?? 0;
  const wins = briefing?.key_wins ?? [];
  const risks = briefing?.key_risks ?? [];
  const actions = briefing?.recommended_actions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card border border-border/50 shadow-2xl rounded-2xl flex flex-col"
      >
        {/* Header / Toolbar */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-section-title">Relatório Executivo (CEO-Ready)</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Gerado por IA •{' '}
                {new Date().toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-xs"
              onClick={() => window.print()}
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-xs"
              onClick={() => generate.mutate({ force: true })}
              disabled={generate.isPending}
            >
              <Share2 className="h-3.5 w-3.5" /> Atualizar Briefing
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
              <ChevronRight className="h-5 w-5 rotate-90" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Executive Overview */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="text-primary border-primary/20 bg-primary/5 uppercase tracking-tighter text-[10px]"
                >
                  Resumo de Alto Nível
                </Badge>
                {isLoading || briefing ? (
                  <>
                    <h3 className="text-3xl font-display font-black tracking-tight leading-tight">
                      {briefing?.headline ?? 'Carregando briefing executivo...'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {briefing?.narrative}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-display font-black tracking-tight leading-tight">
                      Nenhum briefing executivo gerado
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Gere o briefing executivo para popular este relatório com números
                      reais de pulso, vitórias, riscos e ações recomendadas.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => generate.mutate({ force: false })}
                      disabled={generate.isPending}
                    >
                      Gerar Briefing Executivo
                    </Button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <SummaryStat
                  label="Receita no Trimestre"
                  value={formatBRL(revenue)}
                  trend={`${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`}
                  tone={revenueChange >= 0 ? 'good' : 'bad'}
                />
                <SummaryStat
                  label="Taxa de Conversão"
                  value={`${conversion.toFixed(1)}%`}
                  trend={`${(kpis?.changes.conversion ?? 0) >= 0 ? '+' : ''}${(kpis?.changes.conversion ?? 0).toFixed(1)}%`}
                  tone={(kpis?.changes.conversion ?? 0) >= 0 ? 'good' : 'bad'}
                />
                <SummaryStat
                  label="Pulse Score"
                  value={briefing ? String(briefing.pulse_score) : '—'}
                  trend={briefing ? 'IA' : '—'}
                  tone="neutral"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> IA Strategic Pulse
              </h4>
              <div className="space-y-3">
                {wins.slice(0, 2).map((w, i) => (
                  <InsightRow
                    key={`w-${i}`}
                    icon={TrendingUp}
                    text={w.title}
                    tone="good"
                  />
                ))}
                {risks.slice(0, 2).map((r, i) => (
                  <InsightRow
                    key={`r-${i}`}
                    icon={AlertTriangle}
                    text={r.title}
                    tone="warn"
                  />
                ))}
                {actions.slice(0, 1).map((a, i) => (
                  <InsightRow
                    key={`a-${i}`}
                    icon={Zap}
                    text={`Ação Prioritária: ${a.title}`}
                  />
                ))}
                {wins.length === 0 && risks.length === 0 && actions.length === 0 && (
                  <InsightRow
                    icon={Target}
                    text="Sem sinais consolidados — gere o briefing executivo."
                  />
                )}
              </div>
            </div>
          </section>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/20">
            {/* Revenue Health */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Saúde da Receita
              </h4>
              <div className="space-y-4 p-5 rounded-xl border border-border/30 bg-card">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Taxa de Conversão no Trimestre</span>
                    <span className="font-bold">{conversion.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(100, conversion)}
                    className="h-2 bg-emerald-500/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Vendas Fechadas
                    </p>
                    <p className="text-lg font-bold">{kpis?.current.totalSales ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Ticket Médio
                    </p>
                    <p className="text-lg font-bold">
                      {formatBRL(kpis?.current.avgTicket ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" /> Principais Riscos
              </h4>
              <div className="space-y-4 p-5 rounded-xl border border-border/30 bg-card">
                <div className="space-y-3">
                  {risks.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum risco identificado pelo briefing executivo.
                    </p>
                  )}
                  {risks.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-xs">{r.title}</span>
                      <Badge
                        className={
                          r.severity === 'critical'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : r.severity === 'warning'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }
                      >
                        {r.severity === 'critical'
                          ? 'Crítico'
                          : r.severity === 'warning'
                            ? 'Atenção'
                            : 'Info'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="pt-6 border-t border-border/20">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Plano de Ação Estratégico
            </h4>
            {actions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma ação recomendada — gere o briefing executivo para receber o plano
                de ação priorizado por IA.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.slice(0, 3).map((a, i) => (
                  <ActionCard
                    key={i}
                    title={a.title}
                    desc={a.rationale}
                    priority={i === 0 ? 'Alta' : i === 1 ? 'Média' : 'Baixa'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/20 bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            CONFIDENCIAL • APENAS PARA USO EXECUTIVO • PROMO CHAMPIONS INTELLIGENCE
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  trend,
  tone,
}: {
  label: string;
  value: string;
  trend: string;
  tone: 'good' | 'bad' | 'neutral';
}) {
  const trendColor =
    tone === 'good'
      ? 'text-emerald-500'
      : tone === 'bad'
        ? 'text-destructive'
        : 'text-muted-foreground';
  const TrendIcon = trend.startsWith('+') ? TrendingUp : TrendingDown;

  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-all">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">
        {label}
      </p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-black">{value}</span>
        <div
          className={cn('flex items-center gap-0.5 text-[10px] font-bold', trendColor)}
        >
          <TrendIcon className="h-2.5 w-2.5" /> {trend}
        </div>
      </div>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  text,
  tone = 'default',
}: {
  icon: LucideIcon;
  text: string;
  tone?: 'default' | 'good' | 'warn';
}) {
  const colors = {
    default: 'text-primary',
    good: 'text-emerald-500',
    warn: 'text-amber-500',
  };
  return (
    <div className="flex items-start gap-2">
      <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', colors[tone])} />
      <p className="text-[11px] leading-snug">{text}</p>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  priority,
}: {
  title: string;
  desc: string;
  priority: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-xs font-bold">{title}</h5>
          <Badge
            className={cn(
              'text-[8px] uppercase font-black px-1.5 h-4',
              priority === 'Alta'
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : priority === 'Média'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            )}
          >
            {priority}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
