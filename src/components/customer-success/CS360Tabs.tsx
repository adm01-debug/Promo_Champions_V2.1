import React from "react";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Activity } from "lucide-react";
import { CS360Trends } from "./CS360Trends";
import { CS360Cohorts } from "./CS360Cohorts";
import { HelpdeskConnectorPanel } from "./HelpdeskConnectorPanel";
import { SurveyTriggerDialog } from "./SurveyTriggerDialog";
import { formatBRL, daysUntil, renewalSemaphore, RENEWAL_STATUS_LABEL, TICKET_STATUS_LABEL, ONBOARDING_STATUS_LABEL, EXPANSION_TYPE_LABEL } from "./cs360Helpers";

const SEMA_BG: Record<string, string> = {
  green: "bg-success/15 text-success border-success/30",
  yellow: "bg-warning/15 text-warning border-warning/30",
  orange: "bg-warning/20 text-warning border-warning/40",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  gray: "bg-muted text-muted-foreground border-border",
};

interface CS360TabsProps {
  accounts: any[];
  renewals: any[];
  tickets: any[];
  usage: any[];
  onboarding: any[];
  expansion: any[];
  surveys: any[];
  qbrs: any[];
  accountById: Map<string, any>;
  evolutionData: any[];
  cohortData: any[];
  ordersByStatus: any[];
  onStatusClick: (status: string) => void;
}

