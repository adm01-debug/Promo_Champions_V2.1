import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AtRiskDealsPanel } from "@/components/pipeline/AtRiskDealsPanel";
import { Kanban } from "lucide-react";
import { usePipelineDeals } from "@/hooks/usePipeline";
import { PipelineLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";

export default function Pipeline() {
  const { isLoading } = usePipelineDeals();

  if (isLoading) {
    return <PipelineLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl gradient-primary">
          <Kanban className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            Arraste os deals entre as colunas para atualizar o status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <PipelineBoard />
        </div>
        <div className="xl:col-span-1">
          <AtRiskDealsPanel />
        </div>
      </div>
    </div>
  );
}
