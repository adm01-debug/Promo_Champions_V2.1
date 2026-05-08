import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Heart, AlertTriangle, TrendingUp, DollarSign, Ticket, Calendar, Activity, Sparkles, Smile, Briefcase, Download, Filter } from "lucide-react";
import { format, subDays, startOfMonth, format as formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { useCustomerSuccess360 } from "@/hooks/customer-success/useCustomerSuccess360";
import { formatBRL, daysUntil, renewalSemaphore, RENEWAL_STATUS_LABEL, TICKET_STATUS_LABEL, ONBOARDING_STATUS_LABEL, EXPANSION_TYPE_LABEL } from "./cs360Helpers";
import { HelpdeskConnectorPanel } from "./HelpdeskConnectorPanel";
import { SurveyTriggerDialog } from "./SurveyTriggerDialog";

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const SEMA_BG: Record<string, string> = {
  green: "bg-success/15 text-success border-success/30",
  yellow: "bg-warning/15 text-warning border-warning/30",
  orange: "bg-warning/20 text-warning border-warning/40",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  gray: "bg-muted text-muted-foreground border-border",
};

export function CustomerSuccess360Hub() {
  const { data, isLoading } = useCustomerSuccess360();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const s = data?.summary;
  const accounts = data?.accounts ?? [];
  const tickets = data?.tickets ?? [];
  const renewals = data?.renewals ?? [];
  const usage = data?.usage ?? [];
  const onboarding = data?.onboarding ?? [];
  const expansion = data?.expansion ?? [];
  const surveys = data?.surveys ?? [];
  const qbrs = data?.qbrs ?? [];

  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Customer Success 360 | Promo Champions</title>
        <meta name="description" content="Health Score, renovações, tickets, adoção, onboarding, expansion e QBR em uma visão única." />
      </Helmet>

      <motion.div {...fadeIn}>
        <h1 className="text-3xl font-display font-bold gradient-text">Customer Success 360</h1>
        <p className="text-muted-foreground mt-1">Health, retenção, expansão e adoção em uma visão consolidada</p>
      </motion.div>

      {s && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI title="Health Médio" value={`${s.avg_health_v2}/100`} sub={`${s.total_accounts} contas`} icon={<Heart className="h-4 w-4 text-primary" />} />
          <KPI title="Tickets Abertos" value={s.open_tickets.toString()} sub={`${s.urgent_tickets} urgentes`} icon={<Ticket className="h-4 w-4 text-warning" />} accent={s.urgent_tickets > 0 ? "warning" : undefined} />
          <KPI title="Renovações 90d" value={s.renewals_90d.toString()} sub={`${s.renewals_30d} em 30d • ${s.renewals_at_risk} em risco`} icon={<Calendar className="h-4 w-4 text-info" />} />
          <KPI title="Receita em Risco" value={formatBRL(s.renewals_at_risk_value)} sub="Renovações at_risk" icon={<AlertTriangle className="h-4 w-4 text-destructive" />} accent={s.renewals_at_risk_value > 0 ? "destructive" : undefined} />
          <KPI title="CSAT Médio" value={s.avg_csat ? `${s.avg_csat}/5` : "—"} sub={`CES ${s.avg_ces || "—"}`} icon={<Smile className="h-4 w-4 text-success" />} />
          <KPI title="Onboarding Ativo" value={s.onboarding_active.toString()} sub={`${s.onboarding_stalled} travados`} icon={<Activity className="h-4 w-4 text-primary" />} />
          <KPI title="Expansion Pipeline" value={formatBRL(s.expansion_pipeline_value)} sub={`${s.expansion_opportunities} oportunidades`} icon={<TrendingUp className="h-4 w-4 text-success" />} />
          <KPI title="QBRs em 30d" value={s.upcoming_qbrs_30d.toString()} sub="Agendamento ativo" icon={<Briefcase className="h-4 w-4 text-info" />} />
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="health">Health v2</TabsTrigger>
          <TabsTrigger value="renewals">Renovações</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="usage">Adoção</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="expansion">Expansion</TabsTrigger>
          <TabsTrigger value="surveys">CSAT/CES</TabsTrigger>
          <TabsTrigger value="qbr">QBR</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Top contas em risco</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.filter((a) => a.health_v2 < 50).slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between border border-border/40 rounded-lg p-3">
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.tier} • {a.open_tickets} tickets • Renovação: {a.next_renewal ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">{a.health_v2}</div>
                    <Progress value={a.health_v2} className="h-1.5 w-24" />
                  </div>
                </div>
              ))}
              {accounts.filter((a) => a.health_v2 < 50).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma conta crítica no momento 🎉</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Health Score v2 — todas as contas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.slice(0, 30).map((a) => (
                <div key={a.id} className="border border-border/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.name}</span>
                      <Badge variant="outline" className="text-xs">{a.tier}</Badge>
                    </div>
                    <span className="text-lg font-bold">{a.health_v2}</span>
                  </div>
                  <Progress value={a.health_v2} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">
                    Tickets abertos: {a.open_tickets} • Adoção: {a.adoption_score ?? "—"} • Renovação: {a.next_renewal ?? "—"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Pipeline de renovação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {renewals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma renovação cadastrada ainda.</p>
              ) : renewals.map((r) => {
                const d = daysUntil(r.renewal_date);
                const sema = renewalSemaphore(d);
                return (
                  <div key={r.id} className={`border rounded-lg p-3 flex items-center justify-between ${SEMA_BG[sema]}`}>
                    <div>
                      <div className="font-semibold">{accountById.get(r.account_id)?.name ?? "—"}</div>
                      <div className="text-xs opacity-80">{r.renewal_date} • {d !== null ? `${d}d` : "—"} • {RENEWAL_STATUS_LABEL[r.status]}</div>
                    </div>
                    <div className="font-bold">{formatBRL(Number(r.contract_value))}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Tickets abertos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket aberto.</p>
              ) : tickets.map((t) => (
                <div key={t.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">{accountById.get(t.account_id)?.name ?? "—"} • {new Date(t.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={t.priority === "urgent" ? "destructive" : "outline"} className="text-xs">{t.priority}</Badge>
                    <Badge variant="secondary" className="text-xs">{TICKET_STATUS_LABEL[t.status]}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Adoção de produto</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {usage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma métrica de uso disponível.</p>
              ) : usage.slice(0, 30).map((u) => (
                <div key={u.account_id} className="border border-border/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{accountById.get(u.account_id)?.name ?? "—"}</span>
                    <span className="text-sm font-bold">{u.adoption_score}/100</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">DAU {u.dau} • WAU {u.wau} • MAU {u.mau} • Último login: {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("pt-BR") : "—"}</div>
                  <Progress value={u.adoption_score} className="h-1.5 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Jornadas de onboarding</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {onboarding.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma jornada cadastrada.</p>
              ) : onboarding.map((o) => {
                const pct = o.total_steps > 0 ? Math.round((o.current_step / o.total_steps) * 100) : 0;
                return (
                  <div key={o.id} className="border border-border/40 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{accountById.get(o.account_id)?.name ?? "—"}</span>
                      <Badge variant={o.status === "stalled" ? "destructive" : "secondary"} className="text-xs">{ONBOARDING_STATUS_LABEL[o.status]}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Passo {o.current_step} de {o.total_steps}</div>
                    <Progress value={pct} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expansion" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Oportunidades de expansão</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {expansion.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma oportunidade identificada ainda.</p>
              ) : expansion.map((e) => (
                <div key={e.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{accountById.get(e.account_id)?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{EXPANSION_TYPE_LABEL[e.type]} • Confiança: {e.confidence_score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">{formatBRL(Number(e.estimated_value))}</div>
                    <Badge variant="outline" className="text-xs mt-1">{e.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Respostas CSAT / CES</CardTitle>
              {accounts[0] && (
                <SurveyTriggerDialog accountId={accounts[0].id} accountName={accounts[0].name} />
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {surveys.filter((sv) => sv.responded_at).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma resposta de CSAT/CES ainda.</p>
              ) : surveys.filter((sv) => sv.responded_at).slice(0, 30).map((sv) => (
                <div key={sv.id} className="border border-border/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{sv.account_id ? accountById.get(sv.account_id)?.name ?? "—" : "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase">{sv.survey_type}</Badge>
                      <span className="font-bold">{sv.score}</span>
                    </div>
                  </div>
                  {sv.comment && <p className="text-xs text-muted-foreground mt-1">"{sv.comment}"</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbr" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Agenda de QBR</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {qbrs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum QBR agendado ainda.</p>
              ) : qbrs.map((q) => (
                <div key={q.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{accountById.get(q.account_id)?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">Frequência: {q.frequency} • Último: {q.last_qbr_at ?? "—"}</div>
                  </div>
                  <Badge variant="outline">{q.next_qbr_at ?? "Não agendado"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <HelpdeskConnectorPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ title, value, sub, icon, accent }: { title: string; value: string; sub: string; icon: React.ReactNode; accent?: "destructive" | "warning" }) {
  const valueClass = accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
