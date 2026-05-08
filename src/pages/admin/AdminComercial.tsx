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
  const currentMonth = format(new Date(), "yyyy-MM") + "-01";

  // Fetch Salespeople
  const { data: salespeople, isLoading: loadingSalespeople } = useQuery({
    queryKey: ["admin-salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, role, commission_rate, is_active")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Goals
  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ["admin-goals", currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonth);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Scoring Rules
  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ["admin-scoring-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("race_scoring_rules")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Mutation for updating goals
  const updateGoalMutation = useMutation({
    mutationFn: async ({ salespersonId, amount }: { salespersonId: string; amount: number }) => {
      const { error } = await supabase
        .from("sales_goals")
        .upsert({
          salesperson_id: salespersonId,
          month: currentMonth,
          goal_amount: amount,
        }, {
          onConflict: "salesperson_id,month",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-goals"] });
      toast({ title: "Sucesso", description: "Meta atualizada com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Mutation for updating scoring rules
  const updateRuleMutation = useMutation({
    mutationFn: async (rule: any) => {
      const { error } = await supabase
        .from("race_scoring_rules")
        .update({
          weight: rule.weight,
          points_per_unit: rule.points_per_unit,
          label: rule.label
        })
        .eq("id", rule.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scoring-rules"] });
      toast({ title: "Sucesso", description: "Regra de pontuação atualizada." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Mutation for updating commission rates
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ salespersonId, rate }: { salespersonId: string; rate: number }) => {
      const { error } = await supabase
        .from("salespeople")
        .update({ commission_rate: rate })
        .eq("id", salespersonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salespeople"] });
      toast({ title: "Sucesso", description: "Comissão atualizada." });
    },
  });

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