import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useApprovalRequests,
  useApprovalWorkflows,
  useCreateApprovalRequest,
  useDecideApproval,
  useCreateWorkflow,
} from "@/hooks/admin/useApprovalWorkflows";
import { useUserRoles } from "@/hooks/useUserRoles";
import { CheckCircle, XCircle, Clock, ShieldCheck, Plus, FileCheck, AlertTriangle, DollarSign, Percent } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/transitions/PageTransition";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "bg-status-warning/20 text-status-warning border-status-warning/30" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-status-success/20 text-status-success border-status-success/30" },
  rejected: { label: "Rejeitado", icon: XCircle, color: "bg-destructive/20 text-destructive border-destructive/30" },
  expired: { label: "Expirado", icon: AlertTriangle, color: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-muted text-muted-foreground border-border" },
};

const TYPE_LABELS: Record<string, string> = {
  discount: "Desconto",
  proposal: "Proposta",
  exception: "Exceção",
  refund: "Reembolso",
};

const ApprovalWorkflowsPage = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [decisionDialog, setDecisionDialog] = useState<{ id: string; action: "approved" | "rejected" } | null>(null);
  const [comments, setComments] = useState("");
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const { isAdminOrManager } = useUserRoles();

  const { data: requests, isLoading: loadingReqs } = useApprovalRequests(statusFilter);
  const { data: workflows } = useApprovalWorkflows();
  const createRequest = useCreateApprovalRequest();
  const decide = useDecideApproval();
  const createWorkflow = useCreateWorkflow();

  // New request form
  const [reqForm, setReqForm] = useState({ workflow_id: "", deal_name: "", requested_value: "", original_value: "", justification: "" });

  // New workflow form
  const [wfForm, setWfForm] = useState({ name: "", workflow_type: "discount", threshold_amount: "", required_approvers: "1", description: "" });

  const handleSubmitRequest = () => {
    if (!reqForm.workflow_id || !reqForm.requested_value) return;
    const orig = parseFloat(reqForm.original_value) || undefined;
    const req = parseFloat(reqForm.requested_value);
    createRequest.mutate({
      workflow_id: reqForm.workflow_id,
      deal_name: reqForm.deal_name || undefined,
      requested_value: req,
      original_value: orig,
      discount_percentage: orig ? Math.round(((orig - req) / orig) * 100 * 100) / 100 : undefined,
      justification: reqForm.justification || undefined,
    }, {
      onSuccess: () => {
        setNewRequestOpen(false);
        setReqForm({ workflow_id: "", deal_name: "", requested_value: "", original_value: "", justification: "" });
      },
    });
  };

  const handleDecision = () => {
    if (!decisionDialog) return;
    decide.mutate({
      request_id: decisionDialog.id,
      decision: decisionDialog.action,
      comments: comments || undefined,
    }, {
      onSuccess: () => {
        setDecisionDialog(null);
        setComments("");
      },
    });
  };

  const handleCreateWorkflow = () => {
    if (!wfForm.name) return;
    createWorkflow.mutate({
      name: wfForm.name,
      workflow_type: wfForm.workflow_type as any,
      threshold_amount: parseFloat(wfForm.threshold_amount) || null,
      required_approvers: parseInt(wfForm.required_approvers) || 1,
      description: wfForm.description || null,
    }, {
      onSuccess: () => {
        setNewWorkflowOpen(false);
        setWfForm({ name: "", workflow_type: "discount", threshold_amount: "", required_approvers: "1", description: "" });
      },
    });
  };

  const pendingCount = useMemo(() => requests?.filter(r => r.status === "pending").length ?? 0, [requests]);

  const fmtCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <>
      <Helmet>
        <title>Aprovações | Promo Champions</title>
        <meta name="description" content="Fluxos de aprovação de descontos, propostas e exceções comerciais." />
      </Helmet>
      <PageTransition>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-page-title font-display">Aprovações</h1>
                <p className="text-sm text-muted-foreground">Fluxos de aprovação de descontos e propostas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nova Solicitação</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Solicitação de Aprovação</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workflow</Label>
                      <Select value={reqForm.workflow_id} onValueChange={v => setReqForm(p => ({ ...p, workflow_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione o fluxo" /></SelectTrigger>
                        <SelectContent>
                          {workflows?.map(w => (
                            <SelectItem key={w.id} value={w.id}>{w.name} ({TYPE_LABELS[w.workflow_type]})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Deal / Cliente</Label>
                      <Input value={reqForm.deal_name} onChange={e => setReqForm(p => ({ ...p, deal_name: e.target.value }))} placeholder="Nome do deal ou cliente" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Original (R$)</Label>
                        <Input type="number" value={reqForm.original_value} onChange={e => setReqForm(p => ({ ...p, original_value: e.target.value }))} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Solicitado (R$)</Label>
                        <Input type="number" value={reqForm.requested_value} onChange={e => setReqForm(p => ({ ...p, requested_value: e.target.value }))} placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Justificativa</Label>
                      <Textarea value={reqForm.justification} onChange={e => setReqForm(p => ({ ...p, justification: e.target.value }))} placeholder="Por que esta aprovação é necessária?" rows={3} />
                    </div>
                    <Button onClick={handleSubmitRequest} className="w-full" disabled={createRequest.isPending}>
                      {createRequest.isPending ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {isAdminOrManager && (
                <Dialog open={newWorkflowOpen} onOpenChange={setNewWorkflowOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2"><FileCheck className="h-4 w-4" /> Novo Workflow</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Criar Workflow de Aprovação</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={wfForm.name} onChange={e => setWfForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Desconto acima de 15%" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select value={wfForm.workflow_type} onValueChange={v => setWfForm(p => ({ ...p, workflow_type: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discount">Desconto</SelectItem>
                              <SelectItem value="proposal">Proposta</SelectItem>
                              <SelectItem value="exception">Exceção</SelectItem>
                              <SelectItem value="refund">Reembolso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Aprovadores</Label>
                          <Input type="number" min="1" max="5" value={wfForm.required_approvers} onChange={e => setWfForm(p => ({ ...p, required_approvers: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Threshold (R$)</Label>
                        <Input type="number" value={wfForm.threshold_amount} onChange={e => setWfForm(p => ({ ...p, threshold_amount: e.target.value }))} placeholder="Acima deste valor requer aprovação" />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea value={wfForm.description} onChange={e => setWfForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                      </div>
                      <Button onClick={handleCreateWorkflow} className="w-full" disabled={createWorkflow.isPending}>
                        Criar Workflow
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pendentes", value: pendingCount, icon: Clock, color: "text-status-warning" },
              { label: "Aprovadas", value: requests?.filter(r => r.status === "approved").length ?? 0, icon: CheckCircle, color: "text-status-success" },
              { label: "Rejeitadas", value: requests?.filter(r => r.status === "rejected").length ?? 0, icon: XCircle, color: "text-destructive" },
              { label: "Workflows", value: workflows?.length ?? 0, icon: FileCheck, color: "text-primary" },
            ].map(s => (
              <Card key={s.label} className="glass border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Filter Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="pending" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Pendentes</TabsTrigger>
                <TabsTrigger value="approved" className="gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Aprovadas</TabsTrigger>
                <TabsTrigger value="rejected" className="gap-1.5"><XCircle className="h-3.5 w-3.5" /> Rejeitadas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Requests List */}
          <motion.div variants={itemVariants} className="space-y-3">
            {loadingReqs ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : !requests?.length ? (
              <Card className="p-8 text-center glass border-border/40">
                <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-display font-semibold">Nenhuma solicitação</p>
                <p className="text-sm text-muted-foreground">Não há solicitações com este filtro.</p>
              </Card>
            ) : (
              requests.map(req => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Card key={req.id} className="glass border-border/40 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </Badge>
                            {req.deal_name && (
                              <span className="text-sm font-medium truncate">{req.deal_name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-display font-bold">{fmtCurrency(req.requested_value)}</span>
                            </span>
                            {req.original_value && (
                              <span className="text-muted-foreground line-through text-xs">{fmtCurrency(req.original_value)}</span>
                            )}
                            {req.discount_percentage && (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <Percent className="h-3 w-3" />
                                {req.discount_percentage}% desc.
                              </Badge>
                            )}
                          </div>
                          {req.justification && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.justification}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        {isAdminOrManager && req.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="gap-1 text-status-success border-status-success/30 hover:bg-status-success/10"
                              onClick={() => setDecisionDialog({ id: req.id, action: "approved" })}>
                              <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => setDecisionDialog({ id: req.id, action: "rejected" })}>
                              <XCircle className="h-3.5 w-3.5" /> Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </motion.div>

          {/* Decision Dialog */}
          <Dialog open={!!decisionDialog} onOpenChange={() => { setDecisionDialog(null); setComments(""); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {decisionDialog?.action === "approved" ? "✅ Aprovar Solicitação" : "❌ Rejeitar Solicitação"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Comentários (opcional)</Label>
                  <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Adicione um comentário..." rows={3} />
                </div>
                <Button onClick={handleDecision} className="w-full" disabled={decide.isPending}
                  variant={decisionDialog?.action === "rejected" ? "destructive" : "default"}>
                  {decide.isPending ? "Processando..." : decisionDialog?.action === "approved" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </PageTransition>
    </>
  );
};

export default ApprovalWorkflowsPage;
