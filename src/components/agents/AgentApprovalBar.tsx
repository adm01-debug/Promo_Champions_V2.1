import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useApproveAgentRun, useCancelAgentRun } from "@/hooks/agents/useApproveAgentRun";

interface Props {
  runId: string;
}

export function AgentApprovalBar({ runId }: Props) {
  const approve = useApproveAgentRun();
  const cancel = useCancelAgentRun();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
      <p className="text-sm flex-1">
        O agente propôs ações. Revise os passos e aprove para continuar.
      </p>
      <Button size="sm" variant="outline" onClick={() => cancel.mutate(runId)} disabled={cancel.isPending}>
        <X className="h-4 w-4 mr-1" /> Cancelar
      </Button>
      <Button size="sm" onClick={() => approve.mutate(runId)} disabled={approve.isPending}>
        <Check className="h-4 w-4 mr-1" /> Aprovar plano
      </Button>
    </div>
  );
}
