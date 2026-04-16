import { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Play,
  Save,
  Zap,
  GitBranch,
  Cog,
  Trash2,
  Workflow as WorkflowIcon,
  Clock,
} from "lucide-react";
import {
  useWorkflows,
  useSaveWorkflow,
  useDeleteWorkflow,
  useExecuteWorkflow,
  useWorkflowExecutions,
  type Workflow,
} from "@/hooks/useWorkflows";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NODE_PALETTE = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "hsl(var(--primary))" },
  { type: "condition", label: "Condição", icon: GitBranch, color: "hsl(var(--status-warning))" },
  { type: "action", label: "Ação", icon: Cog, color: "hsl(var(--status-success))" },
] as const;

const initialNodes: Node[] = [
  {
    id: "trigger-1",
    type: "default",
    position: { x: 250, y: 40 },
    data: { label: "⚡ Trigger: Manual" },
    style: {
      background: "hsl(var(--primary) / 0.15)",
      border: "1px solid hsl(var(--primary))",
      color: "hsl(var(--foreground))",
      borderRadius: 12,
      padding: 12,
      fontWeight: 600,
    },
  },
];

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();
  const save = useSaveWorkflow();
  const del = useDeleteWorkflow();
  const exec = useExecuteWorkflow();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Workflow> | null>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { data: executions } = useWorkflowExecutions(editing?.id);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (conn: Connection) =>
      setEdges((eds) => addEdge({ ...conn, animated: true, style: { stroke: "hsl(var(--primary))" } }, eds)),
    [],
  );

  const openNew = () => {
    setEditing({
      name: "Novo Workflow",
      description: "",
      trigger_type: "manual",
      is_active: false,
      nodes: initialNodes,
      edges: [],
    });
    setNodes(initialNodes);
    setEdges([]);
    setOpen(true);
  };

  const openExisting = (wf: Workflow) => {
    setEditing(wf);
    setNodes(wf.nodes?.length ? wf.nodes : initialNodes);
    setEdges(wf.edges ?? []);
    setOpen(true);
  };

  const addNode = (type: "trigger" | "condition" | "action") => {
    const item = NODE_PALETTE.find((n) => n.type === type)!;
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: "default",
      position: { x: 200 + Math.random() * 200, y: 150 + nodes.length * 80 },
      data: { label: `${type === "trigger" ? "⚡" : type === "condition" ? "🔀" : "⚙️"} ${item.label}` },
      style: {
        background: `${item.color.replace(")", " / 0.15)")}`,
        border: `1px solid ${item.color}`,
        color: "hsl(var(--foreground))",
        borderRadius: 12,
        padding: 12,
        fontWeight: 600,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    if (!editing) return;
    await save.mutateAsync({
      ...editing,
      nodes: nodes as never,
      edges: edges as never,
    });
  };

  const stats = useMemo(() => {
    const total = workflows?.length ?? 0;
    const active = workflows?.filter((w) => w.is_active).length ?? 0;
    const totalRuns = workflows?.reduce((acc, w) => acc + (w.execution_count ?? 0), 0) ?? 0;
    return { total, active, totalRuns };
  }, [workflows]);

  return (
    <>
      <Helmet>
        <title>Workflows | Promo Champions</title>
        <meta name="description" content="Construa automações visuais drag-and-drop sem código." />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <WorkflowIcon className="h-7 w-7 text-primary" />
              Workflows
            </h1>
            <p className="text-muted-foreground">
              Builder visual de automações: <strong>Quando → Se → Então</strong>.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Novo workflow
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-status-success">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Execuções totais</p>
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !workflows?.length ? (
          <Card className="p-10 text-center border-dashed">
            <WorkflowIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Nenhum workflow ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira automação no-code.
            </p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Criar workflow
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((wf) => (
              <Card key={wf.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openExisting(wf)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                    <Badge variant={wf.is_active ? "default" : "secondary"} className="shrink-0">
                      {wf.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p className="line-clamp-2 min-h-[2.5em]">{wf.description || "Sem descrição"}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" /> {wf.execution_count} runs
                    </span>
                    {wf.last_executed_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(wf.last_executed_at), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Editar workflow" : "Novo workflow"}</SheetTitle>
          </SheetHeader>

          {editing && (
            <div className="space-y-4 mt-4">
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="wf-name">Nome</Label>
                  <Input
                    id="wf-name"
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="wf-desc">Descrição</Label>
                  <Textarea
                    id="wf-desc"
                    rows={2}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="wf-active"
                    checked={editing.is_active ?? false}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                  />
                  <Label htmlFor="wf-active">Ativo</Label>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Adicionar nó</Label>
                <div className="flex gap-2 flex-wrap">
                  {NODE_PALETTE.map((p) => (
                    <Button key={p.type} variant="outline" size="sm" onClick={() => addNode(p.type)}>
                      <p.icon className="h-4 w-4 mr-1" />
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] border rounded-lg overflow-hidden bg-muted/20">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background gap={16} color="hsl(var(--border))" />
                  <Controls />
                  <MiniMap zoomable pannable />
                </ReactFlow>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={save.isPending} className="gap-2">
                  <Save className="h-4 w-4" /> Salvar
                </Button>
                {editing.id && editing.is_active && (
                  <Button
                    variant="secondary"
                    onClick={() => exec.mutate({ workflowId: editing.id! })}
                    disabled={exec.isPending}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" /> Executar agora
                  </Button>
                )}
                {editing.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await del.mutateAsync(editing.id!);
                      setOpen(false);
                    }}
                    className="gap-2 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir
                  </Button>
                )}
              </div>

              {editing.id && executions && executions.length > 0 && (
                <div>
                  <Label className="mb-2 block">Últimas execuções</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {executions.map((e) => (
                      <Card key={e.id} className="p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <Badge variant={e.status === "success" ? "default" : "destructive"}>
                            {e.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(e.started_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                            {e.duration_ms != null && ` · ${e.duration_ms}ms`}
                          </span>
                        </div>
                        {e.step_log?.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {e.step_log.map((s, i) => (
                              <li key={i} className="text-muted-foreground">
                                <span className={s.status === "ok" ? "text-status-success" : s.status === "skipped" ? "text-status-warning" : "text-destructive"}>
                                  ●
                                </span>{" "}
                                {s.label} — {s.detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
