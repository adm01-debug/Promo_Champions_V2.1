import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Target, Award, Percent, Plus, TrendingUp, Check, X, History as HistoryIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminComercial() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("metas");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const currentMonthDate = selectedMonth + "-01";

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: salespeople, isLoading: loadingSalespeople } = useQuery({
    queryKey: ["admin-salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase.from("salespeople").select("id, name, role").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: commissionConfigs, isLoading: loadingCommissions } = useQuery({
    queryKey: ["admin-commissions", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase.from("salesperson_commission_configs").select("*").eq("month", currentMonthDate);
      if (error) throw error;
      return data;
    },
  });

  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ["admin-goals", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales_goals").select("*").eq("month", currentMonthDate);
      if (error) throw error;
      return data;
    },
  });

  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ["admin-scoring-rules", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase.from("race_scoring_rules").select("*").eq("month", currentMonthDate).order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: approvalRequests, isLoading: loadingApprovals } = useQuery({
    queryKey: ["admin-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("commercial_approval_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").in("entity_type", ["goal", "scoring_rule", "commission"]).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const createApprovalMutation = useMutation({
    mutationFn: async ({ type, entityId, newValues, oldValues, justification }: any) => {
      const { error } = await supabase.from("commercial_approval_requests").insert({
        requester_id: user?.id,
        type,
        entity_id: entityId,
        competence_month: currentMonthDate,
        new_values: newValues,
        old_values: oldValues,
        justification,
        status: "pending"
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
      toast({ title: "Solicitação Enviada", description: "Alteração aguardando aprovação." });
    },
  });

  const processApprovalMutation = useMutation({
    mutationFn: async ({ requestId, status, justification }: { requestId: string; status: "approved" | "rejected"; justification?: string }) => {
      const { data: request, error: fetchError } = await supabase.from("commercial_approval_requests").select("*").eq("id", requestId).single();
      if (fetchError) throw fetchError;

      if (status === "approved") {
        const newValues = request.new_values as any;
        const entityId = request.entity_id as string;
        
        if (request.type === "goal") {
          await supabase.from("sales_goals").upsert([{ 
            salesperson_id: entityId, 
            month: request.competence_month, 
            goal_amount: newValues.amount 
          }], { onConflict: "salesperson_id,month" });
        } else if (request.type === "scoring_rule") {
          await supabase.from("race_scoring_rules").update({ 
            weight: newValues.weight, 
            points_per_unit: newValues.points_per_unit, 
            label: newValues.label 
          }).eq("id", entityId);
        } else if (request.type === "commission") {
          await supabase.from("salesperson_commission_configs").upsert([{ 
            salesperson_id: entityId, 
            month: request.competence_month, 
            rate: newValues.rate 
          }], { onConflict: "salesperson_id,month" });
        }

        await supabase.from("audit_logs").insert({
          actor_id: user?.id,
          action: `approved_${request.type}`,
          entity_type: request.type,
          entity_id: request.entity_id,
          changes: { from: request.old_values, to: request.new_values },
          metadata: { approval_request_id: requestId, justification }
        });
      }

      const { error } = await supabase.from("commercial_approval_requests").update({ status, approver_id: user?.id }).eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-goals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-scoring-rules"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast({ title: "Sucesso", description: "Ação realizada com sucesso." });
    },
  });

  const isLoading = loadingSalespeople || loadingGoals || loadingRules || loadingCommissions || loadingApprovals || loadingLogs;

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
          <div>
            <h1 className="text-3xl font-display font-black gradient-text uppercase tracking-tighter italic">Gestão Comercial</h1>
            <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Configuração de Metas, Pontuações e Comissões</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Mês de Referência</label>
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-44 bg-background/50 border-border/40 h-9" />
            </div>
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase text-[10px] py-2 px-3 self-end">
              {format(new Date(currentMonthDate), "MMMM / yyyy", { locale: ptBR })}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 p-1 border border-border/40 w-full md:w-auto h-auto">
            <TabsTrigger value="metas"><Target className="h-4 w-4 mr-2" /> Metas</TabsTrigger>
            <TabsTrigger value="pontuacao"><Award className="h-4 w-4 mr-2" /> Regras</TabsTrigger>
            <TabsTrigger value="comissoes"><Percent className="h-4 w-4 mr-2" /> Comissões</TabsTrigger>
            <TabsTrigger value="aprovacoes" className="relative">
              <Check className="h-4 w-4 mr-2" /> Aprovações
              {approvalRequests?.filter(r => r.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {approvalRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico"><Clock className="h-4 w-4 mr-2" /> Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="metas" className="space-y-4">
            <Card className="glass border-border/40">
              <CardHeader><CardTitle className="text-lg font-display uppercase tracking-tight">Metas por Vendedor</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Meta (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salespeople?.map((sp) => {
                      const goal = goals?.find(g => g.salesperson_id === sp.id);
                      return (
                        <TableRow key={sp.id}>
                          <TableCell className="font-bold">{sp.name}</TableCell>
                          <TableCell className="text-right">
                            <Input 
                              type="number" 
                              defaultValue={goal?.goal_amount || 0} 
                              className="text-right w-40 ml-auto"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val !== (goal?.goal_amount || 0)) {
                                  createApprovalMutation.mutate({ 
                                    type: "goal", 
                                    entityId: sp.id, 
                                    newValues: { amount: val }, 
                                    oldValues: { amount: goal?.goal_amount || 0 } 
                                  });
                                }
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pontuacao">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rules?.map((rule) => (
                <Card key={rule.id} className="bg-muted/20 border-border/20 group hover:border-primary/40 transition-all">
                  <CardHeader><CardTitle className="text-sm font-display">{rule.label}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Peso</label>
                        <Input 
                          type="number" step="0.1" defaultValue={rule.weight} 
                          onBlur={(e) => createApprovalMutation.mutate({ type: "scoring_rule", entityId: rule.id, newValues: { weight: parseFloat(e.target.value), points_per_unit: rule.points_per_unit, label: rule.label }, oldValues: { weight: rule.weight } })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Pts/Unidade</label>
                        <Input 
                          type="number" step="0.001" defaultValue={rule.points_per_unit} 
                          onBlur={(e) => createApprovalMutation.mutate({ type: "scoring_rule", entityId: rule.id, newValues: { weight: rule.weight, points_per_unit: parseFloat(e.target.value), label: rule.label }, oldValues: { points_per_unit: rule.points_per_unit } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comissoes">
            <Card className="glass border-border/40">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-center">Percentual (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salespeople?.map((sp) => {
                      const config = commissionConfigs?.find(c => c.salesperson_id === sp.id);
                      return (
                        <TableRow key={sp.id}>
                          <TableCell className="font-bold">{sp.name}</TableCell>
                          <TableCell className="text-center">
                            <Input 
                              type="number" step="0.1" defaultValue={config?.rate || 0} className="w-24 mx-auto text-center"
                              onBlur={(e) => createApprovalMutation.mutate({ type: "commission", entityId: sp.id, newValues: { rate: parseFloat(e.target.value) }, oldValues: { rate: config?.rate || 0 } })}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aprovacoes">
            <Card className="glass border-border/40">
              <CardHeader><CardTitle className="text-lg font-display">Solicitações Pendentes</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mês</TableHead>
                      <TableHead>Valores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalRequests?.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="capitalize font-bold">{req.type}</TableCell>
                        <TableCell>{format(new Date(req.competence_month), "MM/yyyy")}</TableCell>
                        <TableCell className="text-[10px] font-mono">
                          De: {JSON.stringify(req.old_values)} <br />
                          Para: {JSON.stringify(req.new_values)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === "pending" ? "outline" : req.status === "approved" ? "default" : "destructive"}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "approved" })} className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "rejected" })} variant="destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card className="glass border-border/40">
              <CardHeader><CardTitle className="text-lg font-display">Log de Auditoria Comercial</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Alterações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-[10px]">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                        <TableCell className="font-bold">{log.action}</TableCell>
                        <TableCell className="text-[10px] font-mono">
                          {JSON.stringify(log.changes)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}