import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Users } from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PeriodFilter = 'week' | 'month' | 'quarter';

interface SDRActivityTrendProps {
  period: PeriodFilter;
}

interface SDR {
  id: string;
  name: string;
}

interface ChartDataPoint {
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

const useSDRActivityTrend = (period: PeriodFilter, selectedSDR: string) => {
  return useQuery({
    queryKey: ['sdr-activity-trend', period, selectedSDR],
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

      if (!sdrs?.length) return { chartData: [], sdrs: [], totals: { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 } };

      // Build query for activities
      let activitiesQuery = supabase
        .from('activities')
        .select('salesperson_id, created_at, activity_type')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', sdrs.map(s => s.id));

      if (selectedSDR !== 'all') {
        activitiesQuery = activitiesQuery.eq('salesperson_id', selectedSDR);
      }

      const { data: activities } = await activitiesQuery;

      // Generate date intervals
      const useWeeklyAggregation = period === 'quarter';
      const intervals = useWeeklyAggregation
        ? eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start: startDate, end: now });

      // Build chart data
      const chartData: ChartDataPoint[] = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeeklyAggregation
          ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}`
          : format(date, 'dd/MM', { locale: ptBR });

        const point: ChartDataPoint = { 
          date: dateKey, 
          label, 
          calls: 0, 
          emails: 0, 
          meetings: 0, 
          linkedin: 0, 
          whatsapp: 0,
          total: 0
        };

        activities?.forEach(activity => {
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

      // Calculate totals
      const totals = chartData.reduce((acc, point) => ({
        calls: acc.calls + point.calls,
        emails: acc.emails + point.emails,
        meetings: acc.meetings + point.meetings,
        linkedin: acc.linkedin + point.linkedin,
        whatsapp: acc.whatsapp + point.whatsapp,
      }), { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 });

      return { chartData, sdrs, totals };
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
  const { data, isLoading } = useSDRActivityTrend(period, selectedSDR);

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

  const { chartData = [], sdrs = [], totals } = data || {};

  if (!chartData.length) {
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
          {totalActivities > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-foreground">{totalActivities}</span>
            </div>
          )}
        </div>
        <Select value={selectedSDR} onValueChange={setSelectedSDR}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
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
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                
                const dataPoint = chartData.find(p => p.label === label);
                
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
      </CardContent>
    </Card>
  );
}
