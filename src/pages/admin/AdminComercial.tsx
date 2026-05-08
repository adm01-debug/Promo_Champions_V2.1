import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Target, Award, Percent, Plus, TrendingUp, Check, X, History } from "lucide-react";
import { format } from "date-fns";
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
        if (request.type === "goal") {
          await supabase.from("sales_goals").upsert({ salesperson_id: request.entity_id, month: request.competence_month, goal_amount: request.new_values.amount }, { onConflict: "salesperson_id,month" });
        } else if (request.type === "scoring_rule") {
          await supabase.from("race_scoring_rules").update({ weight: request.new_values.weight, points_per_unit: request.new_values.points_per_unit, label: request.new_values.label }).eq("id", request.entity_id);
        } else if (request.type === "commission") {
          await supabase.from("salesperson_commission_configs").upsert({ salesperson_id: request.entity_id, month: request.competence_month, rate: request.new_values.rate }, { onConflict: "salesperson_id,month" });
        }

        await supabase.from("audit_logs").insert({
          actor_id: user?.id,
          action: \`approved_\${request.type}\`,
          entity_type: request.type,
          entity_id: request.entity_id,
          changes: { from: request.old_values, to: request.new_values },
          metadata: { approval_request_id: requestId, justification }
        });
      }

      await supabase.from("commercial_approval_requests").update({ status, approver_id: user?.id }).eq("id", requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals", "admin-goals", "admin-scoring-rules", "admin-commissions", "admin-audit-logs"] });
      toast({ title: "Sucesso", description: "Ação realizada." });
    },
  });

  const isLoading = loadingSalespeople || loadingGoals || loadingRules || loadingCommissions || loadingApprovals;

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
          <div>
            <h1 className="text-3xl font-display font-black gradient-text uppercase tracking-tighter italic">Gestão Comercial</h1>
            <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-40 mt-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="metas"><Target className="h-4 w-4 mr-2" /> Metas</TabsTrigger>
            <TabsTrigger value="pontuacao"><Award className="h-4 w-4 mr-2" /> Regras</TabsTrigger>
            <TabsTrigger value="comissoes"><Percent className="h-4 w-4 mr-2" /> Comissões</TabsTrigger>
            <TabsTrigger value="aprovacoes"><Check className="h-4 w-4 mr-2" /> Aprovações</TabsTrigger>
          </TabsList>

          <TabsContent value="metas">
            <Card>
              <CardContent>
                <Table>
                  <TableBody>
                    {salespeople?.map((sp) => {
                      const goal = goals?.find(g => g.salesperson_id === sp.id);
                      return (
                        <TableRow key={sp.id}>
                          <TableCell>{sp.name}</TableCell>
                          <TableCell>
                            <Input type="number" defaultValue={goal?.goal_amount || 0} onBlur={(e) => createApprovalMutation.mutate({ type: "goal", entityId: sp.id, newValues: { amount: parseFloat(e.target.value) }, oldValues: { amount: goal?.goal_amount || 0 } })} />
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
            <Card>
              <CardContent>
                <Table>
                  <TableBody>
                    {approvalRequests?.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.type}</TableCell>
                        <TableCell>{req.status}</TableCell>
                        <TableCell>
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "approved" })}><Check className="h-4 w-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "rejected" })}><X className="h-4 w-4" /></Button>
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
        </Tabs>
      </div>
    </PageTransition>
  );
}