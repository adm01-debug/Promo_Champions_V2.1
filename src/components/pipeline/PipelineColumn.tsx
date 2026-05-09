import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal, PipelineStageConfig } from "@/hooks/usePipeline";
import { DealCard } from "./DealCard";
import { cn } from "@/lib/utils";
import { ICPData } from "@/hooks/useICPData";

interface DealProbability {
  probability: number;
  factors: string[];
}

interface LeadScoreData {
  score: number;
  category: 'hot' | 'warm' | 'cold';
  factors: string[];
}

interface ActiveCadenceInfo {
  cadenceName: string;
  currentStep: number;
  status: 'active' | 'paused';
}

interface PipelineColumnProps {
  stage: PipelineStageConfig;
  deals: Deal[];
  probabilities?: Record<string, DealProbability>;
  leadScores?: Record<string, LeadScoreData>;
  activeCadences?: Record<string, ActiveCadenceInfo>;
  icpByClientName?: Map<string, ICPData>;
}

export const PipelineColumn = ({ stage, deals, probabilities, leadScores, activeCadences, icpByClientName }: PipelineColumnProps) => {
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
        "flex flex-col min-w-[300px] max-w-[320px] rounded-2xl transition-all duration-500 snap-center h-full",
        "bg-gradient-to-b from-card/40 to-background/20 backdrop-blur-sm border border-border/20",
        isOver && "ring-2 ring-primary ring-offset-4 ring-offset-background scale-[1.03] shadow-2xl shadow-primary/20 z-10"
      )}
    >

      {/* Column Header */}
      <div className="relative rounded-t-2xl p-5 border-b border-border/10 overflow-hidden group">
        {/* Animated accent line */}
        <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500", isOver ? "w-full" : "w-1/3", stage.color.replace('bg-', 'bg-'))} />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] ring-2 ring-background animate-pulse", stage.color)} />
            <h3 className="font-display font-black text-xs uppercase tracking-widest italic group-hover:text-primary transition-colors">{stage.label}</h3>
          </div>
          <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
            {deals.length}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
          VOL: <span className="font-display font-black text-foreground">{formatCurrency(totalValue)}</span>
        </p>
      </div>


      {/* Column Content */}
      <div className={cn(
        "flex-1 p-2.5 space-y-2.5 min-h-[400px] rounded-b-xl transition-all duration-300 border-x border-b border-transparent",
        isOver ? "bg-primary/10 border-primary/30" : "bg-muted/20 dark:bg-muted/10"
      )}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-b from-primary/10 to-primary/5 transition-all hover:border-primary/40 hover:bg-primary/15">
              <p className="text-xs text-muted-foreground font-medium">Arraste oportunidades aqui</p>
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                probability={probabilities?.[deal.id]}
                leadScore={leadScores?.[deal.id]}
                activeCadence={activeCadences?.[deal.id]}
                icpData={icpByClientName?.get(deal.client_name.toLowerCase()) as { is_icp_match: boolean; grupo_nicho?: string } | undefined}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
