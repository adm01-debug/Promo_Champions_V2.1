import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useSLAPolicies, useSLAViolations, useUpdateSLAPolicy,
  useScanSLAViolations, useResolveSLAViolation,
} from "@/hooks/useSLATracking";
import { Clock, AlertTriangle, CheckCircle2, RefreshCw, Timer, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/transitions/PageTransition";
import { cn } from "@/lib/utils";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead", prospecting: "Prospecção", qualified: "Qualificado",
  proposal: "Proposta", negotiation: "Negociação",
};

const SLATrackingPage = () => {
  const { data: policies, isLoading: lp } = useSLAPolicies();
  const { data: violations, isLoading: lv } = useSLAViolations();
  const update = useUpdateSLAPolicy();
  const scan = useScanSLAViolations();
  const resolve = useResolveSLAViolation();
  const [edits, setEdits] = useState<Record<string, { max: number; warn: number }>>({});

  const warnings = (violations ?? []).filter(v => v.status === "warning");
  const violated = (violations ?? []).filter(v => v.status === "violated");

  return (
    <>
      <Helmet>
        <title>SLA Tracking | Promo Champions</title>
        <meta name="description" content="Monitoramento de SLA por estágio do funil com alertas automáticos." />
      </Helmet>
      <PageTransition>
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-page-title font-display">SLA Tracking</h1>
                <p className="text-sm text-muted-foreground">Monitoramento de tempo por estágio do funil</p>
              </div>
            </div>
            <Button size="sm" className="gap-2" onClick={() => scan.mutate()} disabled={scan.isPending}>
              <RefreshCw className={cn("h-4 w-4", scan.isPending && "animate-spin")} />
              Escanear violações
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Políticas Ativas", value: (policies ?? []).filter(p => p.is_active).length, icon: ShieldAlert, color: "text-primary" },
              { label: "Alertas (Warning)", value: warnings.length, icon: AlertTriangle, color: "text-status-warning" },
              { label: "Violações", value: violated.length, icon: Clock, color: "text-destructive" },
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

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="violations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="violations">Violações Ativas ({(violations ?? []).length})</TabsTrigger>
                <TabsTrigger value="policies">Políticas SLA</TabsTrigger>
              </TabsList>

              <TabsContent value="violations" className="space-y-3">
                {lv ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
                ) : !violations?.length ? (
                  <Card className="glass border-border/40">
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-status-success mx-auto mb-3" />
                      <p className="font-display font-semibold">Tudo em dia!</p>
                      <p className="text-sm text-muted-foreground">Nenhuma violação de SLA detectada.</p>
                    </CardContent>
                  </Card>
                ) : (
                  violations.map(v => (
                    <Card key={v.id} className="glass border-border/40">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Badge variant="outline" className={cn("uppercase text-[10px]",
                          v.status === "violated"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-status-warning/10 text-status-warning border-status-warning/30")}>
                          {v.status === "violated" ? "Violado" : "Alerta"}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {STAGE_LABELS[v.stage] ?? v.stage} • <span className="text-muted-foreground">{v.hours_in_stage.toFixed(1)}h no estágio</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Detectado {formatDistanceToNow(new Date(v.detected_at), { addSuffix: true, locale: ptBR })}
                            {" • "}Deal #{v.sale_id.slice(0, 8)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => resolve.mutate(v.id)} disabled={resolve.isPending}>
                          Resolver
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="policies" className="space-y-3">
                {lp ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
                ) : (
                  (policies ?? []).map(p => {
                    const e = edits[p.id] ?? { max: p.max_hours, warn: p.warning_hours };
                    return (
                      <Card key={p.id} className="glass border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              {STAGE_LABELS[p.stage] ?? p.stage}
                              <Badge variant="outline" className="text-[10px]">{p.stage}</Badge>
                            </span>
                            <Switch checked={p.is_active}
                              onCheckedChange={c => update.mutate({ id: p.id, max_hours: e.max, warning_hours: e.warn, is_active: c })} />
                          </CardTitle>
                          {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-3 items-end">
                          <div className="flex-1 w-full">
                            <label className="text-xs text-muted-foreground">Aviso (horas)</label>
                            <Input type="number" min={1} value={e.warn}
                              onChange={ev => setEdits(s => ({ ...s, [p.id]: { ...e, warn: Number(ev.target.value) } }))} />
                          </div>
                          <div className="flex-1 w-full">
                            <label className="text-xs text-muted-foreground">Limite máximo (horas)</label>
                            <Input type="number" min={1} value={e.max}
                              onChange={ev => setEdits(s => ({ ...s, [p.id]: { ...e, max: Number(ev.target.value) } }))} />
                          </div>
                          <Button size="sm" disabled={update.isPending}
                            onClick={() => update.mutate({ id: p.id, max_hours: e.max, warning_hours: e.warn, is_active: p.is_active })}>
                            Salvar
                          </Button>
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

export default SLATrackingPage;
