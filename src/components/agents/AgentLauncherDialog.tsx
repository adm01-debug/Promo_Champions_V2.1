import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AGENT_META, type AgentTargetType, type AgentType } from "./agentHelpers";
import { useStartAgentRun } from "@/hooks/agents/useStartAgentRun";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTargetType?: AgentTargetType;
  defaultTargetId?: string;
  defaultAgentType?: AgentType;
}

export function AgentLauncherDialog({
  open,
  onOpenChange,
  defaultTargetType,
  defaultTargetId,
  defaultAgentType,
}: Props) {
  const [agentType, setAgentType] = useState<AgentType>(defaultAgentType ?? "qualify_lead");
  const [goal, setGoal] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const start = useStartAgentRun();

  const submit = async () => {
    await start.mutateAsync({
      agent_type: agentType,
      target_entity_type: defaultTargetType,
      target_entity_id: defaultTargetId,
      goal: goal.trim() || undefined,
      auto_execute: autoExecute,
    });
    onOpenChange(false);
    setGoal("");
  };

  const meta = AGENT_META[agentType];
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Acionar agente IA
          </DialogTitle>
          <DialogDescription>
            Defina um objetivo e o agente investigará e proporá ações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de agente</Label>
            <Select value={agentType} onValueChange={(v) => setAgentType(v as AgentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(AGENT_META).map(([k, m]) => (
                  <SelectItem key={k} value={k}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" /> {meta.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Objetivo (opcional)</Label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex.: Reativar lead após 30 dias sem contato com mensagem de valor."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="auto-exec">Executar automaticamente</Label>
              <p className="text-xs text-muted-foreground">
                Sem essa opção, ações ficam aguardando sua aprovação.
              </p>
            </div>
            <Switch id="auto-exec" checked={autoExecute} onCheckedChange={setAutoExecute} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={start.isPending}>
            {start.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar agente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
