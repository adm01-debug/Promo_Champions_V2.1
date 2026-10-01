import { ShieldAlert, AlertTriangle, Activity, CheckCircle2, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ScoredLead } from '@/hooks/useLeadScoring';

interface LeadChurnAlertsPanelProps {
  alerts: ScoredLead[];
  churnFilter: string;
  onChurnFilterChange: (filter: string) => void;
  onAttendAlert: (leadId: string) => void;
  onSelectLead: (leadId: string) => void;
  hasLeads: boolean;
  hotCount: number;
}

export function LeadChurnAlertsPanel({
  alerts,
  churnFilter,
  onChurnFilterChange,
  onAttendAlert,
  onSelectLead,
  hasLeads,
  hotCount,
}: LeadChurnAlertsPanelProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <Card
        variant="modern"
        className="overflow-hidden border-l-4 border-l-status-error bg-card/40 backdrop-blur-xl"
      >
        <CardHeader className="pb-2 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-status-error" />
              <CardTitle className="text-section-title text-sm font-black uppercase tracking-widest text-muted-foreground/80">
                Alertas de Churn
              </CardTitle>
              {alerts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-[9px] font-black animate-pulse"
                >
                  {alerts.length}
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7 rounded-md',
                      churnFilter === 'critical' &&
                        'bg-status-error/20 ring-1 ring-status-error/30'
                    )}
                    onClick={() =>
                      onChurnFilterChange(churnFilter === 'critical' ? 'all' : 'critical')
                    }
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-status-error" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] font-bold">
                  Apenas Críticos
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7 rounded-md',
                      churnFilter === 'high' &&
                        'bg-status-warning/20 ring-1 ring-status-warning/30'
                    )}
                    onClick={() =>
                      onChurnFilterChange(churnFilter === 'high' ? 'all' : 'high')
                    }
                  >
                    <Activity className="h-3.5 w-3.5 text-status-warning" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] font-bold">
                  Risco Alto
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {alerts.length > 0 ? (
            alerts.map(lead => (
              <div
                key={lead.id}
                className="group p-4 rounded-xl bg-status-error/5 border border-status-error/10 space-y-3 hover:bg-status-error/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-tighter truncate block max-w-[140px]">
                      {lead.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                      {lead.company || 'N/A'}
                    </span>
                  </div>
                  <Badge
                    variant="destructive"
                    className={cn(
                      'text-[8px] px-1.5 h-4 font-black',
                      lead.churnRisk?.risk_level === 'critical'
                        ? 'bg-status-error animate-pulse'
                        : 'bg-status-warning'
                    )}
                  >
                    {lead.churnRisk?.risk_level === 'critical'
                      ? 'CRÍTICO'
                      : 'ALTO RISCO'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">
                      Intensidade
                    </span>
                    <span className="text-status-error">
                      {lead.churnRisk?.risk_score}%
                    </span>
                  </div>
                  <Progress
                    value={lead.churnRisk?.risk_score}
                    className="h-1.5 bg-status-error/10"
                    indicatorClassName="bg-status-error shadow-[0_0_10px_rgba(var(--status-error-rgb),0.5)]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-status-error/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onAttendAlert(lead.id);
                      toast.success(`Alerta de ${lead.name} marcado como atendido.`);
                    }}
                    className="h-7 px-2 text-[9px] font-black uppercase tracking-widest hover:bg-status-success hover:text-white"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Atendido
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectLead(lead.id);
                    }}
                    className="h-7 px-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary"
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <ShieldAlert className="h-10 w-10 mx-auto text-emerald-500/20" />
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Base Segura: Sem Riscos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        variant="modern"
        className="overflow-hidden bg-primary/5 border-primary/20 glass"
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                Strategic Insight
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Predição Neural
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground font-medium italic">
            {hasLeads && hotCount > 0
              ? `Detectamos que ${hotCount} combatantes estão em ponto de conversão. Recomendamos foco total no fechamento imediato para bater as metas do período.`
              : 'O motor de inteligência está processando novos dados de mercado para gerar o próximo movimento estratégico.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
