import { useState } from "react";
import {
  useWorkflowRules,
  useCreateWorkflowRule,
  useToggleWorkflowRule,
  useDeleteWorkflowRule,
  TRIGGER_OPTIONS,
  ACTION_OPTIONS,
  TriggerType,
  ActionType,
} from "@/hooks/useWorkflowRules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Zap,
  Plus,
  ArrowRight,
  Trash2,
  Play,
  Pause,
  Clock,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function CreateWorkflowDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("deal_stagnant");
  const [actionType, setActionType] = useState<ActionType>("create_task");
  const [triggerDays, setTriggerDays] = useState("7");
  const [triggerStage, setTriggerStage] = useState("proposal");
  const [actionTaskTitle, setActionTaskTitle] = useState("Follow-up automático");
  const [actionNote, setActionNote] = useState("");

  const createRule = useCreateWorkflowRule();

  const handleCreate = () => {
    if (!name.trim()) return;

    const triggerConfig: Record<string, unknown> = {};
    if (triggerType === "deal_stagnant" || triggerType === "no_activity") {
      triggerConfig.days = parseInt(triggerDays) || 7;
    }
    if (triggerType === "stage_change") {
      triggerConfig.stage = triggerStage;
    }
    if (triggerType === "task_overdue") {
      triggerConfig.days_overdue = parseInt(triggerDays) || 1;
    }

    const actionConfig: Record<string, unknown> = {};
    if (actionType === "create_task") {
      actionConfig.task_title = actionTaskTitle;
      actionConfig.task_type = "follow_up";
      actionConfig.priority = "high";
    }
    if (actionType === "send_notification") {
      actionConfig.message = actionNote || `Automação: ${name}`;
    }
    if (actionType === "change_stage") {
      actionConfig.target_stage = triggerStage;
    }
    if (actionType === "add_note") {
      actionConfig.note = actionNote || "Nota automática adicionada";
    }

    createRule.mutate(
      { name, description, trigger_type: triggerType, trigger_config: triggerConfig, action_type: actionType, action_config: actionConfig },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  const selectedTrigger = TRIGGER_OPTIONS.find(t => t.value === triggerType);
  const selectedAction = ACTION_OPTIONS.find(a => a.value === actionType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Automação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Zap className="h-5 w-5 text-primary" />
            Criar Automação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Automação</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Follow-up deal parado" />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição da regra..." />
          </div>

          <Separator />

          {/* Trigger */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">⚡</span> SE (Gatilho)
            </Label>
            <Select value={triggerType} onValueChange={(v) => setTriggerType(v as TriggerType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrigger && (
              <p className="text-xs text-muted-foreground">{selectedTrigger.description}</p>
            )}
            {(triggerType === "deal_stagnant" || triggerType === "no_activity" || triggerType === "task_overdue") && (
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Dias:</Label>
                <Input type="number" value={triggerDays} onChange={e => setTriggerDays(e.target.value)} className="w-20 h-8" min="1" />
              </div>
            )}
            {triggerType === "stage_change" && (
              <Select value={triggerStage} onValueChange={setTriggerStage}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Lead</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="negotiation">Negociação</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Visual connector */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-px bg-border" />
              <ChevronRight className="h-4 w-4" />
              <span className="text-xs font-semibold">ENTÃO</span>
              <ChevronRight className="h-4 w-4" />
              <div className="w-8 h-px bg-border" />
            </div>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">🎯</span> ENTÃO (Ação)
            </Label>
            <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAction && (
              <p className="text-xs text-muted-foreground">{selectedAction.description}</p>
            )}
            {actionType === "create_task" && (
              <Input value={actionTaskTitle} onChange={e => setActionTaskTitle(e.target.value)} placeholder="Título da tarefa" className="h-8" />
            )}
            {(actionType === "send_notification" || actionType === "add_note") && (
              <Input value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder="Mensagem/nota..." className="h-8" />
            )}
          </div>

          <Button onClick={handleCreate} disabled={!name.trim() || createRule.isPending} className="w-full gap-2">
            <Zap className="h-4 w-4" />
            {createRule.isPending ? "Criando..." : "Criar Automação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowBuilder() {
  const { data: rules, isLoading } = useWorkflowRules();
  const toggleRule = useToggleWorkflowRule();
  const deleteRule = useDeleteWorkflowRule();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Automações</h1>
            <p className="text-sm text-muted-foreground">Crie regras "se X, então Y" para automatizar seu pipeline</p>
          </div>
        </div>
        <CreateWorkflowDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{rules?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total de Regras</p>
          </CardContent>
        </Card>
        <Card className="border-status-success/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-status-success">{rules?.filter(r => r.is_active).length || 0}</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{rules?.reduce((s, r) => s + r.executions_count, 0) || 0}</p>
            <p className="text-xs text-muted-foreground">Execuções</p>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-3">
          {rules && rules.length > 0 ? (
            rules.map(rule => {
              const trigger = TRIGGER_OPTIONS.find(t => t.value === rule.trigger_type);
              const action = ACTION_OPTIONS.find(a => a.value === rule.action_type);

              return (
                <Card key={rule.id} className={cn("transition-all", !rule.is_active && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold truncate">{rule.name}</h3>
                          <Badge variant={rule.is_active ? "default" : "secondary"} className="text-[10px]">
                            {rule.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                        )}

                        {/* Visual flow */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-xs font-medium">
                            <span>{trigger?.icon}</span>
                            <span className="text-primary">{trigger?.label}</span>
                            {(rule.trigger_config as Record<string, unknown>)?.days && (
                              <Badge variant="outline" className="text-[9px] h-4 px-1">
                                {String((rule.trigger_config as Record<string, unknown>).days)}d
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-success/10 text-xs font-medium">
                            <span>{action?.icon}</span>
                            <span className="text-status-success">{action?.label}</span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-2.5 w-2.5" />
                            {rule.executions_count} execuções
                          </span>
                          {rule.last_executed_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, is_active: checked })}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover automação?</AlertDialogTitle>
                              <AlertDialogDescription>
                                A automação "{rule.name}" será removida permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRule.mutate(rule.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="font-display font-semibold text-lg mb-1">Nenhuma automação criada</h3>
                <p className="text-sm text-muted-foreground mb-4">Crie sua primeira regra "se/então" para automatizar ações no pipeline</p>
                <CreateWorkflowDialog />
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
