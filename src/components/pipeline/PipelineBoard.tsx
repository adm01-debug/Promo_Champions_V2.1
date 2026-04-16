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
import { usePipelines, usePipelineStages, usePipelineDealsByPipeline, useMoveDealMultiPipeline, PipelineDeal } from "@/hooks/useMultiplePipelines";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineSelector } from "./PipelineSelector";
import { DealCard } from "./DealCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDealProbabilities } from "@/hooks/useDealProbability";
import { useLeadScores, useCalculateLeadScores } from "@/hooks/useLeadScoring";
import { useActiveCadencesBySaleIds } from "@/hooks/useCadences";
import { useICPByClientName } from "@/hooks/useICPData";

const DEFAULT_PIPELINE_ID = '00000000-0000-0000-0000-000000000001';

export const PipelineBoard = () => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(DEFAULT_PIPELINE_ID);
  
  // Multi-pipeline data
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const { data: dynamicStages, isLoading: stagesLoading } = usePipelineStages(selectedPipelineId);
  const { data: multiDealsByStage, isLoading: multiDealsLoading, refetch: multiRefetch, isRefetching: multiRefetching } = usePipelineDealsByPipeline(selectedPipelineId, dynamicStages || []);
  const moveDealMulti = useMoveDealMultiPipeline();

  // Legacy data for default pipeline (for probabilities, scores, etc.)
  const { data: dealsByStage, isLoading: legacyLoading, refetch: legacyRefetch, isRefetching: legacyRefetching } = usePipelineDeals();
  const moveDeal = useMoveDeal();

  const isDefaultPipeline = selectedPipelineId === DEFAULT_PIPELINE_ID;
  const isLoading = pipelinesLoading || stagesLoading || (isDefaultPipeline ? legacyLoading : multiDealsLoading);
  const isRefetching = isDefaultPipeline ? legacyRefetching : multiRefetching;

  // Current stages to render
  const currentStages = useMemo(() => {
    if (isDefaultPipeline) {
      return PIPELINE_STAGES;
    }
    return (dynamicStages || []).map(s => ({
      id: s.name as PipelineStageId,
      label: s.label,
      color: s.color,
      order: s.stage_order,
      probability: s.probability,
    }));
  }, [isDefaultPipeline, dynamicStages]);

  // Current deals grouped by stage
  const currentDealsByStage = useMemo(() => {
    if (isDefaultPipeline) return dealsByStage;
    if (!multiDealsByStage) return undefined;
    // Convert PipelineDeal to Deal shape
    const result: Record<string, Deal[]> = {};
    for (const [stageName, deals] of Object.entries(multiDealsByStage)) {
      result[stageName] = deals.map(d => ({
        id: d.id,
        client_name: d.client_name,
        product_name: d.product_name,
        amount: d.amount,
        status: d.status,
        category: d.category,
        salesperson_id: d.salesperson_id,
        source: d.source,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));
    }
    return result;
  }, [isDefaultPipeline, dealsByStage, multiDealsByStage]);

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const allDealIds = useMemo(() => {
    if (!currentDealsByStage) return [];
    return currentStages.flatMap(stage => 
      (currentDealsByStage[stage.id] || []).map(deal => deal.id)
    );
  }, [currentDealsByStage, currentStages]);

  const { data: rawProbabilities } = useDealProbabilities();
  const { data: leadScoresData } = useLeadScores();
  const { data: activeCadences } = useActiveCadencesBySaleIds(allDealIds);
  const { data: icpByClientName } = useICPByClientName();
  const calculateScores = useCalculateLeadScores();

  const probabilities = useMemo(() => {
    if (!rawProbabilities) return undefined;
    const mapped: Record<string, { probability: number; factors: string[] }> = {};
    for (const [id, prob] of Object.entries(rawProbabilities)) {
      mapped[id] = { probability: prob, factors: [] };
    }
    return mapped;
  }, [rawProbabilities]);

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
    if (isDefaultPipeline && allDealIds.length > 0 && !leadScoresData) {
      calculateScores.mutate(allDealIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDealIds, leadScoresData, isDefaultPipeline]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id as string;
    for (const stage of currentStages) {
      const deal = currentDealsByStage?.[stage.id]?.find((d) => d.id === dealId);
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
    const targetStage = currentStages.find(s => s.id === overId);
    
    if (targetStage) {
      let currentStageId: string | null = null;
      for (const stage of currentStages) {
        if (currentDealsByStage?.[stage.id]?.some((d) => d.id === dealId)) {
          currentStageId = stage.id;
          break;
        }
      }
      if (currentStageId && currentStageId !== targetStage.id) {
        if (isDefaultPipeline) {
          moveDeal.mutate({ dealId, newStage: targetStage.id as PipelineStageId });
        } else {
          moveDealMulti.mutate({ dealId, newStage: targetStage.id, pipelineId: selectedPipelineId });
        }
      }
    } else {
      for (const stage of currentStages) {
        const dealInStage = currentDealsByStage?.[stage.id]?.find((d) => d.id === overId);
        if (dealInStage) {
          if (isDefaultPipeline) {
            moveDeal.mutate({ dealId, newStage: stage.id as PipelineStageId });
          } else {
            moveDealMulti.mutate({ dealId, newStage: stage.id, pipelineId: selectedPipelineId });
          }
          return;
        }
      }
    }
  };

  const handleRefetch = () => {
    if (isDefaultPipeline) legacyRefetch();
    else multiRefetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-28 rounded-lg" />)}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl glass border border-border/40">
          <div className="flex gap-6">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[280px]">
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

  const totalDeals = currentStages.reduce(
    (sum, stage) => sum + (currentDealsByStage?.[stage.id]?.length || 0), 0
  );
  const totalValue = currentStages.reduce(
    (sum, stage) => sum + (currentDealsByStage?.[stage.id]?.reduce((s, d) => s + d.amount, 0) || 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Pipeline Selector */}
      <PipelineSelector
        pipelines={pipelines || []}
        selectedId={selectedPipelineId}
        onSelect={setSelectedPipelineId}
        isLoading={pipelinesLoading}
      />

      {/* Stats Bar */}
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
          {isDefaultPipeline && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-colors"
              onClick={() => calculateScores.mutate(allDealIds)}
              disabled={calculateScores.isPending}
              aria-label="Calcular scores de leads"
            >
              <Zap className={`h-4 w-4 mr-2 ${calculateScores.isPending ? "animate-pulse text-primary" : ""}`} />
              Calcular Scores
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 hover:border-border hover:bg-muted/50 transition-colors"
            onClick={handleRefetch}
            disabled={isRefetching}
            aria-label="Atualizar pipeline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory md:snap-none">
          {currentStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={currentDealsByStage?.[stage.id] || []}
              probabilities={isDefaultPipeline ? probabilities : undefined}
              leadScores={isDefaultPipeline ? leadScores : undefined}
              activeCadences={isDefaultPipeline ? activeCadences : undefined}
              icpByClientName={isDefaultPipeline ? icpByClientName : undefined}
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
