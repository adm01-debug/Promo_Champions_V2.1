import {
  Target,
  TrendingUp,
  BarChart3,
  Info,
  Brain,
  RefreshCw,
  AlertTriangle,
  Download,
  Search,
  FileText,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ScoredLead } from '@/hooks/useLeadScoring';
import { LEAD_CATEGORY_CONFIG, FactorBar, ScoreRing } from './scoring-ui';
import type { LeadConnectionStatus } from './scoring-ui';

interface LeadRankingCardProps {
  leads: ScoredLead[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  isSyncing: boolean;
  connectionStatus: LeadConnectionStatus;
  onSelectLead: (leadId: string) => void;
}

export function LeadRankingCard({
  leads,
  searchTerm,
  onSearchChange,
  onExportCSV,
  onExportPDF,
  isExporting,
  isSyncing,
  connectionStatus,
  onSelectLead,
}: LeadRankingCardProps) {
  return (
    <Card
      variant="modern"
      className="overflow-hidden bg-card/40 backdrop-blur-md border-white/5"
    >
      <CardHeader className="p-6 border-b border-border/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-section-title flex items-center gap-3 font-black uppercase tracking-tighter italic">
              <BarChart3 className="h-5 w-5 text-primary" />
              Strategic Lead Ranking
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Painel de Priorização de Ativos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="LOCALIZAR COMBATANTE..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                className="h-9 pl-9 bg-background/50 border-white/5 text-[10px] font-black uppercase tracking-widest focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
                disabled={isExporting}
                className="h-9 px-4 rounded-lg border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
              >
                <Download
                  className={cn('h-3.5 w-3.5 mr-2', isExporting && 'animate-bounce')}
                />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                disabled={isExporting}
                className="h-9 px-4 rounded-lg border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
              >
                <FileText
                  className={cn('h-3.5 w-3.5 mr-2', isExporting && 'animate-bounce')}
                />
                PDF
              </Button>
            </div>

            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300',
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : connectionStatus === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-accent/30 border-white/5 shadow-inner'
              )}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
              ) : (
                <Activity
                  className={cn(
                    'w-3.5 h-3.5 animate-pulse',
                    connectionStatus === 'connected'
                      ? 'text-emerald-500'
                      : connectionStatus === 'error'
                        ? 'text-rose-500'
                        : 'text-primary'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-widest',
                  connectionStatus === 'connected'
                    ? 'text-emerald-500'
                    : connectionStatus === 'error'
                      ? 'text-rose-500'
                      : 'text-muted-foreground'
                )}
              >
                {connectionStatus === 'connected'
                  ? 'Neural Link Active'
                  : connectionStatus === 'error'
                    ? 'Link Error'
                    : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="relative inline-block mb-4">
              <Target className="h-16 w-16 mx-auto opacity-10" />
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            </div>
            <p className="font-display font-black uppercase tracking-widest text-sm italic">
              Nenhum combatente localizado
            </p>
            <p className="text-[10px] mt-2 font-medium uppercase tracking-widest">
              Ajuste os parâmetros de busca neural
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/5">
            {leads.map((lead, idx) => {
              const cfg = LEAD_CATEGORY_CONFIG[lead.category];
              const Icon = cfg.icon;
              const isServerScore = 'dealValue' in lead.factors;

              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className={cn(
                    'group relative flex items-center gap-6 p-5 transition-all duration-500 cursor-pointer',
                    'hover:bg-primary/[0.04] hover:backdrop-blur-md',
                    idx === 0 &&
                      'bg-primary/[0.03] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary'
                  )}
                >
                  {/* Futuristic Rank Indicator */}
                  <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                    <span
                      className={cn(
                        'font-display font-black text-2xl tracking-tighter z-10 italic transition-all duration-500',
                        idx < 3 ? 'text-primary scale-110' : 'text-muted-foreground/30'
                      )}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {idx < 3 && (
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl rotate-45 scale-90 border border-primary/20 group-hover:rotate-90 transition-transform duration-700" />
                    )}
                  </div>

                  {/* Enhanced Score Ring */}
                  <div className="shrink-0 scale-110 group-hover:scale-125 transition-all duration-500 relative">
                    <ScoreRing score={lead.score} size={52} />
                    <div
                      className={cn(
                        'absolute -top-1 -right-1 p-0.5 rounded-full ring-2 ring-background',
                        cfg.bg
                      )}
                    >
                      <Icon className={cn('h-2.5 w-2.5', cfg.color)} />
                    </div>
                  </div>

                  {/* Strategic Lead Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="font-display font-black text-lg uppercase tracking-tighter truncate group-hover:text-primary transition-all duration-300">
                        {lead.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-white/5 shadow-sm',
                          cfg.bg,
                          cfg.color
                        )}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest truncate max-w-[200px]">
                          {lead.company || lead.email || 'ANONYMOUS ENTITY'}
                        </p>
                      </div>
                      {lead.trend && lead.trend.length > 1 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/30 border border-white/5">
                          {lead.trend[lead.trend.length - 1] > lead.trend[0] ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingUp className="h-3 w-3 text-rose-500 rotate-180" />
                          )}
                          <span
                            className={cn(
                              'text-[10px] font-black tracking-tighter',
                              lead.trend[lead.trend.length - 1] > lead.trend[0]
                                ? 'text-emerald-500'
                                : 'text-rose-500'
                            )}
                          >
                            {Math.abs(
                              lead.trend[lead.trend.length - 1] - lead.trend[0]
                            )}
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk & Intelligence Hub */}
                  <div className="flex items-center gap-3">
                    {lead.churnRisk && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'p-2.5 rounded-xl cursor-help transition-all duration-300 ring-1 ring-inset',
                              lead.churnRisk.risk_level === 'critical'
                                ? 'bg-status-error/10 text-status-error ring-status-error/20'
                                : lead.churnRisk.risk_level === 'high'
                                  ? 'bg-status-warning/10 text-status-warning ring-status-warning/20'
                                  : 'bg-info/10 text-info ring-info/20'
                            )}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                          <div className="space-y-2">
                            <p className="font-black text-[10px] uppercase tracking-widest text-status-error">
                              Risco de Churn Detectado
                            </p>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-status-error"
                                style={{ width: `${lead.churnRisk.risk_score}%` }}
                              />
                            </div>
                            {lead.churnRisk.factors.map((f, i) => (
                              <p
                                key={i}
                                className="text-[10px] font-medium leading-tight text-muted-foreground"
                              >
                                • {f}
                              </p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Factors Insight */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-2.5 rounded-xl bg-accent/50 hover:bg-accent text-muted-foreground transition-all duration-300 ring-1 ring-inset ring-white/5">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="w-64 p-4 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <p className="font-black text-[10px] uppercase tracking-widest">
                              Matriz de Contribuição
                            </p>
                          </div>
                          <div className="space-y-3">
                            {isServerScore ? (
                              <>
                                {lead.labels &&
                                  Object.entries(lead.labels).map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                        <span className="text-muted-foreground">
                                          {key}
                                        </span>
                                        <span>{String(val)}</span>
                                      </div>
                                      <Progress value={70} className="h-1" />
                                    </div>
                                  ))}
                                {!lead.labels && (
                                  <FactorBar
                                    label="Deal Momentum"
                                    value={
                                      /* eslint-disable no-restricted-syntax */
                                      (
                                        lead.factors as unknown as Record<
                                          string,
                                          number
                                        >
                                      ).dealValue
                                      /* eslint-enable no-restricted-syntax */
                                    }
                                    maxValue={25}
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                <FactorBar
                                  label="Firmographics"
                                  value={
                                    // eslint-disable-next-line no-restricted-syntax
                                    (lead.factors as unknown as Record<string, number>)
                                      .companySize
                                  }
                                  maxValue={20}
                                />
                                <FactorBar
                                  label="ICP Fit"
                                  value={
                                    // eslint-disable-next-line no-restricted-syntax
                                    (lead.factors as unknown as Record<string, number>)
                                      .industry
                                  }
                                  maxValue={15}
                                />
                                <FactorBar
                                  label="Engajamento"
                                  value={
                                    // eslint-disable-next-line no-restricted-syntax
                                    (lead.factors as unknown as Record<string, number>)
                                      .engagement
                                  }
                                  maxValue={25}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Explain IA Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectLead(lead.id);
                      }}
                      className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-all duration-500 shadow-sm"
                    >
                      <Brain className="h-4 w-4" />
                    </Button>

                    {/* Quick Status */}
                    <div className="hidden md:flex flex-col items-end gap-1 px-3">
                      <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                        Priority Status
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            lead.score > 70
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-muted-foreground/30'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[9px] font-black uppercase tracking-widest',
                            lead.score > 70
                              ? 'text-emerald-500'
                              : 'text-muted-foreground/60'
                          )}
                        >
                          {lead.score > 70 ? 'TOP PRIORITY' : 'MONITORING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
