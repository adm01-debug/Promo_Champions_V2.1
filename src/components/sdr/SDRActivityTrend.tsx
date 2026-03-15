import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Activity, Users, BarChart3, AlertTriangle, Download } from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportToCSV, formatDateForExport } from "@/utils/csvExport";
import { toast } from "sonner";

type PeriodFilter = 'week' | 'month' | 'quarter';
type ViewMode = 'activity' | 'comparison';
type ActivityTypeFilter = 'all' | 'call' | 'email' | 'meeting' | 'linkedin' | 'whatsapp';

interface SDRActivityTrendProps {
  period: PeriodFilter;
}

interface SDR {
  id: string;
  name: string;
}

interface ActivityChartDataPoint {
  date: string;
  label: string;
  calls: number;
  emails: number;
  meetings: number;
  linkedin: number;
  whatsapp: number;
  total: number;
  [key: string]: number | string;
}

interface ComparisonChartDataPoint {
  date: string;
  label: string;
  [key: string]: number | string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const useSDRActivityTrend = (period: PeriodFilter, selectedSDR: string, viewMode: ViewMode, activityTypeFilter: ActivityTypeFilter) => {
  return useQuery({
    queryKey: ['sdr-activity-trend', period, selectedSDR, viewMode, activityTypeFilter],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subMonths(now, 1);
          break;
        case 'quarter':
          startDate = subMonths(now, 3);
          break;
      }

      // Fetch SDRs
      const { data: sdrs } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true)
        .in('role', ['sdr', 'hybrid']);

      if (!sdrs?.length) return { 
        activityData: [], 
        comparisonData: [], 
        sdrs: [], 
        totals: { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 },
        dailyGoal: 0,
        sdrGoals: {} as Record<string, number>
      };

      // Fetch activity goals
      const { data: goals } = await supabase
        .from('activity_goals')
        .select('salesperson_id, calls_goal, emails_goal, meetings_goal, linkedin_goal, whatsapp_goal')
        .in('salesperson_id', sdrs.map(s => s.id));

      // Calculate goals
      const sdrGoals: Record<string, number> = {};
      let totalDailyGoal = 0;

      if (selectedSDR !== 'all') {
        const sdrGoal = goals?.find(g => g.salesperson_id === selectedSDR);
        if (sdrGoal) {
          totalDailyGoal = sdrGoal.calls_goal + sdrGoal.emails_goal + sdrGoal.meetings_goal + sdrGoal.linkedin_goal + sdrGoal.whatsapp_goal;
        }
      } else {
        goals?.forEach(goal => {
          const sdrTotal = goal.calls_goal + goal.emails_goal + goal.meetings_goal + goal.linkedin_goal + goal.whatsapp_goal;
          sdrGoals[goal.salesperson_id] = sdrTotal;
          totalDailyGoal += sdrTotal;
        });
      }

      // Build query for activities
      let activitiesQuery = supabase
        .from('activities')
        .select('salesperson_id, created_at, activity_type')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', sdrs.map(s => s.id));

      if (viewMode === 'activity' && selectedSDR !== 'all') {
        activitiesQuery = activitiesQuery.eq('salesperson_id', selectedSDR);
      }

      const { data: activities } = await activitiesQuery;

      // Generate date intervals
      const useWeeklyAggregation = period === 'quarter';
      const intervals = useWeeklyAggregation
        ? eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start: startDate, end: now });

      // Build activity chart data (by type)
      const activityData: ActivityChartDataPoint[] = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeeklyAggregation
          ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}`
          : format(date, 'dd/MM', { locale: ptBR });

        const point: ActivityChartDataPoint = { 
          date: dateKey, 
          label, 
          calls: 0, 
          emails: 0, 
          meetings: 0, 
          linkedin: 0, 
          whatsapp: 0,
          total: 0
        };

        const filteredActivities = viewMode === 'activity' && selectedSDR !== 'all'
          ? activities?.filter(a => a.salesperson_id === selectedSDR)
          : activities;

        filteredActivities?.forEach(activity => {
          const actDate = new Date(activity.created_at);
          const matchDate = useWeeklyAggregation
            ? format(startOfWeek(actDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') === dateKey
            : format(actDate, 'yyyy-MM-dd') === dateKey;

          if (matchDate) {
            switch (activity.activity_type) {
              case 'call':
                point.calls++;
                break;
              case 'email':
                point.emails++;
                break;
              case 'meeting':
                point.meetings++;
                break;
              case 'linkedin':
                point.linkedin++;
                break;
              case 'whatsapp':
                point.whatsapp++;
                break;
            }
            point.total++;
          }
        });

        return point;
      });

      // Build comparison chart data (by SDR)
      const comparisonData: ComparisonChartDataPoint[] = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeeklyAggregation
          ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}`
          : format(date, 'dd/MM', { locale: ptBR });

        const point: ComparisonChartDataPoint = { date: dateKey, label };

        sdrs.forEach(sdr => {
          const sdrActivities = activities?.filter(a => {
            const actDate = new Date(a.created_at);
            const matchDate = useWeeklyAggregation
              ? format(startOfWeek(actDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') === dateKey
              : format(actDate, 'yyyy-MM-dd') === dateKey;
            const matchType = activityTypeFilter === 'all' || a.activity_type === activityTypeFilter;
            return a.salesperson_id === sdr.id && matchDate && matchType;
          }).length ?? 0;

          point[sdr.id] = sdrActivities;
        });

        return point;
      });

      // Calculate totals
      const totals = activityData.reduce((acc, point) => ({
        calls: acc.calls + point.calls,
        emails: acc.emails + point.emails,
        meetings: acc.meetings + point.meetings,
        linkedin: acc.linkedin + point.linkedin,
        whatsapp: acc.whatsapp + point.whatsapp,
      }), { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 });

      // Calculate underperforming SDRs based on the selected period
      // Use all data points from the period, not just last 7 days
      const underperformingSDRs: { id: string; name: string; consecutiveDays: number; avgDeficit: number }[] = [];
      
      // Determine how many consecutive days threshold based on period
      const consecutiveThreshold = period === 'week' ? 2 : period === 'month' ? 3 : 5;
      
      sdrs.forEach(sdr => {
        const goal = sdrGoals[sdr.id] || 0;
        if (goal <= 0) return;
        
        let consecutiveCount = 0;
        let maxConsecutive = 0;
        let totalDeficit = 0;
        let deficitDays = 0;
        
        // Use all data from the selected period
        comparisonData.forEach(point => {
          const value = (point[sdr.id] as number) || 0;
          if (value < goal) {
            consecutiveCount++;
            totalDeficit += (goal - value);
            deficitDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
          } else {
            consecutiveCount = 0;
          }
        });
        
        if (maxConsecutive >= consecutiveThreshold) {
          underperformingSDRs.push({
            id: sdr.id,
            name: sdr.name,
            consecutiveDays: maxConsecutive,
            avgDeficit: deficitDays > 0 ? Math.round(totalDeficit / deficitDays) : 0,
          });
        }
      });

      return { activityData, comparisonData, sdrs, totals, dailyGoal: totalDailyGoal, sdrGoals, underperformingSDRs };
    },
    staleTime: 60000,
  });
};

