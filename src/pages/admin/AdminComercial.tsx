import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Target, Award, Percent, Plus, TrendingUp, Check, X, History as HistoryIcon, Clock, Filter, Download, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CommercialDiffViewer } from "@/components/admin/commercial/CommercialDiffViewer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";


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
      
      if (!data || data.length === 0) {
        const { data: defaultRules } = await supabase.from("race_scoring_rules").select("*").is("month", null).order("created_at", { ascending: true });
        return defaultRules || [];
      }
      return data;
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
    mutationFn: async ({ type, entityId, newValues, oldValues, justification }: {
      type: "goal" | "scoring_rule" | "commission";
      entityId: string;
      newValues: Record<string, unknown>;
      oldValues: Record<string, unknown>;
      justification?: string;
    }) => {
      const { error } = await supabase.from("commercial_approval_requests").insert([{
        requester_id: user?.id as string,
        type,
        entity_id: entityId,
        competence_month: currentMonthDate,
        new_values: newValues as any,
        old_values: oldValues as any,
        justification,
        status: "pending"
      }]);
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
              {(approvalRequests?.filter(r => r.status === "pending").length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {approvalRequests?.filter(r => r.status === "pending").length}
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
            <div className="grid grid-cols-1 gap-6">
              {approvalRequests?.filter(r => r.status === "pending").length === 0 ? (
                <Card className="glass border-border/40 py-12">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-display uppercase italic">Tudo em dia!</CardTitle>
                    <CardDescription>Não há solicitações de alteração pendentes para revisão.</CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {approvalRequests?.filter(r => r.status === "pending").map((req) => (
                    <Card key={req.id} className="glass border-border/40 overflow-hidden group hover:border-primary/40 transition-all duration-300">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] font-black italic tracking-tighter">
                            {req.type === 'goal' ? 'Meta' : req.type === 'commission' ? 'Comissão' : 'Regra de Pontos'}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{req.competence_month ? format(new Date(req.competence_month), "MMMM yyyy", { locale: ptBR }) : '-'}</span>
                        </div>

                        <span className="text-[10px] text-muted-foreground font-mono">{req.created_at ? format(new Date(req.created_at), "dd/MM HH:mm") : '-'}</span>
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div className="bg-background/40 rounded-lg p-3 border border-border/20">
                          {req.type === 'goal' && (
                            <CommercialDiffViewer 
                              label="Valor da Meta" 
                              oldValue={(req.old_values as any)?.amount} 
                              newValue={(req.new_values as any)?.amount} 
                              formatter={(val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                            />
                          )}
                          {req.type === 'commission' && (
                            <CommercialDiffViewer 
                              label="Taxa de Comissão" 
                              oldValue={(req.old_values as any)?.rate} 
                              newValue={(req.new_values as any)?.rate} 
                              formatter={(val) => `${val}%`}
                            />
                          )}
                          {req.type === 'scoring_rule' && (
                            <div className="space-y-1">
                              {(req.new_values as any)?.weight !== (req.old_values as any)?.weight && (
                                <CommercialDiffViewer label="Peso" oldValue={(req.old_values as any)?.weight} newValue={(req.new_values as any)?.weight} />
                              )}
                              {(req.new_values as any)?.points_per_unit !== (req.old_values as any)?.points_per_unit && (
                                <CommercialDiffViewer label="Pontos por Unidade" oldValue={(req.old_values as any)?.points_per_unit} newValue={(req.new_values as any)?.points_per_unit} />
                              )}
                            </div>
                          )}
                        </div>

                        
                        {req.justification && (
                          <div className="text-[10px] bg-primary/5 p-2 rounded border border-primary/10 italic text-muted-foreground">
                            "{req.justification}"
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <Button 
                            className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all font-bold uppercase text-[10px]"
                            onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "approved" })}
                          >
                            <Check className="h-3 w-3 mr-2" /> Aprovar Alteração
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold uppercase text-[10px]"
                            onClick={() => processApprovalMutation.mutate({ requestId: req.id, status: "rejected" })}
                          >
                            <X className="h-3 w-3 mr-2" /> Rejeitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(approvalRequests?.filter(r => r.status !== "pending").length ?? 0) > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-display uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <HistoryIcon className="h-4 w-4" /> Decisões Recentes
                  </h3>
                  <Card className="glass border-border/40">
                    <Table>
                      <TableBody>
                        {approvalRequests?.filter(r => r.status !== "pending").slice(0, 5).map((req) => (
                          <TableRow key={req.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="text-[10px] font-bold uppercase italic">{req.type}</TableCell>
                            <TableCell className="text-[10px]">{req.competence_month ? format(new Date(req.competence_month), "MM/yyyy") : '-'}</TableCell>
                            <TableCell>
                              <Badge variant={req.status === "approved" ? "default" : "destructive"} className="text-[9px] uppercase font-black px-1.5 py-0">
                                {req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground text-right">
                              {req.created_at ? format(new Date(req.created_at), "dd/MM/yy") : '-'}
                            </TableCell>
                          </TableRow>
                        ))}

                      </TableBody>
                    </Table>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <Card className="glass border-border/40 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10">
                <div>
                  <CardTitle className="text-lg font-display uppercase italic">Histórico de Auditoria</CardTitle>
                  <CardDescription className="text-[10px] uppercase">Rastreabilidade completa de todas as alterações comerciais</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-border/40">
                    <Filter className="h-3 w-3 mr-2" /> Filtrar
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-border/40">
                    <Download className="h-3 w-3 mr-2" /> Exportar
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-muted/20 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-border/10">
                      <TableHead className="w-[150px] text-[10px] font-black uppercase">Data/Hora</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Evento</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Entidade</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Alterações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs?.map((log) => (
                      <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-border/10">
                        <TableCell className="text-[10px] font-mono whitespace-nowrap">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/20 text-primary bg-primary/5">
                            {log.action.replace('approved_', 'APROVADO: ').replace('create_approval_', 'SOLICITADO: ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] font-black uppercase italic tracking-tighter">
                          {log.entity_type}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help max-w-[300px] truncate">
                                  <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {JSON.stringify(log.changes).substring(0, 50)}...
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="w-80 p-3 bg-black/95 border-primary/30">
                                <pre className="text-[9px] font-mono leading-relaxed overflow-x-auto text-primary-foreground/90 whitespace-pre-wrap">
                                  {JSON.stringify(log.changes, null, 2)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}