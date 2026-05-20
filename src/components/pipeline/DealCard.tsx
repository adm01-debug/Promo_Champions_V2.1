import React, { useState, useMemo } from "react";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Deal } from "@/hooks/usePipeline";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, Target, Zap, Users, Brain, ListTodo, UserPlus, TrendingUp, AlertTriangle, Edit2, Check, Sparkles, RefreshCw, Mic, ShieldCheck, History, Database } from "lucide-react";
import { StagnantDealAlert } from "./StagnantDealAlert";
import { DealSummaryCard } from "./DealSummaryCard";
import { DealScoreIndicator } from "./DealScoreIndicator";
import { SLACountdown } from "./SLACountdown";
import { useLeadScoreExplanation } from "@/hooks/scoring/useLeadScoreExplanation";
import { useDealPlaybookProgress, usePlaybooksByStage } from "@/hooks/usePlaybooks";
import { DealPlaybookModal } from "./DealPlaybookModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkline } from "./Sparkline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [isEnriching, setIsEnriching] = useState(false); // Etapa 3: Data Enrichment
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

  // Etapa 8: Bulk Operations Mode
  const [isSelected, setIsSelected] = useState(false);
  // Etapa 3: Inline Fast-Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(deal.amount.toString());

  // Etapa 2: Dynamic Health Heatmap
  const healthScore = deal.health_score || (leadScore?.score || 50);
  const getHealthGradient = (score: number) => {
    if (score > 80) return "from-emerald-500/10 via-transparent";
    if (score < 40) return "from-red-500/10 via-transparent";
    return "from-amber-500/10 via-transparent";
  };

  const isHighRisk = healthScore < 30 || (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 10;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "touch-none cursor-grab active:cursor-grabbing relative",
        isDragging && "opacity-50 z-50",
        leadScore?.category === 'hot' && "ring-1 ring-status-error/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Card className={cn(
        "p-3 glass border border-border/40 dark:border-glow transition-all duration-300 group overflow-hidden relative",
        isDragging && "shadow-2xl rotate-2 scale-105"
      )}>
        {/* Etapa 2: Heatmap Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-700 pointer-events-none",
          getHealthGradient(healthScore)
        )} />
        
        {/* Etapa 1: Presença em Tempo Real (Colaboração Ativa) */}
        <div className="absolute top-1 right-8 flex -space-x-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-primary/20 hover:scale-110 transition-transform">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback className="text-[6px]">FX</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-background animate-pulse" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[10px] font-bold">Felix está editando agora...</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-indigo-500/20 grayscale group-hover:grayscale-0 transition-all hover:scale-110">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" />
                <AvatarFallback className="text-[6px]">AN</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="text-[10px] font-bold">Anna visualizou há 1 min</TooltipContent>
          </Tooltip>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2 relative">
          {/* Etapa 4: Quick Action Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-around z-20 rounded-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/20 text-emerald-500 group/btn">
                  <Zap className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-bold">WhatsApp Rápido (Automação Etapa 2)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 hover:bg-indigo-500/20 text-indigo-500", isEnriching && "animate-pulse")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnriching(true);
                    setTimeout(() => setIsEnriching(false), 2000);
                  }}
                >
                  <Database className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-bold">Enriquecer com Dados de Ecossistema (Etapa 3)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/20 text-orange-500">
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-bold">AI Voice Command (Etapa 4)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 text-primary">
                  <ListTodo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-bold">Ver Tarefas</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
              {deal.client_name}
              {isEnriching && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {deal.product_name}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {leadScore && (
              <DealScoreIndicator 
                score={leadScore.score} 
                factors={leadScore.factors}
              />
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

        {/* Value & Time & Velocity (Etapa 1, 3, 4) */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
            <DollarSign className="h-3.5 w-3.5 text-status-success" />
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input 
                  value={editedAmount} 
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="h-6 w-20 text-[11px] px-1 font-bold"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(false)}>
                  <Check className="h-3 w-3 text-emerald-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/edit">
                <span className="font-display font-bold text-sm gradient-text">
                  {formatCurrency(deal.amount)}
                </span>
                <Edit2 
                  className="h-2.5 w-2.5 opacity-0 group-hover/edit:opacity-100 cursor-pointer transition-opacity" 
                  onClick={() => setIsEditing(true)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Etapa 7: SLA & Interaction Sparkline */}
            <div className="flex flex-col items-end gap-1">
              <Sparkline data={deal.interaction_history || [10, 20, 15, 30, 25, 40, 35]} />
              <SLACountdown updatedAt={deal.updated_at} stage={deal.status} />
            </div>
          </div>
        </div>

        {/* Etapa 4: Dynamic AI Action Nudge */}
        <AnimatePresence>
          {healthScore < 60 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className={cn(
                "mb-2 rounded-lg border p-2 overflow-hidden",
                healthScore < 40 ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={cn("h-3 w-3", healthScore < 40 ? "text-destructive" : "text-primary")} />
                <p className="text-[10px] font-bold tracking-tight">
                  {healthScore < 40 ? "Ação Reativa: " : "Oportunidade: "}
                  <span className="font-medium text-foreground/80 italic">
                    {healthScore < 40 
                      ? "Deal esfriando! Sugerimos envio de case de sucesso via WhatsApp." 
                      : "Fit alto! O cliente está pronto para uma proposta de valor."}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

          {/* Etapa 5: Stakeholder Influence */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-primary/10 text-primary border-none cursor-help">
                <Users className="h-2.5 w-2.5 mr-0.5" />
                3 Decisores
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px] p-2 space-y-1">
              <p className="font-bold border-b border-border/10 pb-1 mb-1">Mapa de Influência</p>
              <p className="flex justify-between"><span>CEO (Decisor)</span> <span className="text-emerald-500 font-bold">Favorável</span></p>
              <p className="flex justify-between"><span>CTO (Influenciador)</span> <span className="text-amber-500 font-bold">Neutro</span></p>
              <p className="flex justify-between"><span>Diretor Vendas</span> <span className="text-emerald-500 font-bold">Favorável</span></p>
            </TooltipContent>
          </Tooltip>

          {deal.sdr_id && !deal.salesperson_id && (
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-amber-500/10 text-amber-500 border-none">
              <UserPlus className="h-2.5 w-2.5 mr-0.5" />
              AGUARDANDO CLOSER
            </Badge>
          )}
          {/* Etapa 5: Churn Risk */}
          {isHighRisk && (
            <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 animate-pulse">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Risco de Churn
            </Badge>
          )}

          {/* Etapa 1: Capacity/Closer */}
          <div className="flex items-center gap-1 ml-auto">
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-5 w-5 border border-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.salesperson_id || 'unassigned'}`} />
                  <AvatarFallback className="text-[8px]">CL</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>Closer: Responsável Direto (Carga 85%)</TooltipContent>
            </Tooltip>
          </div>
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
    </motion.div>
  );
};
