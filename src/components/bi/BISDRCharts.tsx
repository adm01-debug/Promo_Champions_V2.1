import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Users } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface LeadsByDay { day: string; generated: number; qualified: number; }
interface ActivitiesByDay { day: string; count: number; }
interface FunnelStage { stage: string; count: number; percentage: number; }
interface LeadSource { source: string; count: number; }

interface BISDRChartsProps {
  leadsByDay?: LeadsByDay[];
  activitiesByDay?: ActivitiesByDay[];
  conversionFunnel?: FunnelStage[];
  leadsBySource?: LeadSource[];
}

export const BISDRCharts = React.memo(function BISDRCharts({ leadsByDay, activitiesByDay, conversionFunnel, leadsBySource }: BISDRChartsProps) {
  const tooltipStyle = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><TrendingUp className="h-4 w-4 text-primary-foreground" /></div>Leads por Dia</CardTitle></CardHeader>
          <CardContent>
            {leadsByDay && leadsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={leadsByDay}>
                  <defs>
                    <linearGradient id="colorLeadsGen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorLeadsQual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="generated" name="Gerados" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorLeadsGen)" />
                  <Area type="monotone" dataKey="qualified" name="Qualificados" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#colorLeadsQual)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground"><div className="text-center"><Users className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>Nenhum lead no período</p></div></div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><div className="p-2 rounded-lg bg-gradient-to-br from-chart-2 to-success"><Activity className="h-4 w-4 text-success-foreground" /></div>Atividades por Dia</CardTitle></CardHeader>
          <CardContent>
            {activitiesByDay && activitiesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activitiesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Atividades" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground"><div className="text-center"><Activity className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>Nenhuma atividade no período</p></div></div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg font-display">Funil de Conversão</CardTitle></CardHeader>
          <CardContent>
            {conversionFunnel && (
              <div className="space-y-3">
                {conversionFunnel.map((stage) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex justify-between text-sm"><span className="font-medium">{stage.stage}</span><span className="text-muted-foreground">{stage.count} ({stage.percentage.toFixed(1)}%)</span></div>
                    <div className="h-6 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500" style={{ width: `${stage.percentage}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg font-display">Leads por Fonte</CardTitle></CardHeader>
          <CardContent>
            {leadsBySource && leadsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="source">
                    {leadsBySource.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [`${value} leads`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">Sem dados</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {leadsBySource?.map((src, idx) => (
                <Badge key={src.source} variant="outline" className="text-xs">
                  <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {src.source}: {src.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