export function CS360Tabs({
  accounts,
  renewals,
  tickets,
  usage,
  onboarding,
  expansion,
  surveys,
  qbrs,
  accountById,
  evolutionData,
  cohortData,
  ordersByStatus,
  onStatusClick
}: CS360TabsProps) {
  return (
    <>
      <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 rounded-xl">
        <TabsTrigger value="overview" className="rounded-lg">Visão Geral</TabsTrigger>
        <TabsTrigger value="trends" className="rounded-lg">Tendências</TabsTrigger>
        <TabsTrigger value="cohorts" className="rounded-lg">Coortes</TabsTrigger>
        <TabsTrigger value="health" className="rounded-lg">Health v2</TabsTrigger>
        <TabsTrigger value="renewals" className="rounded-lg">Renovações</TabsTrigger>
        <TabsTrigger value="tickets" className="rounded-lg">Tickets</TabsTrigger>
        <TabsTrigger value="usage" className="rounded-lg">Adoção</TabsTrigger>
        <TabsTrigger value="onboarding" className="rounded-lg">Onboarding</TabsTrigger>
        <TabsTrigger value="expansion" className="rounded-lg">Expansion</TabsTrigger>
        <TabsTrigger value="surveys" className="rounded-lg">CSAT/CES</TabsTrigger>
        <TabsTrigger value="qbr" className="rounded-lg">QBR</TabsTrigger>
        <TabsTrigger value="integrations" className="rounded-lg">Integrações</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Top contas em risco</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {accounts.filter((a) => a.health_v2 < 50).slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between border border-border/40 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.tier} • {a.open_tickets} tickets • Renovação: {a.next_renewal ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive">{a.health_v2}</div>
                  <Progress value={a.health_v2} className="h-1.5 w-24" />
                </div>
              </div>
            ))}
            {accounts.filter((a) => a.health_v2 < 50).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6 italic">Nenhuma conta crítica no momento 🎉</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="mt-4">
        <CS360Trends evolutionData={evolutionData} />
      </TabsContent>

      <TabsContent value="cohorts" className="mt-4">
        <CS360Cohorts cohortData={cohortData} ordersByStatus={ordersByStatus} onStatusClick={onStatusClick} />
      </TabsContent>

      <TabsContent value="health" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Health Score v2 — todas as contas</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accounts.slice(0, 30).map((a) => (
              <div key={a.id} className="border border-border/40 rounded-lg p-3 space-y-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-xs truncate">{a.name}</span>
                    <Badge variant="outline" className="text-[8px] h-4">{a.tier}</Badge>
                  </div>
                  <span className="text-sm font-bold">{a.health_v2}</span>
                </div>
                <Progress value={a.health_v2} className="h-1" />
                <div className="text-[10px] text-muted-foreground flex justify-between">
                  <span>Tickets: {a.open_tickets}</span>
                  <span>Adoção: {a.adoption_score ?? "—"}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="renewals" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Pipeline de renovação</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {renewals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma renovação cadastrada ainda.</p>
            ) : renewals.map((r) => {
              const d = daysUntil(r.renewal_date);
              const sema = renewalSemaphore(d);
              return (
                <div key={r.id} className={`border rounded-lg p-3 flex items-center justify-between transition-all hover:translate-x-1 ${SEMA_BG[sema]}`}>
                  <div>
                    <div className="font-semibold text-sm">{accountById.get(r.account_id)?.name ?? "—"}</div>
                    <div className="text-[10px] opacity-80 font-mono uppercase">{r.renewal_date} • {d !== null ? `${d}d` : "—"} • {RENEWAL_STATUS_LABEL[r.status]}</div>
                  </div>
                  <div className="font-bold text-sm">{formatBRL(Number(r.contract_value))}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tickets" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Tickets abertos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket aberto.</p>
            ) : tickets.map((t) => (
              <div key={t.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{t.subject}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{accountById.get(t.account_id)?.name ?? "—"} • {new Date(t.created_at).toLocaleDateString("pt-BR")}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={t.priority === "urgent" ? "destructive" : "outline"} className="text-[10px] uppercase">{t.priority}</Badge>
                  <Badge variant="secondary" className="text-[10px] uppercase">{TICKET_STATUS_LABEL[t.status]}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="usage" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Adoção de produto</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {usage.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-full">Nenhuma métrica de uso disponível.</p>
            ) : usage.slice(0, 30).map((u) => (
              <div key={u.account_id} className="border border-border/40 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{accountById.get(u.account_id)?.name ?? "—"}</span>
                  <span className="text-xs font-bold">{u.adoption_score}/100</span>
                </div>
                <div className="text-[10px] text-muted-foreground grid grid-cols-3 gap-1">
                  <div className="bg-muted/50 p-1 rounded text-center">DAU: {u.dau}</div>
                  <div className="bg-muted/50 p-1 rounded text-center">WAU: {u.wau}</div>
                  <div className="bg-muted/50 p-1 rounded text-center">MAU: {u.mau}</div>
                </div>
                <Progress value={u.adoption_score} className="h-1 mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="onboarding" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Jornadas de onboarding</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {onboarding.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-full">Nenhuma jornada cadastrada.</p>
            ) : onboarding.map((o) => {
              const pct = o.total_steps > 0 ? Math.round((o.current_step / o.total_steps) * 100) : 0;
              return (
                <div key={o.id} className="border border-border/40 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{accountById.get(o.account_id)?.name ?? "—"}</span>
                    <Badge variant={o.status === "stalled" ? "destructive" : "secondary"} className="text-[10px] uppercase font-mono">{ONBOARDING_STATUS_LABEL[o.status]}</Badge>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>{o.current_step} / {o.total_steps}</span>
                  </div>
                  <Progress value={pct} className="h-1" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="expansion" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-primary" />Oportunidades de expansão</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {expansion.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma oportunidade identificada ainda.</p>
            ) : expansion.map((e) => (
              <div key={e.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-semibold text-sm">{accountById.get(e.account_id)?.name ?? "—"}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{EXPANSION_TYPE_LABEL[e.type]} • Confiança: {e.confidence_score}%</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success text-sm">{formatBRL(Number(e.estimated_value))}</div>
                  <Badge variant="outline" className="text-[10px] mt-1 font-mono uppercase">{e.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="surveys" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Respostas CSAT / CES</CardTitle>
            {accounts[0] && (
              <SurveyTriggerDialog accountId={accounts[0].id} accountName={accounts[0].name} />
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {surveys.filter((sv) => sv.responded_at).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma resposta de CSAT/CES ainda.</p>
            ) : surveys.filter((sv) => sv.responded_at).slice(0, 30).map((sv) => (
              <div key={sv.id} className="border border-border/40 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{sv.account_id ? accountById.get(sv.account_id)?.name ?? "—" : "—"}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">{sv.survey_type}</Badge>
                    <span className="font-bold text-sm">{sv.score}</span>
                  </div>
                </div>
                {sv.comment && <p className="text-xs text-muted-foreground mt-1 italic opacity-80">"{sv.comment}"</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="qbr" className="mt-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Agenda de QBR</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {qbrs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum QBR agendado ainda.</p>
            ) : qbrs.map((q) => (
              <div key={q.id} className="border border-border/40 rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-semibold text-sm">{accountById.get(q.account_id)?.name ?? "—"}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Frequência: {q.frequency} • Último: {q.last_qbr_at ?? "—"}</div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">{q.next_qbr_at ?? "Não agendado"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations" className="mt-4">
        <HelpdeskConnectorPanel />
      </TabsContent>
    </>
  );
}
