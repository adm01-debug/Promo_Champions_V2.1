import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ShoppingBag, Clock, Activity, Flame, Award, Sparkles, MessagesSquare, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { SentimentDistributionCard } from "@/components/conversation-intelligence/SentimentDistributionCard";
import { ObjectionsTrendChart } from "@/components/conversation-intelligence/ObjectionsTrendChart";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const STAGE_LABELS: Record<string, string> = { pending: "Lead", qualified: "Qualificado", proposal: "Proposta", negotiation: "Negociação" };

function formatCurrency(value: any) {
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

interface BIVendedorChartsProps {
  salesByDay?: { day: string; value: number }[];
  salesByCategory?: { category: string; value: number }[];
  dealsByStage?: { stage: string; count: number; value: number }[];
  pipelineValue?: number;
  avgDaysInPipeline?: number;
  totalActivities?: number;
  totalAchievements?: number;
  currentStreak?: number;
  bestStreak?: number;
  activitiesByType?: { type: string; count: number }[];
}

export const BIVendedorCharts = React.memo(function BIVendedorCharts({
  salesByDay, salesByCategory, dealsByStage, pipelineValue, avgDaysInPipeline,
  totalActivities, totalAchievements, currentStreak, bestStreak, activitiesByType,
}: BIVendedorChartsProps) {
  const tooltipStyle = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><TrendingUp className="h-4 w-4 text-primary-foreground" /></div>
              Vendas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesByDay && salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={salesByDay}>
                  <defs><linearGradient id="colorValueBI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ ...tooltipStyle, boxShadow: "var(--shadow-lg)" }} formatter={(value: any) => [formatCurrency(value), "Vendas"]} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValueBI)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" /><p>Nenhuma venda este mês</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: "450ms" }}>
          <CardHeader><CardTitle className="text-lg font-display">Por Categoria</CardTitle></CardHeader>
          <CardContent>
            {salesByCategory && salesByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {salesByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value)]} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {salesByCategory.map((cat, idx) => (
                    <div key={cat.category} className="flex items-center gap-2 text-sm hover-scale-sm cursor-default">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="flex-1 truncate text-muted-foreground">{cat.category}</span>
                      <span className="font-semibold">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card animate-slide-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><ShoppingBag className="h-4 w-4 text-primary-foreground" /></div>
              Pipeline por Estágio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dealsByStage?.map((stage, idx) => (
                <div key={stage.stage} className="animate-slide-up" style={{ animationDelay: `${550 + idx * 50}ms` }}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count} deals • <span className="font-semibold text-foreground">{formatCurrency(stage.value)}</span></span>
                  </div>
                  <Progress value={stage.count > 0 ? (stage.value / (pipelineValue || 1)) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>Média no pipeline</span></div>
              <span className="font-bold gradient-text">{(avgDaysInPipeline || 0).toFixed(0)} dias</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: "550ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-xp to-primary"><Activity className="h-4 w-4 text-xp-foreground" /></div>
              Atividades & Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 rounded-xl glass hover-scale-sm">
                <p className="text-2xl font-black gradient-text">{totalActivities || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Atividades (30d)</p>
              </div>
              <div className="text-center p-4 rounded-xl glass hover-scale-sm">
                <p className="text-2xl font-black text-success">{totalAchievements || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Conquistas</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-streak/10 to-transparent border border-streak/20 hover-lift-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-streak/20 animate-streak-fire"><Flame className="h-5 w-5 text-streak" /></div>
                  <span className="font-display font-semibold">Sequência Atual</span>
                </div>
                <span className="text-xl font-black text-streak">{currentStreak || 0} dias</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover-lift-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20"><Award className="h-5 w-5 text-primary" /></div>
                  <span className="font-display font-semibold">Recorde Pessoal</span>
                </div>
                <span className="text-xl font-black gradient-text">{bestStreak || 0} dias</span>
              </div>
            </div>
            {activitiesByType && activitiesByType.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Por tipo</p>
                <div className="flex flex-wrap gap-2">
                  {activitiesByType.map(a => <Badge key={a.type} variant="secondary" className="hover-scale-sm">{a.type}: {a.count}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
});
