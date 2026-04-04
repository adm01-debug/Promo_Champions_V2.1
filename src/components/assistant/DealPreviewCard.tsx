import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Activity, TrendingUp, Package, Sparkles, History, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DealChatHistory } from './DealChatHistory';
import { calculateRiskLevel, STATUS_LABELS, ACTIVITY_TYPE_LABELS } from './dealRiskCalculator';

interface DealPreviewCardProps {
  dealId: string;
  clientName: string;
  productName: string;
  amount: number;
  status: string;
  onAskAssistant?: (question: string) => void;
}

export function DealPreviewCard({ dealId, clientName, productName, amount, status, onAskAssistant }: DealPreviewCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  const { data: dealDetails } = useQuery({
    queryKey: ['deal-preview-details', dealId],
    queryFn: async () => {
      const [saleRes, activityRes, stageRes] = await Promise.all([
        supabase.from('sales').select('created_at, updated_at').eq('id', dealId).maybeSingle(),
        supabase.from('activities').select('created_at, activity_type').eq('sale_id', dealId).order('created_at', { ascending: false }).limit(1),
        supabase.from('deal_stage_history').select('stage, entered_at').eq('sale_id', dealId).order('entered_at', { ascending: false }).limit(1),
      ]);
      return { createdAt: saleRes.data?.created_at, lastActivity: activityRes.data?.[0], currentStageEntry: stageRes.data?.[0] };
    },
    staleTime: 30000,
  });

  const statusInfo = STATUS_LABELS[status] || { label: status, color: 'bg-muted text-muted-foreground', icon: '📋' };
  const daysInPipeline = dealDetails?.createdAt ? differenceInDays(new Date(), new Date(dealDetails.createdAt)) : null;
  const daysInCurrentStage = dealDetails?.currentStageEntry?.entered_at ? differenceInDays(new Date(), new Date(dealDetails.currentStageEntry.entered_at)) : null;
  const daysWithoutActivity = dealDetails?.lastActivity?.created_at ? differenceInDays(new Date(), new Date(dealDetails.lastActivity.created_at)) : null;
  const riskLevel = calculateRiskLevel(daysWithoutActivity, daysInCurrentStage, status);

  return (
    <div className={cn("rounded-lg border p-3 mb-3 animate-fade-in",
      riskLevel.level === 'high' ? "border-destructive/30 bg-destructive/5" : riskLevel.level === 'medium' ? "border-warning/30 bg-warning/5" : "border-primary/20 bg-primary/5"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium mb-2 cursor-help", riskLevel.bgColor, riskLevel.color)}>
              {riskLevel.icon}{riskLevel.label}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="font-medium mb-1 text-xs">Análise de Risco</p>
            <ul className="text-[10px] space-y-0.5">{riskLevel.reasons.map((reason, i) => <li key={i} className="flex items-start gap-1"><span className="text-muted-foreground">•</span>{reason}</li>)}</ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">{statusInfo.icon}</span><h4 className="font-semibold text-sm truncate">{clientName}</h4></div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Package className="h-3 w-3" />{productName}</p>
        </div>
        <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5 shrink-0', statusInfo.color)}>{statusInfo.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { icon: DollarSign, label: "Valor", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(amount), color: "emerald-500" },
          { icon: Clock, label: "No Pipeline", value: daysInPipeline !== null ? `${daysInPipeline} dias` : '-', color: "blue-500" },
          { icon: TrendingUp, label: "Neste Estágio", value: daysInCurrentStage !== null ? `${daysInCurrentStage} dias` : '-', color: "purple-500" },
          { icon: Activity, label: "Última Atividade", value: dealDetails?.lastActivity ? formatDistanceToNow(new Date(dealDetails.lastActivity.created_at), { addSuffix: false, locale: ptBR }) : 'Sem atividade', color: "amber-500", title: dealDetails?.lastActivity ? ACTIVITY_TYPE_LABELS[dealDetails.lastActivity.activity_type] : undefined },
        ].map(({ icon: Icon, label, value, color, title }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            <div className={`p-1 rounded bg-${color}/10`}><Icon className={`h-3 w-3 text-${color}`} /></div>
            <div><span className="text-muted-foreground block text-[10px]">{label}</span><span className="font-medium" title={title}>{value}</span></div>
          </div>
        ))}
      </div>

      {status !== 'closed_won' && status !== 'closed_lost' && (
        <div className={cn("mt-3 p-2 rounded-md border text-xs",
          riskLevel.level === 'high' ? "bg-destructive/5 border-destructive/20" : riskLevel.level === 'medium' ? "bg-warning/5 border-warning/20" : "bg-success/5 border-success/20"
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-base shrink-0">{riskLevel.action.icon}</span>
              <div>
                <span className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground block mb-0.5">Ação Recomendada</span>
                <p className={cn("font-medium",
                  riskLevel.level === 'high' ? "text-destructive" : riskLevel.level === 'medium' ? "text-warning" : "text-success"
                )}>{riskLevel.action.text}</p>
              </div>
            </div>
            {onAskAssistant && (
              <button onClick={() => onAskAssistant(`Como posso "${riskLevel.action.text.toLowerCase()}" para o cliente ${clientName}? Me dê dicas práticas e um script.`)}
                className="shrink-0 p-1.5 rounded-md transition-colors hover:bg-primary/10 text-primary flex items-center gap-1 text-[10px] font-medium" title="Perguntar ao assistente">
                <Sparkles className="h-3.5 w-3.5" /><span className="hidden sm:inline">Perguntar</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-border/30 pt-2">
        <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowHistory(!showHistory)}>
          <div className="flex items-center gap-1.5"><History className="h-3 w-3" /><span>Histórico de perguntas</span></div>
          {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        {showHistory && (<div className="mt-2"><DealChatHistory dealId={dealId} clientName={clientName} onSelectQuestion={(question) => onAskAssistant?.(question)} /></div>)}
      </div>
    </div>
  );
}
