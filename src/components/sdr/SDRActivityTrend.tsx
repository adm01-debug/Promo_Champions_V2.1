import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Activity, Users, BarChart3, AlertTriangle, Download } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportToCSV } from "@/utils/csvExport";
import { toast } from "sonner";
import {
  type PeriodFilter, type ViewMode, type ActivityTypeFilter,
  useSDRActivityTrend, ACTIVITY_COLORS, ACTIVITY_LABELS, COLORS,
} from "@/hooks/useSDRActivityTrend";

interface SDRActivityTrendProps {
  period: PeriodFilter;
}

export function SDRActivityTrend({ period }: SDRActivityTrendProps) {
  const [selectedSDR, setSelectedSDR] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("activity");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeFilter>("all");
  const { data, isLoading } = useSDRActivityTrend(period, selectedSDR, viewMode, activityTypeFilter);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  const { activityData = [], comparisonData = [], sdrs = [], totals, dailyGoal = 0, sdrGoals = {}, underperformingSDRs = [] } = data || {};

  const handleExportCSV = () => {
    if (viewMode === 'activity') {
      exportToCSV(activityData as Record<string, unknown>[], `sdr-atividades-por-tipo-${format(new Date(), "yyyy-MM-dd")}`, ["label", "calls", "emails", "meetings", "linkedin", "whatsapp", "total"]);
    } else {
      exportToCSV(comparisonData as Record<string, unknown>[], `sdr-comparacao-${format(new Date(), "yyyy-MM-dd")}`, ["label", ...sdrs.map(sdr => sdr.id)]);
    }
    toast.success("CSV exportado com sucesso");
  };

  if (!activityData.length && !comparisonData.length) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            Tendência de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActivities = totals ? totals.calls + totals.emails + totals.meetings + totals.linkedin + totals.whatsapp : 0;

  return (
    <Card className="glass border-border/40 hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            Tendência de Atividades
          </CardTitle>
          {totalActivities > 0 && viewMode === 'activity' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-foreground">{totalActivities}</span>
            </div>
          )}
          {viewMode === 'comparison' && underperformingSDRs.length > 0 && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="gap-1.5 cursor-help animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {underperformingSDRs.length} abaixo da meta
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">SDRs consistentemente abaixo da meta:</p>
                    <ul className="space-y-1">
                      {underperformingSDRs.map(sdr => (
                        <li key={sdr.id} className="text-xs flex items-center justify-between gap-3">
                          <span>{sdr.name}</span>
                          <span className="text-destructive font-medium">{sdr.consecutiveDays} dias | -{sdr.avgDeficit}/dia</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar CSV</TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="activity" className="text-xs px-3"><Activity className="w-3.5 h-3.5 mr-1.5" />Por Tipo</TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs px-3"><BarChart3 className="w-3.5 h-3.5 mr-1.5" />Por SDR</TabsTrigger>
            </TabsList>
          </Tabs>
          {viewMode === 'activity' && (
            <Select value={selectedSDR} onValueChange={setSelectedSDR}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrar SDR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os SDRs</SelectItem>
                {sdrs.map(sdr => (<SelectItem key={sdr.id} value={sdr.id}>{sdr.name}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
          {viewMode === 'comparison' && (
            <Select value={activityTypeFilter} onValueChange={(v) => setActivityTypeFilter(v as ActivityTypeFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="call">Ligações</SelectItem>
                <SelectItem value="email">E-mails</SelectItem>
                <SelectItem value="meeting">Reuniões</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'activity' ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                {Object.entries(ACTIVITY_COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              {dailyGoal > 0 && (
                <ReferenceLine y={dailyGoal} stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeWidth={1.5}
                  label={{ value: `Meta: ${dailyGoal}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 11 }} />
              )}
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const dataPoint = activityData.find(p => p.label === label);
                return (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <span className="text-xs font-medium text-muted-foreground">Total: {(dataPoint as Record<string, number>)?.total ?? 0}</span>
                    </div>
                    <div className="space-y-1">
                      {payload.map((entry: { name?: string; value?: number; color?: string; dataKey?: string; stroke?: string }) => (
                        <div key={entry.dataKey} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
                          <span className="text-xs text-muted-foreground">{ACTIVITY_LABELS[entry.dataKey] || entry.dataKey}</span>
                          <span className="text-xs font-semibold ml-auto">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }} />
              <Legend formatter={(value) => ACTIVITY_LABELS[value] || value} wrapperStyle={{ paddingTop: '20px' }} />
              {(['calls', 'emails', 'meetings', 'linkedin', 'whatsapp'] as const).map(key => (
                <Area key={key} type="monotone" dataKey={key} stroke={ACTIVITY_COLORS[key]} fill={`url(#gradient-${key})`} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
                return (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <span className="text-xs font-medium text-muted-foreground">Total: {total}</span>
                    </div>
                    <div className="space-y-1">
                      {payload.sort((a: { value?: number }, b: { value?: number }) => (b.value || 0) - (a.value || 0)).map((entry: { name?: string; value?: number; color?: string; dataKey?: string; stroke?: string }) => {
                        const sdr = sdrs.find(s => s.id === entry.dataKey);
                        const goal = sdrGoals[entry.dataKey] || 0;
                        const diff = goal > 0 ? (entry.value as number) - goal : 0;
                        return (
                          <div key={entry.dataKey} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
                              <span className="text-xs text-muted-foreground">{sdr?.name || entry.dataKey}</span>
                              <span className={`text-xs font-semibold ml-auto ${goal > 0 ? diff >= 0 ? 'text-success' : 'text-destructive' : ''}`}>{entry.value}</span>
                            </div>
                            {goal > 0 && (<div className="ml-4 text-[10px] text-muted-foreground">Meta: {goal} | {diff >= 0 ? '+' : ''}{diff}</div>)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }} />
              <Legend formatter={(value) => { const sdr = sdrs.find(s => s.id === value); return sdr?.name || value; }} wrapperStyle={{ paddingTop: '20px' }} />
              {sdrs.map((sdr, index) => (
                <Line key={sdr.id} type="monotone" dataKey={sdr.id} name={sdr.id} stroke={COLORS[index % COLORS.length]} strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
