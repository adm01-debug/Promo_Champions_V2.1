import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodFilter = 'week' | 'month' | 'quarter';
export type ViewMode = 'activity' | 'comparison';
export type ActivityTypeFilter = 'all' | 'call' | 'email' | 'meeting' | 'linkedin' | 'whatsapp';

export interface ActivityChartDataPoint {
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

export interface ComparisonChartDataPoint {
  date: string;
  label: string;
  [key: string]: number | string;
}

export const ACTIVITY_COLORS: Record<string, string> = {
  calls: 'hsl(var(--chart-1))',
  emails: 'hsl(var(--chart-2))',
  meetings: 'hsl(var(--chart-3))',
  linkedin: 'hsl(var(--chart-4))',
  whatsapp: 'hsl(var(--chart-5))',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  calls: 'Ligações',
  emails: 'E-mails',
  meetings: 'Reuniões',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

export const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const useSDRActivityTrend = (period: PeriodFilter, selectedSDR: string, viewMode: ViewMode, activityTypeFilter: ActivityTypeFilter) => {
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

      const { data: sdrs } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true)
        .in('role', ['sdr', 'hybrid']);

      if (!sdrs?.length) return { 
        activityData: [] as Record<string, unknown>[], 
        comparisonData: [] as Record<string, unknown>[], 
        sdrs: [] as { id: string; name: string }[], 
        totals: { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 },
        dailyGoal: 0,
        sdrGoals: {} as Record<string, number>,
        underperformingSDRs: [] as { id: string; name: string; consecutiveDays: number; avgDeficit: number }[]
      };

      const { data: goals } = await supabase
        .from('activity_goals')
        .select('salesperson_id, calls_goal, emails_goal, meetings_goal, linkedin_goal, whatsapp_goal')
        .in('salesperson_id', sdrs.map(s => s.id));

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

      let activitiesQuery = supabase
        .from('activities')
        .select('salesperson_id, created_at, activity_type')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', sdrs.map(s => s.id));

      if (viewMode === 'activity' && selectedSDR !== 'all') {
        activitiesQuery = activitiesQuery.eq('salesperson_id', selectedSDR);
      }

      const { data: activities } = await activitiesQuery;

      const useWeeklyAggregation = period === 'quarter';
      const intervals = useWeeklyAggregation
        ? eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start: startDate, end: now });

      const activityData: ActivityChartDataPoint[] = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeeklyAggregation
          ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}`
          : format(date, 'dd/MM', { locale: ptBR });

        const point: ActivityChartDataPoint = { date: dateKey, label, calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0, total: 0 };

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
              case 'call': point.calls++; break;
              case 'email': point.emails++; break;
              case 'meeting': point.meetings++; break;
              case 'linkedin': point.linkedin++; break;
              case 'whatsapp': point.whatsapp++; break;
            }
            point.total++;
          }
        });

        return point;
      });

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

      const totals = activityData.reduce((acc, point) => ({
        calls: acc.calls + point.calls,
        emails: acc.emails + point.emails,
        meetings: acc.meetings + point.meetings,
        linkedin: acc.linkedin + point.linkedin,
        whatsapp: acc.whatsapp + point.whatsapp,
      }), { calls: 0, emails: 0, meetings: 0, linkedin: 0, whatsapp: 0 });

      const underperformingSDRs: { id: string; name: string; consecutiveDays: number; avgDeficit: number }[] = [];
      const consecutiveThreshold = period === 'week' ? 2 : period === 'month' ? 3 : 5;
      
      sdrs.forEach(sdr => {
        const goal = sdrGoals[sdr.id] || 0;
        if (goal <= 0) return;
        
        let consecutiveCount = 0;
        let maxConsecutive = 0;
        let totalDeficit = 0;
        let deficitDays = 0;
        
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
