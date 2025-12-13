import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal, PIPELINE_STAGES, PipelineStage } from "@/hooks/usePipeline";
import { DealCard } from "./DealCard";
import { cn } from "@/lib/utils";

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

interface PipelineColumnProps {
  stage: typeof PIPELINE_STAGES[number];
  deals: Deal[];
  probabilities?: Record<string, DealProbability>;
  leadScores?: Record<string, LeadScoreData>;
  activeCadences?: Record<string, ActiveCadenceInfo>;
}

export const PipelineColumn = ({ stage, deals, probabilities, leadScores, activeCadences }: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-xl transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
    >
      {/* Column Header */}
      <div className="glass rounded-t-xl p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full shadow-sm", stage.color)} />
            <h3 className="font-semibold text-sm">{stage.label}</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Total: <span className="font-semibold gradient-text">{formatCurrency(totalValue)}</span>
        </p>
      </div>

      {/* Column Content */}
      <div className={cn(
        "flex-1 p-2.5 space-y-2.5 min-h-[400px] rounded-b-xl transition-all duration-200",
        isOver ? "bg-primary/10 border-primary/20" : "bg-muted/20"
      )}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
              <p className="text-xs text-muted-foreground">Arraste deals aqui</p>
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                probability={probabilities?.[deal.id]}
                leadScore={leadScores?.[deal.id]}
                activeCadence={activeCadences?.[deal.id]}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
