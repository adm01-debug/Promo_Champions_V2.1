import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRoutingRules, useLeadAssignments, useToggleRoutingRule, type RoutingRule, type LeadAssignment } from "@/hooks/useLeadRoutingEngine";
import { Route, Users, Activity, Trophy, Shuffle, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/transitions/PageTransition";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const STRATEGY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  round_robin: { label: "Round Robin", icon: Shuffle, color: "text-primary" },
  least_loaded: { label: "Menos Carregado", icon: Users, color: "text-status-info" },
  top_performer: { label: "Top Performer", icon: Trophy, color: "text-rank-gold" },
  territory: { label: "Por Território", icon: MapPin, color: "text-status-success" },
};

const LeadRoutingPage = () => {
  const { data: rules, isLoading: lr } = useRoutingRules();
  const { data: assignments, isLoading: la } = useLeadAssignments();
  const toggle = useToggleRoutingRule();

  return (
    <>
      <Helmet>
        <title>Lead Routing | Promo Champions</title>
        <meta name="description" content="Distribuição automática e inteligente de leads entre vendedores." />
      </Helmet>
      <PageTransition>
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-page-title font-display">Lead Routing</h1>
              <p className="text-sm text-muted-foreground">Distribuição automática de leads para vendedores</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Regras Ativas", value: (rules ?? []).filter((r: RoutingRule) => r.is_active).length, icon: Route, color: "text-primary" },
              { label: "Atribuições (recentes)", value: (assignments ?? []).length, icon: Activity, color: "text-status-info" },
              { label: "Estratégias", value: new Set((rules ?? []).map((r: RoutingRule) => r.strategy)).size, icon: Shuffle, color: "text-status-success" },
            ].map(s => (
              <Card key={s.label} className="glass border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="rules" className="space-y-4">
              <TabsList>
                <TabsTrigger value="rules">Regras de Distribuição</TabsTrigger>
                <TabsTrigger value="history">Histórico de Atribuições</TabsTrigger>
              </TabsList>

              <TabsContent value="rules" className="space-y-3">
                {lr ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
                ) : (
                  (rules ?? []).map((r: RoutingRule) => {
                    const meta = STRATEGY_META[r.strategy] ?? STRATEGY_META.round_robin;
                    const Icon = meta.icon;
                    return (
                      <Card key={r.id} className="glass border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${meta.color}`} />
                              {r.name}
                              <Badge variant="outline" className="text-[10px]">prioridade {r.priority}</Badge>
                            </span>
                            <Switch checked={r.is_active}
                              onCheckedChange={c => toggle.mutate({ id: r.id, is_active: c })} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">{meta.label}</Badge>
                            {r.filter_min_value && <Badge variant="outline">Min R$ {r.filter_min_value.toLocaleString("pt-BR")}</Badge>}
                            {r.filter_state && <Badge variant="outline">UF: {r.filter_state}</Badge>}
                            {r.filter_source && <Badge variant="outline">Fonte: {r.filter_source}</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-2">
                {la ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
                ) : !assignments?.length ? (
                  <Card className="glass border-border/40">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      Nenhuma atribuição automática registrada ainda.
                    </CardContent>
                  </Card>
                ) : (
                  assignments.map((a: LeadAssignment) => {
                    const meta = STRATEGY_META[a.strategy_used] ?? STRATEGY_META.round_robin;
                    const Icon = meta.icon;
                    return (
                      <Card key={a.id} className="glass border-border/40">
                        <CardContent className="p-3 flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              Deal #{a.sale_id.slice(0, 8)} → Vendedor #{a.salesperson_id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meta.label} • {formatDistanceToNow(new Date(a.assigned_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </PageTransition>
    </>
  );
};

export default LeadRoutingPage;
