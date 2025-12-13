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
import { usePipelineDeals, useMoveDeal, PIPELINE_STAGES, Deal, PipelineStage } from "@/hooks/usePipeline";
import { PipelineColumn } from "./PipelineColumn";
import { DealCard } from "./DealCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useDealProbabilities } from "@/hooks/useDealProbability";
import { useLeadScores, useCalculateLeadScores } from "@/hooks/useLeadScoring";
import { useActiveCadencesBySaleIds } from "@/hooks/useCadences";

export const PipelineBoard = () => {
  const { data: dealsByStage, isLoading, refetch, isRefetching } = usePipelineDeals();
  const moveDeal = useMoveDeal();
  const queryClient = useQueryClient();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  // Collect all deal IDs for probability calculation
  const allDealIds = useMemo(() => {
    if (!dealsByStage) return [];
    return PIPELINE_STAGES.flatMap(stage => 
      (dealsByStage[stage.id] || []).map(deal => deal.id)
    );
  }, [dealsByStage]);

  const { data: probabilities } = useDealProbabilities(allDealIds);
  const { data: leadScores } = useLeadScores(allDealIds);
  const { data: activeCadences } = useActiveCadencesBySaleIds(allDealIds);
  const calculateScores = useCalculateLeadScores();

  // Calculate lead scores when deals are loaded
  useEffect(() => {
    if (allDealIds.length > 0 && !leadScores) {
      calculateScores.mutate(allDealIds);
    }
  }, [allDealIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id as string;
    
    // Find the deal in any stage
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
    const targetStage = over.id as PipelineStage;

    // Check if dropping on a valid stage
    if (!PIPELINE_STAGES.some((s) => s.id === targetStage)) {
      // Dropped on another deal, find its stage
      for (const stage of PIPELINE_STAGES) {
        const dealInStage = dealsByStage?.[stage.id]?.find((d) => d.id === over.id);
        if (dealInStage) {
          moveDeal.mutate({ dealId, newStage: stage.id });
          return;
        }
      }
      return;
    }

    // Find current stage of the deal
    let currentStage: PipelineStage | null = null;
    for (const stage of PIPELINE_STAGES) {
      if (dealsByStage?.[stage.id]?.some((d) => d.id === dealId)) {
        currentStage = stage.id;
        break;
      }
    }

    if (currentStage && currentStage !== targetStage) {
      moveDeal.mutate({ dealId, newStage: targetStage });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[280px]">
            <Skeleton className="h-20 rounded-t-xl" />
            <div className="space-y-2 p-2">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalDeals = PIPELINE_STAGES.reduce(
    (sum, stage) => sum + (dealsByStage?.[stage.id]?.length || 0),
    0
  );

  const totalValue = PIPELINE_STAGES.reduce(
    (sum, stage) =>
      sum +
      (dealsByStage?.[stage.id]?.reduce((s, d) => s + d.amount, 0) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Total de Deals</p>
            <p className="text-2xl font-bold">{totalDeals}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold gradient-text">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalValue)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => calculateScores.mutate(allDealIds)}
            disabled={calculateScores.isPending}
          >
            <Zap className={`h-4 w-4 mr-2 ${calculateScores.isPending ? "animate-pulse" : ""}`} />
            Calcular Scores
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
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
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage?.[stage.id] || []}
              probabilities={probabilities}
              leadScores={leadScores}
              activeCadences={activeCadences}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="rotate-3 scale-105">
              <DealCard 
                deal={activeDeal} 
                probability={probabilities?.[activeDeal.id]}
                leadScore={leadScores?.[activeDeal.id]}
                activeCadence={activeCadences?.[activeDeal.id]}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
