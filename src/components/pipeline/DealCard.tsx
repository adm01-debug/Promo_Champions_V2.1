import React, { useState, useMemo } from "react";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Deal } from "@/hooks/usePipeline";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, Target, Zap, Users, Brain, ListTodo, UserPlus } from "lucide-react";
import { StagnantDealAlert } from "./StagnantDealAlert";
import { DealSummaryCard } from "./DealSummaryCard";
import { useLeadScoreExplanation } from "@/hooks/scoring/useLeadScoreExplanation";
import { useDealPlaybookProgress, usePlaybooksByStage } from "@/hooks/usePlaybooks";
import { DealPlaybookModal } from "./DealPlaybookModal";
import { Button } from "@/components/ui/button";
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
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const { data: explanation } = useLeadScoreExplanation(leadScore ? deal.id : null);
  const { data: playbooks } = usePlaybooksByStage(deal.status);
  const { data: progress } = useDealPlaybookProgress(deal.id);

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

  const allPlaybookItems = playbooks?.flatMap(pb => pb.items || []) || [];
  const completedCount = progress?.length || 0;
  const totalCount = allPlaybookItems.length;

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
  // Etapa 8: Bulk Operations Mode
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setIsSelected(!isSelected)}
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing relative",
        isDragging && "opacity-50",
        // Etapa 3: "Hot Deal" Pulse Animation
        leadScore?.category === 'hot' && "animate-[pulse_3s_ease-in-out_infinite] ring-1 ring-status-error/50",
        isSelected && "ring-2 ring-primary ring-offset-2 scale-[0.98]"
      )}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-30 bg-primary text-white p-1 rounded-full shadow-lg">
          <Zap className="h-3 w-3 fill-current" />
        </div>
      )}
      <Card className={cn(
        "p-3 glass border border-border/40 dark:border-glow hover-lift transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10 group overflow-hidden",
        isDragging && "shadow-2xl shadow-primary/30 rotate-2 scale-105 border-primary/50"
      )}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2 relative">
          {/* Etapa 4: Quick Action Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-around z-20 rounded-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/20 text-emerald-500">
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>WhatsApp Rápido</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 text-primary">
                  <Calendar className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agendar Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-indigo-500/20 text-indigo-500">
                  <ListTodo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver Tarefas</TooltipContent>
            </Tooltip>
          </div>

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
                <TooltipContent side="left" className="max-w-[280px] p-0 border-none bg-transparent shadow-2xl">
                  {/* Etapa 6: Contextual AI Insights Tooltip */}
                  <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-primary/10 p-3 border-b border-primary/10">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest italic">AI STRATEGIC INSIGHT</span>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-3">
                      {explanation ? (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Principais Motivadores</span>
                            {explanation.top_drivers.slice(0, 3).map((d) => (
                              <div key={d.factor} className="flex items-center justify-between text-[11px] bg-muted/30 p-1.5 rounded-md border border-border/10">
                                <span className="font-medium">{d.label}</span>
                                <span className={cn(
                                  "font-black",
                                  d.direction === "positive" ? "text-emerald-500" : "text-destructive"
                                )}>
                                  {d.direction === "positive" ? "+" : "-"}{d.contribution_pct}%
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-2 border-t border-border/20">
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">⚠️ OBJEÇÃO PREVISTA</span>
                            <p className="text-[11px] font-medium leading-relaxed mt-1 text-foreground/90">
                              O cliente pode questionar o <span className="text-primary font-bold italic">prazo de implementação</span>. 
                              <span className="text-emerald-500"> DICA:</span> Enfatize o suporte VIP 24h.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 py-4">
                          <Zap className="h-4 w-4 text-primary animate-spin" />
                          <p className="text-[11px] text-muted-foreground font-medium italic">Processando neuro-análise do deal...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 flex items-center gap-1 hover:bg-primary/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaybookOpen(true);
                  }}
                >
                  <ListTodo className={cn("h-3.5 w-3.5", completedCount > 0 ? "text-emerald-500" : "text-muted-foreground")} />
                  {totalCount > 0 && (
                    <span className="text-[9px] font-bold">
                      {completedCount}/{totalCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Abrir Playbook de Execução</p>
              </TooltipContent>
            </Tooltip>
            <QuickActionsMenu deal={deal} />
          </div>
        </div>

        {/* Value & Time in Stage Indicator (Etapa 1) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-status-success" />
            <span className="font-display font-bold text-sm gradient-text">
              {formatCurrency(deal.amount)}
            </span>
          </div>
          <div className={cn(
            "text-[9px] font-black px-1.5 py-0.5 rounded-md border",
            (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 7 
              ? "bg-red-500/10 text-red-500 border-red-500/20" 
              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          )}>
            {Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24))}D
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {deal.category && (
            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-muted/50 text-foreground/80 border-none">
              {deal.category}
            </Badge>
          )}
          
          {probability && (
            <Badge variant="outline" className={cn(
              "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 border-none",
              probability.probability > 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
            )}>
              <Zap className="h-2.5 w-2.5 mr-0.5 fill-current" />
              {probability.probability}% CHANCE DE GANHO
            </Badge>
          )}

          {icpData?.is_icp_match && (
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-indigo-500/10 text-indigo-500 border-none">
              <Users className="h-2.5 w-2.5 mr-0.5" />
              ICP ALVO
            </Badge>
          )}

          {deal.sdr_id && !deal.salesperson_id && (
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-amber-500/10 text-amber-500 border-none">
              <UserPlus className="h-2.5 w-2.5 mr-0.5" />
              AGUARDANDO CLOSER
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

        <DealPlaybookModal
          open={playbookOpen}
          onOpenChange={setPlaybookOpen}
          dealId={deal.id}
          clientName={deal.client_name}
          stageId={deal.status}
        />
      </Card>
    </div>
  );
};