const ACTIVITY_COLORS = {
  calls: 'hsl(var(--chart-1))',
  emails: 'hsl(var(--chart-2))',
  meetings: 'hsl(var(--chart-3))',
  linkedin: 'hsl(var(--chart-4))',
  whatsapp: 'hsl(var(--chart-5))',
};

const ACTIVITY_LABELS: Record<string, string> = {
  calls: 'Ligações',
  emails: 'E-mails',
  meetings: 'Reuniões',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

export function SDRActivityTrend({ period }: SDRActivityTrendProps) {
  const [selectedSDR, setSelectedSDR] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("activity");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeFilter>("all");
  const { data, isLoading } = useSDRActivityTrend(period, selectedSDR, viewMode, activityTypeFilter);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const { activityData = [], comparisonData = [], sdrs = [], totals, dailyGoal = 0, sdrGoals = {}, underperformingSDRs = [] } = data || {};

  const handleExportCSV = () => {
    if (viewMode === 'activity') {
      exportToCSV(
        activityData as Record<string, unknown>[],
        `sdr-atividades-por-tipo-${format(new Date(), "yyyy-MM-dd")}`,
        ["label", "calls", "emails", "meetings", "linkedin", "whatsapp", "total"]
      );
    } else {
      exportToCSV(
        comparisonData as Record<string, unknown>[],
        `sdr-comparacao-${format(new Date(), "yyyy-MM-dd")}`,
        ["label", ...sdrs.map(sdr => sdr.id)]
      );
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
                          <span className="text-destructive font-medium">
                            {sdr.consecutiveDays} dias | -{sdr.avgDeficit}/dia
                          </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar CSV</TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="activity" className="text-xs px-3">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Por Tipo
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs px-3">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Por SDR
              </TabsTrigger>
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
                {sdrs.map(sdr => (
                  <SelectItem key={sdr.id} value={sdr.id}>
                    {sdr.name}
                  </SelectItem>
                ))}
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
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              {dailyGoal > 0 && (
                <ReferenceLine 
                  y={dailyGoal} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `Meta: ${dailyGoal}`,
                    position: 'right',
                    fill: 'hsl(var(--primary))',
                    fontSize: 11,
                  }}
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  
                  const dataPoint = activityData.find(p => p.label === label);
                  
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-foreground text-sm">{label}</p>
                        <span className="text-xs font-medium text-muted-foreground">
                          Total: {dataPoint?.total ?? 0}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((entry: any) => (
                          <div key={entry.dataKey} className="flex items-center gap-2">
                            <div 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: entry.stroke }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {ACTIVITY_LABELS[entry.dataKey] || entry.dataKey}
                            </span>
                            <span className="text-xs font-semibold ml-auto">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend 
                formatter={(value) => ACTIVITY_LABELS[value] || value}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke={ACTIVITY_COLORS.calls}
                fill={`url(#gradient-calls)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="emails"
                stroke={ACTIVITY_COLORS.emails}
                fill={`url(#gradient-emails)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="meetings"
                stroke={ACTIVITY_COLORS.meetings}
                fill={`url(#gradient-meetings)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="linkedin"
                stroke={ACTIVITY_COLORS.linkedin}
                fill={`url(#gradient-linkedin)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="whatsapp"
                stroke={ACTIVITY_COLORS.whatsapp}
                fill={`url(#gradient-whatsapp)`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  
                  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
                  
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-foreground text-sm">{label}</p>
                        <span className="text-xs font-medium text-muted-foreground">
                          Total: {total}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {payload.sort((a: any, b: any) => (b.value || 0) - (a.value || 0)).map((entry: any) => {
                          const sdr = sdrs.find(s => s.id === entry.dataKey);
                          const goal = sdrGoals[entry.dataKey] || 0;
                          const diff = goal > 0 ? (entry.value as number) - goal : 0;
                          return (
                            <div key={entry.dataKey} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full" 
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {sdr?.name || entry.dataKey}
                                </span>
                                <span className={`text-xs font-semibold ml-auto ${
                                  goal > 0 
                                    ? diff >= 0 ? 'text-emerald-500' : 'text-red-500'
                                    : ''
                                }`}>
                                  {entry.value}
                                </span>
                              </div>
                              {goal > 0 && (
                                <div className="ml-4 text-[10px] text-muted-foreground">
                                  Meta: {goal} | {diff >= 0 ? '+' : ''}{diff}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend 
                formatter={(value) => {
                  const sdr = sdrs.find(s => s.id === value);
                  return sdr?.name || value;
                }}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {sdrs.map((sdr, index) => (
                <Line
                  key={sdr.id}
                  type="monotone"
                  dataKey={sdr.id}
                  name={sdr.id}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
