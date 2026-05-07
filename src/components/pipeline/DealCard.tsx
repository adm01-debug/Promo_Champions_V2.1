import React from "react";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Deal } from "@/hooks/usePipeline";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, Target, Zap, Users, Brain } from "lucide-react";
import { StagnantDealAlert } from "./StagnantDealAlert";
import { DealSummaryCard } from "./DealSummaryCard";
import { useLeadScoreExplanation } from "@/hooks/scoring/useLeadScoreExplanation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  probability?: {
    probability: number;
    factors: string[];
  };
  leadScore?: {
    score: number;
    category: 'hot' | 'warm' | 'cold';
    factors: string[];
  };
  activeCadence?: {
    cadenceName: string;
    currentStep: number;
    status: 'active' | 'paused';
  };
  icpData?: {
    is_icp_match: boolean;
    grupo_nicho?: string;
  };
}

export const DealCard = ({ deal, probability, leadScore, activeCadence, icpData }: DealCardProps) => {
  const { data: explanation } = useLeadScoreExplanation(leadScore ? deal.id : null);
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
      notation: "compact",
    }).format(value);
  };

  const getScoreColor = (category?: 'hot' | 'warm' | 'cold') => {
    switch (category) {
      case 'hot': return 'bg-status-error/20 text-status-error border-status-error/30';
      case 'warm': return 'bg-status-warning/20 text-status-warning border-status-warning/30';
      case 'cold': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <Card className={cn(
        "p-3 glass border border-border/40 dark:border-glow hover-lift transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10 group overflow-hidden",
        isDragging && "shadow-2xl shadow-primary/30 rotate-2 scale-105 border-primary/50"
      )}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {deal.client_name}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {deal.product_name}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {leadScore && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={cn("text-[10px] cursor-help", getScoreColor(leadScore.category))}>
                    <Target className="h-3 w-3 mr-1" />
                    {leadScore.score}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[260px] p-3">
                  {explanation ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <Brain className="h-3 w-3 text-primary" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Top drivers</span>
                      </div>
                      {explanation.top_drivers.slice(0, 3).map((d) => (
                        <div key={d.factor} className="flex items-center justify-between text-[11px]">
                          <span className="truncate">{d.label}</span>
                          <span className={cn(
                            "font-mono font-semibold ml-2",
                            d.direction === "positive" ? "text-status-success" : "text-destructive"
                          )}>
                            {d.direction === "positive" ? "+" : "-"}{d.contribution_pct}%
                          </span>
                        </div>
                      ))}
                      {explanation.narrative && (
                        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 leading-snug">
                          {explanation.narrative}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Calculando explicação IA…</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
            <QuickActionsMenu deal={deal} />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-center gap-1.5 mb-2">
          <DollarSign className="h-3.5 w-3.5 text-status-success" />
          <span className="font-display font-bold text-sm gradient-text">
            {formatCurrency(deal.amount)}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {deal.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/70 text-foreground/80 border border-border/50">
              {deal.category}
            </Badge>
          )}
          
          {probability && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              {probability.probability}%
            </Badge>
          )}

          {icpData?.is_icp_match && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-status-success/30 text-status-success">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              ICP
            </Badge>
          )}
        </div>

        {/* Active Cadence */}
        {activeCadence && (
          <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
            <span className="text-primary font-medium">{activeCadence.cadenceName}</span>
            <span className="ml-1">• Etapa {activeCadence.currentStep}</span>
          </div>
        )}

        {/* AI Copilot - Stagnant Deal Alert */}
        <StagnantDealAlert
          updatedAt={deal.updated_at || deal.created_at}
          clientName={deal.client_name}
          amount={deal.amount}
        />

        {/* AI Deal Summary */}
        <DealSummaryCard
          dealId={deal.id}
          clientName={deal.client_name}
          amount={deal.amount}
          status={deal.status}
          createdAt={deal.created_at}
          updatedAt={deal.updated_at || deal.created_at}
        />

        {/* Date */}
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(deal.created_at), "dd MMM", { locale: ptBR })}</span>
        </div>
      </Card>
    </div>
  );
};
