import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { Kanban } from "lucide-react";

export default function Pipeline() {
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

      <PipelineBoard />
    </div>
  );
}
