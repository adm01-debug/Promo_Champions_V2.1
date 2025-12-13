import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal, PIPELINE_STAGES, PipelineStage } from "@/hooks/usePipeline";
import { DealCard } from "./DealCard";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  stage: typeof PIPELINE_STAGES[number];
  deals: Deal[];
}

export const PipelineColumn = ({ stage, deals }: PipelineColumnProps) => {
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
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* Column Header */}
      <div className="glass rounded-t-xl p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", stage.color)} />
            <h3 className="font-semibold text-sm">{stage.label}</h3>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Total: <span className="font-medium text-foreground">{formatCurrency(totalValue)}</span>
        </p>
      </div>

      {/* Column Content */}
      <div className={cn(
        "flex-1 p-2 space-y-2 min-h-[400px] rounded-b-xl transition-colors",
        isOver ? "bg-primary/5" : "bg-muted/30"
      )}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Arraste deals aqui</p>
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
