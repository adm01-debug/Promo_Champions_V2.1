import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

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
        client_id: d.client_id,
        client_name: d.client_name,
        product_name: d.product_name,
        amount: d.amount,
        status: d.status,
        category: d.category,
        salesperson_id: d.salesperson_id,
        sdr_id: (d as any).sdr_id || null,
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
      <div className="relative flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-card/80 via-card/40 to-background/50 backdrop-blur-xl border border-border/20 shadow-2xl overflow-hidden group">
        {/* Background glow overlay */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
        
        <div className="flex gap-12 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">Comandos Ativos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black tracking-tighter">{totalDeals}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Implementados</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center">
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent mr-12" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">Liquidez do Pipeline</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-black tracking-tighter gradient-text">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(totalValue)}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase">Volume</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          {isDefaultPipeline && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 px-5 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={() => calculateScores.mutate(allDealIds)}
              disabled={calculateScores.isPending}
            >
              <Zap className={cn("h-3.5 w-3.5 mr-2", calculateScores.isPending ? "animate-pulse" : "fill-current")} />
              Analisar Leads
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-11 px-5 rounded-xl border-border/40 bg-muted/20 text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all duration-300"
            onClick={handleRefetch}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isRefetching ? "animate-spin" : "")} />
            Sincronizar
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
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory md:snap-none 2xl:grid 2xl:grid-cols-7 2xl:overflow-x-visible">
          {currentStages.map((stage) => (
            <div key={stage.id} className="2xl:min-w-0">
              <PipelineColumn
                stage={stage}
                deals={currentDealsByStage?.[stage.id] || []}
                probabilities={isDefaultPipeline ? probabilities : undefined}
                leadScores={isDefaultPipeline ? leadScores : undefined}
                activeCadences={isDefaultPipeline ? activeCadences : undefined}
                icpByClientName={isDefaultPipeline ? icpByClientName : undefined}
              />
            </div>
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
