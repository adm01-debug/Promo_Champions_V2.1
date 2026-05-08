import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Workflow, Plus, Play, Zap, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import {
  useAutomationWorkflows,
  useWorkflowRuns,
  useCreateWorkflow,
  useToggleWorkflow,
  useExecuteWorkflow,
  type AutomationWorkflow,
  type TriggerType,
  type ActionType,
  type WorkflowAction,
  type WorkflowCondition,
} from "@/hooks/automation/useAutomationWorkflows";

const triggerLabel: Record<TriggerType, string> = {
  deal_created: "Quando deal criado",
  stage_changed: "Quando estágio muda",
  activity_logged: "Quando atividade registrada",
  scheduled: "Agendado (cron)",
  manual: "Disparo manual",
  no_activity_days: "Sem atividade por X dias",
  proposal_opened: "Proposta Aberta (Gatilho de Intenção)",
  price_clicked: "Clique em Preço (Gatilho de Intenção)",
};

const actionLabel: Record<ActionType, string> = {
  create_task: "Criar tarefa",
  send_notification: "Enviar notificação",
  update_stage: "Atualizar estágio",
  log_activity: "Registrar atividade",
  assign_owner: "Atribuir responsável",
  create_call_now_task: "Tarefa 'Ligar Agora'",
};

const statusIcon = (s: string) => {
  if (s === "success") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (s === "failed") return <XCircle className="h-4 w-4 text-destructive" />;
  if (s === "partial") return <Clock className="h-4 w-4 text-warning" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
};

export default function AutomationBuilder() {
  const { data: workflows, isLoading } = useAutomationWorkflows();
  const [selected, setSelected] = useState<AutomationWorkflow | null>(null);
  const { data: runs } = useWorkflowRuns(selected?.id ?? null);
  const createWf = useCreateWorkflow();
  const toggleWf = useToggleWorkflow();
  const executeWf = useExecuteWorkflow();

  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "manual" as TriggerType,
    actions: [] as WorkflowAction[],
    conditions: [] as WorkflowCondition[],
  });
  const [actionType, setActionType] = useState<ActionType>("create_task");
  const [actionTitle, setActionTitle] = useState("");

  const addAction = () => {
    if (!actionTitle.trim()) return;
    setForm({
      ...form,
      actions: [...form.actions, { type: actionType, params: { title: actionTitle, description: "Gerado por automação" } }],
    });
    setActionTitle("");
  };

  const removeAction = (idx: number) => {
    setForm({ ...form, actions: form.actions.filter((_, i) => i !== idx) });
  };

  const handleCreate = () => {
    createWf.mutate(
      {
        name: form.name,
        description: form.description || null,
        trigger_type: form.trigger_type,
        actions: form.actions,
        conditions: form.conditions,
      },
      {
        onSuccess: () => {
          setNewOpen(false);
          setForm({ name: "", description: "", trigger_type: "manual", actions: [], conditions: [] });
        },
      },
    );
  };

  return (
    <>
      <Helmet>
        <title>Workflow Builder | Promo Champions</title>
        <meta name="description" content="Construa automações no-code entre módulos: gatilhos, condições e ações." />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title font-bold flex items-center gap-2">
              <Workflow className="h-7 w-7 text-primary" />
              Automation Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie automações no-code conectando gatilhos, condições e ações.
            </p>
          </div>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Workflow</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Criar Workflow</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Descrição</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div>
                  <Label>Gatilho</Label>
                  <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v as TriggerType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(triggerLabel) as TriggerType[]).map(t => (
                        <SelectItem key={t} value={t}>{triggerLabel[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-3 space-y-3">
                  <Label className="flex items-center gap-2"><Zap className="h-4 w-4" />Ações</Label>
                  <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(actionLabel) as ActionType[]).map(a => (
                          <SelectItem key={a} value={a}>{actionLabel[a]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Título / parâmetro" value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} />
                    <Button type="button" variant="outline" onClick={addAction}>Add</Button>
                  </div>
                  <div className="space-y-1">
                    {form.actions.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma ação adicionada.</p>}
                    {form.actions.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2 text-sm">
                        <span><Badge variant="outline" className="mr-2">{actionLabel[a.type]}</Badge>{String(a.params.title)}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeAction(i)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!form.name || form.actions.length === 0 || createWf.isPending}>
                  Criar Workflow
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Workflows ({workflows?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
              {!isLoading && (!workflows || workflows.length === 0) && (
                <p className="text-sm text-muted-foreground">Nenhum workflow criado ainda.</p>
              )}
              {workflows?.map(w => (
                <div
                  key={w.id}
                  className={`p-3 rounded-lg border transition-colors ${selected?.id === w.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                >
                  <button onClick={() => setSelected(w)} className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{w.name}</span>
                      <Switch
                        checked={w.is_active}
                        onCheckedChange={(checked) => toggleWf.mutate({ id: w.id, active: checked })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline">{triggerLabel[w.trigger_type]}</Badge>
                      <span>· {w.run_count} runs</span>
                    </div>
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            {!selected ? (
              <CardContent className="p-12 text-center text-muted-foreground">
                Selecione um workflow para ver detalhes e histórico de execuções.
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selected.name}</CardTitle>
                      {selected.description && <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>}
                    </div>
                    {selected.trigger_type === "manual" && (
                      <Button
                        size="sm"
                        onClick={() => executeWf.mutate({ workflowId: selected.id, payload: {} })}
                        disabled={executeWf.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />Executar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />Ações ({selected.actions.length})
                    </h3>
                    <div className="space-y-1">
                      {selected.actions.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                          <Badge variant="outline">{actionLabel[a.type]}</Badge>
                          <span className="text-muted-foreground">{String(a.params.title ?? "")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Últimas Execuções</h3>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {(!runs || runs.length === 0) && (
                        <p className="text-xs text-muted-foreground">Nenhuma execução ainda.</p>
                      )}
                      {runs?.map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-2 rounded border text-sm">
                          <div className="flex items-center gap-2">
                            {statusIcon(r.status)}
                            <span className="text-xs">{new Date(r.started_at).toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{r.duration_ms ?? 0}ms</span>
                            <Badge variant={r.status === "success" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>
                              {r.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
