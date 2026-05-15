import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertTriangle, TrendingUp, Ticket, Calendar, Activity, Smile, Briefcase } from "lucide-react";
import { formatBRL } from "./cs360Helpers";

interface KPIProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: "destructive" | "warning";
}

function KPI({ title, value, sub, icon, accent }: KPIProps) {
  return (
    <Card className={`glass border-border/50 hover-scale-sm transition-all ${accent === 'destructive' ? 'border-destructive/30 bg-destructive/5' : accent === 'warning' ? 'border-warning/30 bg-warning/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-background/50 border border-border/40">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black font-display tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

interface SummaryData {
  avg_health_v2: number;
  total_accounts: number;
  open_tickets: number;
  urgent_tickets: number;
  renewals_90d: number;
  renewals_30d: number;
  renewals_at_risk: number;
  renewals_at_risk_value: number;
  avg_csat: number | null;
  avg_ces: number | null;
  onboarding_active: number;
  onboarding_stalled: number;
  expansion_pipeline_value: number;
  expansion_opportunities: number;
  upcoming_qbrs_30d: number;
}

export function CS360Summary({ s }: { s: SummaryData }) {
  return (
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
  );
}
