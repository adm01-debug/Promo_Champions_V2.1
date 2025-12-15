import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Clock, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DealPreviewCardProps {
  dealId: string;
  clientName: string;
  productName: string;
  amount: number;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  lead: { label: 'Lead', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '🎯' },
  qualified: { label: 'Qualificado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '✅' },
  proposal: { label: 'Proposta', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '📄' },
  negotiation: { label: 'Negociação', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🤝' },
  closed_won: { label: 'Fechado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🎉' },
  closed_lost: { label: 'Perdido', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
};

interface RiskLevel {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  reasons: string[];
  action: {
    text: string;
    icon: string;
  };
}

function getRecommendedAction(
  status: string,
  daysWithoutActivity: number | null,
  daysInStage: number | null,
  riskLevel: 'low' | 'medium' | 'high'
): { text: string; icon: string } {
  // Stage-specific actions
  const stageActions: Record<string, { low: string; medium: string; high: string }> = {
    lead: {
      low: 'Continue qualificando o lead com perguntas exploratórias',
      medium: 'Agende uma ligação para avançar a qualificação',
      high: 'Entre em contato urgente antes de perder o timing',
    },
    qualified: {
      low: 'Prepare uma proposta personalizada para o cliente',
      medium: 'Envie uma proposta ou agende reunião de apresentação',
      high: 'Ligue agora para entender bloqueios e avançar',
    },
    proposal: {
      low: 'Faça follow-up para verificar se há dúvidas na proposta',
      medium: 'Agende reunião para discutir a proposta e objeções',
      high: 'Contato urgente - cliente pode estar avaliando concorrentes',
    },
    negotiation: {
      low: 'Trabalhe objeções finais e prepare o fechamento',
      medium: 'Ofereça condição especial para acelerar decisão',
      high: 'Ligação urgente para entender impedimentos ao fechamento',
    },
  };

  const actions = stageActions[status] || stageActions.qualified;
  
  // Activity-specific overrides
  if (daysWithoutActivity === null || daysWithoutActivity >= 14) {
    return { 
      text: 'Faça contato imediato - muito tempo sem interação', 
      icon: '🚨' 
    };
  }
  
  if (daysWithoutActivity >= 7) {
    return { 
      text: 'Registre uma atividade - cliente pode esfriar', 
      icon: '⚡' 
    };
  }

  const icons: Record<string, string> = {
    low: '✨',
    medium: '⚠️',
    high: '🔥',
  };

  return { 
    text: actions[riskLevel], 
    icon: icons[riskLevel] 
  };
}

function calculateRiskLevel(
  daysWithoutActivity: number | null,
  daysInStage: number | null,
  status: string
): RiskLevel {
  const reasons: string[] = [];
  let riskScore = 0;

  // Closed deals have no risk
  if (status === 'closed_won' || status === 'closed_lost') {
    return {
      level: 'low',
      label: 'Concluído',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      reasons: ['Deal já foi concluído'],
      action: { text: 'Deal finalizado - nenhuma ação necessária', icon: '✅' },
    };
  }

  // Activity risk
  if (daysWithoutActivity !== null) {
    if (daysWithoutActivity >= 14) {
      riskScore += 3;
      reasons.push(`${daysWithoutActivity} dias sem atividade`);
    } else if (daysWithoutActivity >= 7) {
      riskScore += 2;
      reasons.push(`${daysWithoutActivity} dias sem atividade`);
    } else if (daysWithoutActivity >= 3) {
      riskScore += 1;
      reasons.push(`${daysWithoutActivity} dias sem atividade`);
    }
  } else {
    riskScore += 2;
    reasons.push('Nenhuma atividade registrada');
  }

  // Stage stagnation risk
  if (daysInStage !== null) {
    const stageThresholds: Record<string, number> = {
      lead: 7,
      qualified: 10,
      proposal: 14,
      negotiation: 21,
    };
    const threshold = stageThresholds[status] || 14;
    
    if (daysInStage >= threshold * 2) {
      riskScore += 3;
      reasons.push(`${daysInStage} dias neste estágio (limite: ${threshold})`);
    } else if (daysInStage >= threshold) {
      riskScore += 2;
      reasons.push(`${daysInStage} dias neste estágio (limite: ${threshold})`);
    } else if (daysInStage >= threshold * 0.7) {
      riskScore += 1;
      reasons.push(`Próximo do limite de tempo no estágio`);
    }
  }

  let level: 'low' | 'medium' | 'high';
  let label: string;
  let color: string;
  let bgColor: string;
  let icon: React.ReactNode;

  if (riskScore >= 4) {
    level = 'high';
    label = 'Alto Risco';
    color = 'text-red-500';
    bgColor = 'bg-red-500/10';
    icon = <AlertTriangle className="h-3.5 w-3.5" />;
  } else if (riskScore >= 2) {
    level = 'medium';
    label = 'Atenção';
    color = 'text-amber-500';
    bgColor = 'bg-amber-500/10';
    icon = <AlertCircle className="h-3.5 w-3.5" />;
  } else {
    level = 'low';
    label = 'Baixo Risco';
    color = 'text-emerald-500';
    bgColor = 'bg-emerald-500/10';
    icon = <CheckCircle className="h-3.5 w-3.5" />;
  }

  const action = getRecommendedAction(status, daysWithoutActivity, daysInStage, level);

  return {
    level,
    label,
    color,
    bgColor,
    icon,
    reasons: reasons.length > 0 ? reasons : ['Deal em bom andamento'],
    action,
  };
}

export function DealPreviewCard({
  dealId,
  clientName,
  productName,
  amount,
  status,
}: DealPreviewCardProps) {
  // Fetch additional deal info: time in pipeline and last activity
  const { data: dealDetails } = useQuery({
    queryKey: ['deal-preview-details', dealId],
    queryFn: async () => {
      const [saleRes, activityRes, stageRes] = await Promise.all([
        supabase
          .from('sales')
          .select('created_at, updated_at')
          .eq('id', dealId)
          .maybeSingle(),
        supabase
          .from('activities')
          .select('created_at, activity_type')
          .eq('sale_id', dealId)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('deal_stage_history')
          .select('stage, entered_at')
          .eq('sale_id', dealId)
          .order('entered_at', { ascending: false })
          .limit(1),
      ]);

      return {
        createdAt: saleRes.data?.created_at,
        updatedAt: saleRes.data?.updated_at,
        lastActivity: activityRes.data?.[0],
        currentStageEntry: stageRes.data?.[0],
      };
    },
    staleTime: 30000,
  });

  const statusInfo = STATUS_LABELS[status] || { 
    label: status, 
    color: 'bg-muted text-muted-foreground', 
    icon: '📋' 
  };

  const daysInPipeline = dealDetails?.createdAt 
    ? differenceInDays(new Date(), new Date(dealDetails.createdAt))
    : null;

  const daysInCurrentStage = dealDetails?.currentStageEntry?.entered_at
    ? differenceInDays(new Date(), new Date(dealDetails.currentStageEntry.entered_at))
    : null;

  const daysWithoutActivity = dealDetails?.lastActivity?.created_at
    ? differenceInDays(new Date(), new Date(dealDetails.lastActivity.created_at))
    : null;

  const riskLevel = calculateRiskLevel(daysWithoutActivity, daysInCurrentStage, status);

  const lastActivityType: Record<string, string> = {
    call: 'Ligação',
    email: 'E-mail',
    meeting: 'Reunião',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    other: 'Outro',
  };

  return (
    <div className={cn(
      "rounded-lg border p-3 mb-3 animate-fade-in",
      riskLevel.level === 'high' 
        ? "border-red-500/30 bg-red-500/5" 
        : riskLevel.level === 'medium'
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-primary/20 bg-primary/5"
    )}>
      {/* Risk Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium mb-2 cursor-help",
              riskLevel.bgColor,
              riskLevel.color
            )}>
              {riskLevel.icon}
              {riskLevel.label}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="font-medium mb-1 text-xs">Análise de Risco</p>
            <ul className="text-[10px] space-y-0.5">
              {riskLevel.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-muted-foreground">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{statusInfo.icon}</span>
            <h4 className="font-semibold text-sm truncate">{clientName}</h4>
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Package className="h-3 w-3" />
            {productName}
          </p>
        </div>
        <Badge variant="secondary" className={cn('text-[10px] px-2 py-0.5 shrink-0', statusInfo.color)}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {/* Value */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 rounded bg-emerald-500/10">
            <DollarSign className="h-3 w-3 text-emerald-500" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Valor</span>
            <span className="font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
              }).format(amount)}
            </span>
          </div>
        </div>

        {/* Time in Pipeline */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 rounded bg-blue-500/10">
            <Clock className="h-3 w-3 text-blue-500" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">No Pipeline</span>
            <span className="font-medium">
              {daysInPipeline !== null ? `${daysInPipeline} dias` : '-'}
            </span>
          </div>
        </div>

        {/* Time in Current Stage */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 rounded bg-purple-500/10">
            <TrendingUp className="h-3 w-3 text-purple-500" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Neste Estágio</span>
            <span className="font-medium">
              {daysInCurrentStage !== null ? `${daysInCurrentStage} dias` : '-'}
            </span>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 rounded bg-amber-500/10">
            <Activity className="h-3 w-3 text-amber-500" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Última Atividade</span>
            <span className="font-medium">
              {dealDetails?.lastActivity ? (
                <span title={lastActivityType[dealDetails.lastActivity.activity_type] || dealDetails.lastActivity.activity_type}>
                  {formatDistanceToNow(new Date(dealDetails.lastActivity.created_at), {
                    addSuffix: false,
                    locale: ptBR,
                  })}
                </span>
              ) : (
                'Sem atividade'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      {status !== 'closed_won' && status !== 'closed_lost' && (
        <div className={cn(
          "mt-3 p-2 rounded-md border text-xs",
          riskLevel.level === 'high' 
            ? "bg-red-500/5 border-red-500/20" 
            : riskLevel.level === 'medium'
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-emerald-500/5 border-emerald-500/20"
        )}>
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">{riskLevel.action.icon}</span>
            <div>
              <span className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground block mb-0.5">
                Ação Recomendada
              </span>
              <p className={cn(
                "font-medium",
                riskLevel.level === 'high' 
                  ? "text-red-600 dark:text-red-400" 
                  : riskLevel.level === 'medium'
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
                {riskLevel.action.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
