import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { usePipelineDeals, useMoveDeal, PIPELINE_STAGES, Deal, PipelineStageId } from "@/hooks/usePipeline";
import { PipelineColumn } from "./PipelineColumn";
import { DealCard } from "./DealCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useDealProbabilities } from "@/hooks/useDealProbability";
import { useLeadScores, useCalculateLeadScores } from "@/hooks/useLeadScoring";
import { useActiveCadencesBySaleIds } from "@/hooks/useCadences";
import { useICPByClientName } from "@/hooks/useICPData";

export const PipelineBoard = () => {
  const { data: dealsByStage, isLoading, refetch, isRefetching } = usePipelineDeals();
  const moveDeal = useMoveDeal();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const allDealIds = useMemo(() => {
    if (!dealsByStage) return [];
    return PIPELINE_STAGES.flatMap(stage => 
      (dealsByStage[stage.id] || []).map(deal => deal.id)
    );
  }, [dealsByStage]);

  const { data: rawProbabilities } = useDealProbabilities();
  const { data: leadScoresData } = useLeadScores();
  const { data: activeCadences } = useActiveCadencesBySaleIds(allDealIds);
  const { data: icpByClientName } = useICPByClientName();
  const calculateScores = useCalculateLeadScores();

  // Transform probabilities from Record<string, number> to Record<string, DealProbability>
  const probabilities = useMemo(() => {
    if (!rawProbabilities) return undefined;
    const mapped: Record<string, { probability: number; factors: string[] }> = {};
    for (const [id, prob] of Object.entries(rawProbabilities)) {
      mapped[id] = { probability: prob, factors: [] };
    }
    return mapped;
  }, [rawProbabilities]);

  // Transform ScoredLead[] to Record<string, LeadScoreData>
  const leadScores = useMemo(() => {
    if (!leadScoresData || !Array.isArray(leadScoresData)) return undefined;
    const mapped: Record<string, { score: number; category: 'hot' | 'warm' | 'cold'; factors: string[] }> = {};
    for (const lead of leadScoresData) {
      mapped[lead.id] = {
        score: lead.score,
        category: lead.category.toLowerCase() as 'hot' | 'warm' | 'cold',
        factors: Object.entries(lead.factors).map(([k, v]) => `${k}: ${v}`),
      };
    }
    return mapped;
  }, [leadScoresData]);

  useEffect(() => {
    if (allDealIds.length > 0 && !leadScoresData) {
      calculateScores.mutate(allDealIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDealIds, leadScoresData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id as string;
    for (const stage of PIPELINE_STAGES) {
      const deal = dealsByStage?.[stage.id]?.find((d) => d.id === dealId);
      if (deal) {
        setActiveDeal(deal);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    const targetStage = PIPELINE_STAGES.find(s => s.id === overId);
    
    if (targetStage) {
      let currentStageId: PipelineStageId | null = null;
      for (const stage of PIPELINE_STAGES) {
        if (dealsByStage?.[stage.id]?.some((d) => d.id === dealId)) {
          currentStageId = stage.id;
          break;
        }
      }
      if (currentStageId && currentStageId !== targetStage.id) {
        moveDeal.mutate({ dealId, newStage: targetStage.id });
      }
    } else {
      for (const stage of PIPELINE_STAGES) {
        const dealInStage = dealsByStage?.[stage.id]?.find((d) => d.id === overId);
        if (dealInStage) {
          moveDeal.mutate({ dealId, newStage: stage.id });
          return;
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl glass border border-border/40">
          <div className="flex gap-6">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-36" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="min-w-[280px]">
              <Skeleton className="h-20 rounded-t-xl" />
              <div className="space-y-2 p-2 bg-muted/20 rounded-b-xl">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalDeals = PIPELINE_STAGES.reduce(
    (sum, stage) => sum + (dealsByStage?.[stage.id]?.length || 0), 0
  );
  const totalValue = PIPELINE_STAGES.reduce(
    (sum, stage) => sum + (dealsByStage?.[stage.id]?.reduce((s, d) => s + d.amount, 0) || 0), 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl glass border border-border/40 dark:border-glow card-elevated">
        <div className="flex gap-8">
          <div className="relative">
            <p className="text-xs text-muted-foreground font-medium mb-1">Total de Deals</p>
            <p className="text-2xl font-display font-bold">{totalDeals}</p>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-px bg-border/50" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Valor Total no Pipeline</p>
            <p className="text-2xl font-display font-bold gradient-text">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-colors"
            onClick={() => calculateScores.mutate(allDealIds)}
            disabled={calculateScores.isPending}
          >
            <Zap className={`h-4 w-4 mr-2 ${calculateScores.isPending ? "animate-pulse text-primary" : ""}`} />
            Calcular Scores
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 hover:border-border hover:bg-muted/50 transition-colors"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory md:snap-none">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage?.[stage.id] || []}
              probabilities={probabilities}
              leadScores={leadScores}
              activeCadences={activeCadences}
              icpByClientName={icpByClientName}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="rotate-3 scale-105 shadow-2xl shadow-primary/20">
              <DealCard 
                deal={activeDeal} 
                probability={probabilities?.[activeDeal.id]}
                leadScore={leadScores?.[activeDeal.id]}
                activeCadence={activeCadences?.[activeDeal.id]}
                icpData={icpByClientName?.get(activeDeal.client_name.toLowerCase()) as { is_icp_match: boolean; grupo_nicho?: string } | undefined}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
