import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks } from "lucide-react";
import { useInsightTaskCreation } from "@/hooks/win-loss/useInsightTaskCreation";
import { useActiveSalespeople } from "@/hooks/win-loss/useWinLossData";
import type { TaskPriority } from "@/hooks/tasks/types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  insightId: string;
  insightTitle: string;
  insightDescription?: string | null;
  severity?: "opportunity" | "risk" | "info" | null;
  defaultAssigneeId?: string | null;
}

const dueOptions = [3, 7, 14, 30];

export function InsightCreateTaskModal({
  open,
  onOpenChange,
  insightId,
  insightTitle,
  insightDescription,
  severity,
  defaultAssigneeId,
}: Props) {
  const create = useInsightTaskCreation();
  const { data: people = [] } = useActiveSalespeople();

  const [title, setTitle] = useState(insightTitle);
  const [description, setDescription] = useState(insightDescription ?? "");
  const [days, setDays] = useState<number>(7);
  const [priority, setPriority] = useState<TaskPriority>(
    severity === "risk" ? "high" : severity === "opportunity" ? "medium" : "low",
  );
  const [assignee, setAssignee] = useState<string>(defaultAssigneeId ?? "");

  useEffect(() => {
    if (open) {
      setTitle(insightTitle);
      setDescription(insightDescription ?? "");
      setPriority(severity === "risk" ? "high" : severity === "opportunity" ? "medium" : "low");
      setAssignee(defaultAssigneeId ?? "");
    }
  }, [open, insightTitle, insightDescription, severity, defaultAssigneeId]);

  const handleCreate = async () => {
    await create.mutateAsync({
      insightId,
      title,
      description,
      severity,
      salespersonId: assignee || null,
      dueInDays: days,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Nova tarefa do insight
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Prazo</Label>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dueOptions.map((d) => <SelectItem key={d} value={String(d)}>{d} dias</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Responsável</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="(Sem responsável)" /></SelectTrigger>
              <SelectContent>
                {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => void handleCreate()} disabled={create.isPending || !title.trim()}>
            {create.isPending ? "Criando…" : "Criar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
