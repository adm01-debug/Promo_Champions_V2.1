import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Package, Calendar, TrendingUp, Flame, Thermometer, Play, Zap, Pause, X, MoreHorizontal, PlayCircle } from "lucide-react";
import { Deal } from "@/hooks/usePipeline";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getScoreColor, getScoreBgColor, getScoreLabel } from "@/hooks/useLeadScoring";
import { DealTimeline } from "./DealTimeline";
import { EnrollCadenceDialog } from "@/components/cadences/EnrollCadenceDialog";
import { Button } from "@/components/ui/button";
import { usePauseCadence, useCancelCadence, useResumeCadence } from "@/hooks/useCadences";

interface DealProbability {
  probability: number;
  factors: string[];
}

interface LeadScoreData {
  score: number;
  factors: {
    dealValue: number;
    stageProgress: number;
    timeInPipeline: number;
    category: number;
    recentActivity: number;
    labels?: Record<string, string>;
  };
}

interface ActiveCadenceInfo {
  cadenceName: string;
  currentStep: number;
  status: 'active' | 'paused';
}

interface DealCardProps {
  deal: Deal;
  probability?: DealProbability;
  leadScore?: LeadScoreData;
  activeCadence?: ActiveCadenceInfo;
}

export const DealCard = ({ deal, probability, leadScore, activeCadence }: DealCardProps) => {
  const pauseCadence = usePauseCadence();
  const cancelCadence = useCancelCadence();
  const resumeCadence = useResumeCadence();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-green-500 bg-green-500/10";
    if (prob >= 40) return "text-yellow-500 bg-yellow-500/10";
    return "text-red-500 bg-red-500/10";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        glass rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
        ${isDragging ? "opacity-50 scale-105 shadow-2xl z-50" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{deal.client_name}</h4>
            <div className="flex items-center gap-1.5">
              {leadScore && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold",
                        getScoreBgColor(leadScore.score),
                        getScoreColor(leadScore.score)
                      )}>
                        {leadScore.score >= 60 ? (
                          <Flame className="h-3 w-3" />
                        ) : (
                          <Thermometer className="h-3 w-3" />
                        )}
                        {leadScore.score}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p className="font-semibold mb-1">
                        Lead Score: {getScoreLabel(leadScore.score)}
                      </p>
                      <ul className="text-xs space-y-0.5">
                        {leadScore.factors.labels && Object.entries(leadScore.factors.labels).map(([key, label]) => {
                          const factorValue = leadScore.factors[key as keyof Omit<typeof leadScore.factors, 'labels'>];
                          return (
                            <li key={key} className="text-muted-foreground">
                              • {label} {typeof factorValue === 'number' ? `(+${factorValue})` : ''}
                            </li>
                          );
                        })}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {probability && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold",
                        getProbabilityColor(probability.probability)
                      )}>
                        <TrendingUp className="h-3 w-3" />
                        {probability.probability}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-semibold mb-1">Probabilidade de Fechamento</p>
                      <ul className="text-xs space-y-0.5">
                        {probability.factors.map((factor, i) => (
                          <li key={i} className="text-muted-foreground">• {factor}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-xs font-semibold text-primary whitespace-nowrap">
                {formatCurrency(deal.amount)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Package className="h-3 w-3" />
            <span className="truncate">{deal.product_name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(deal.updated_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <DealTimeline deal={deal} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase">
                {deal.category}
              </span>
              {activeCadence ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                        activeCadence.status === 'paused' 
                          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {activeCadence.status === 'paused' ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Zap className="h-3 w-3" />
                      )}
                      <span>
                        {activeCadence.status === 'paused' ? 'Pausada' : `Etapa ${activeCadence.currentStep + 1}`}
                      </span>
                      <MoreHorizontal className="h-3 w-3 ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <div className="px-2 py-1.5 border-b border-border">
                      <p className="text-xs font-medium">{activeCadence.cadenceName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {activeCadence.status === 'paused' ? 'Cadência pausada' : 'Cadência ativa'}
                      </p>
                    </div>
                    {activeCadence.status === 'paused' ? (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          resumeCadence.mutate(deal.id);
                        }}
                        disabled={resumeCadence.isPending}
                      >
                        <PlayCircle className="h-3.5 w-3.5 mr-2" />
                        Retomar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          pauseCadence.mutate(deal.id);
                        }}
                        disabled={pauseCadence.isPending}
                      >
                        <Pause className="h-3.5 w-3.5 mr-2" />
                        Pausar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelCadence.mutate(deal.id);
                      }}
                      disabled={cancelCadence.isPending}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="h-3.5 w-3.5 mr-2" />
                      Cancelar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <EnrollCadenceDialog
                  saleId={deal.id}
                  clientName={deal.client_name}
                  trigger={
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Iniciar Cadência</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
