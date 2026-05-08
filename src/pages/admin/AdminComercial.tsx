import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Target, Award, Percent, Users, Plus, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminComercial() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("metas");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const currentMonthDate = selectedMonth + "-01";

  // Fetch Current User for requester_id
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch Salespeople
  const { data: salespeople, isLoading: loadingSalespeople } = useQuery({
    queryKey: ["admin-salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, role, is_active")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Commission Configs for selected month
  const { data: commissionConfigs, isLoading: loadingCommissions } = useQuery({
    queryKey: ["admin-commissions", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salesperson_commission_configs")
        .select("*")
        .eq("month", currentMonthDate);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Goals
  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ["admin-goals", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonthDate);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Scoring Rules
  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ["admin-scoring-rules", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("race_scoring_rules")
        .select("*")
        .eq("month", currentMonthDate)
        .order("created_at", { ascending: true });
      if (error) throw error;
      
      // If no rules for this month, maybe fetch defaults or current
      if (!data || data.length === 0) {
        const { data: currentRules } = await supabase
          .from("race_scoring_rules")
          .select("*")
          .is("month", null)
          .order("created_at", { ascending: true });
        return currentRules || [];
      }
      return data;
    },
  });

  // Fetch Approval Requests
  const { data: approvalRequests, isLoading: loadingApprovals } = useQuery({
    queryKey: ["admin-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_approval_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch Audit Logs
  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .in("entity_type", ["goal", "scoring_rule", "commission"])
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Generic mutation to create approval request
  const createApprovalMutation = useMutation({
    mutationFn: async ({ type, entityId, newValues, oldValues, justification }: any) => {
      const { error } = await supabase
        .from("commercial_approval_requests")
        .insert({
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
      toast({ title: "Solicitação Enviada", description: "Sua alteração foi enviada para aprovação." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Mutation to approve/reject request
  const processApprovalMutation = useMutation({
    mutationFn: async ({ requestId, status, justification }: { requestId: string; status: "approved" | "rejected"; justification?: string }) => {
      const { data: request, error: fetchError } = await supabase
        .from("commercial_approval_requests")
        .select("*")
        .eq("id", requestId)
        .single();
      
      if (fetchError) throw fetchError;

      if (status === "approved") {
        // Apply the change based on type
        if (request.type === "goal") {
          await supabase.from("sales_goals").upsert({
            salesperson_id: request.entity_id,
            month: request.competence_month,
            goal_amount: request.new_values.amount,
          }, { onConflict: "salesperson_id,month" });
        } else if (request.type === "scoring_rule") {
          await supabase.from("race_scoring_rules").update({
            weight: request.new_values.weight,
            points_per_unit: request.new_values.points_per_unit,
            label: request.new_values.label
          }).eq("id", request.entity_id);
        } else if (request.type === "commission") {
          await supabase.from("salesperson_commission_configs").upsert({
            salesperson_id: request.entity_id,
            month: request.competence_month,
            rate: request.new_values.rate
          }, { onConflict: "salesperson_id,month" });
        }

        // Log to audit_logs
        await supabase.from("audit_logs").insert({
          actor_id: user?.id,
          action: `approved_${request.type}`,
          entity_type: request.type,
          entity_id: request.entity_id,
          changes: { from: request.old_values, to: request.new_values },
          metadata: { approval_request_id: requestId, justification }
        });
      }

      const { error } = await supabase
        .from("commercial_approval_requests")
        .update({
          status,
          approver_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-goals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-scoring-rules"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast({ 
        title: variables.status === "approved" ? "Aprovado" : "Rejeitado", 
        description: `A solicitação foi ${variables.status === "approved" ? "aprovada e aplicada" : "rejeitada"}.` 
      });
    },
  });

  const isLoading = loadingSalespeople || loadingGoals || loadingRules || loadingCommissions || loadingApprovals || loadingLogs;

  const isLoading = loadingSalespeople || loadingGoals || loadingRules;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
          <div>
            <h1 className="text-3xl font-display font-black gradient-text uppercase tracking-tighter italic">Gestão Comercial</h1>
            <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">
              Configuração de Metas, Pontuações e Incentivos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase text-[10px] py-1 px-3">
              Mês de Referência: {format(new Date(), "MMMM / yyyy")}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 p-1 border border-border/40 w-full md:w-auto overflow-x-auto overflow-y-hidden h-auto">
            <TabsTrigger value="metas" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">
              <Target className="h-4 w-4 mr-2" /> Metas Mensais
            </TabsTrigger>
            <TabsTrigger value="pontuacao" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">
              <Award className="h-4 w-4 mr-2" /> Regras de Pontuação
            </TabsTrigger>
            <TabsTrigger value="comissoes" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">
              <Percent className="h-4 w-4 mr-2" /> Comissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metas" className="space-y-4">
            <Card className="glass border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-display uppercase tracking-tight">Definição de Metas por Vendedor</CardTitle>
                <CardDescription>Ajuste o valor bruto de vendas esperado para este mês</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Meta Atual (R$)</TableHead>
                      <TableHead className="text-right w-[200px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salespeople?.map((sp) => {
                      const goal = goals?.find(g => g.salesperson_id === sp.id);
                      return (
                        <TableRow key={sp.id}>
                          <TableCell className="font-bold">{sp.name}</TableCell>
                          <TableCell className="uppercase text-[10px] font-bold text-muted-foreground">{sp.role}</TableCell>
                          <TableCell className="text-right font-mono">
                            <Input
                              type="number"
                              defaultValue={goal?.goal_amount || 0}
                              className="text-right bg-background/30 border-border/40 h-8"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val !== (goal?.goal_amount || 0)) {
                                  updateGoalMutation.mutate({ salespersonId: sp.id, amount: val });
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-8 hover:bg-primary/10 hover:text-primary">
                              <TrendingUp className="h-4 w-4 mr-2" /> Histórico
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pontuacao" className="space-y-4">
            <Card className="glass border-border/40">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display uppercase tracking-tight">Gamificação: Peso das Métricas</CardTitle>
                  <CardDescription>Determine quantos pontos cada ação vale na Arena Competitiva</CardDescription>
                </div>
                <Button size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                  <Plus className="h-4 w-4 mr-2" /> Nova Regra
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rules?.map((rule) => (
                    <Card key={rule.id} className="bg-muted/20 border-border/20 group hover:border-primary/40 transition-all">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-display flex items-center justify-between">
                          {rule.label}
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-primary/5">{rule.metric_code}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Peso (Multiplier)</label>
                            <Input
                              type="number"
                              step="0.1"
                              defaultValue={rule.weight}
                              className="h-8 bg-background/50"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                updateRuleMutation.mutate({ ...rule, weight: val });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Pts por Unidade</label>
                            <Input
                              type="number"
                              step="0.001"
                              defaultValue={rule.points_per_unit}
                              className="h-8 bg-background/50"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                updateRuleMutation.mutate({ ...rule, points_per_unit: val });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comissoes" className="space-y-4">
            <Card className="glass border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-display uppercase tracking-tight">Taxas de Comissão</CardTitle>
                <CardDescription>Configure o percentual de ganhos por venda para cada colaborador</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-center">Percentual (%)</TableHead>
                      <TableHead className="text-right">Previsão Ganhos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salespeople?.map((sp) => (
                      <TableRow key={sp.id}>
                        <TableCell className="font-bold">{sp.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Input
                              type="number"
                              step="0.1"
                              defaultValue={sp.commission_rate}
                              className="w-24 text-center h-8 bg-background/30"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                updateCommissionMutation.mutate({ salespersonId: sp.id, rate: val });
                              }}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right italic text-muted-foreground text-sm">
                          Variável conforme faturamento
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