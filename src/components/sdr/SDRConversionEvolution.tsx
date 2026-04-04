import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { TrendingUp, Users } from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SDRConversionTooltip } from "./SDRConversionTooltip";

type PeriodFilter = 'week' | 'month' | 'quarter';

interface SDRConversionEvolutionProps {
  period: PeriodFilter;
}

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

const useSDRConversionEvolution = (period: PeriodFilter) => {
  return useQuery({
    queryKey: ['sdr-conversion-evolution', period],
    queryFn: async () => {
      const now = new Date();
      const startDate = period === 'week' ? subDays(now, 7) : period === 'month' ? subMonths(now, 1) : subMonths(now, 3);

      const { data: sdrs } = await supabase.from('salespeople').select('id, name').eq('is_active', true).in('role', ['sdr', 'hybrid']);
      if (!sdrs?.length) return { chartData: [], sdrs: [], overallAverage: 0 };

      const { data: activities } = await supabase.from('activities').select('salesperson_id, created_at, outcome').gte('created_at', startDate.toISOString()).in('salesperson_id', sdrs.map(s => s.id));
      const { data: sales } = await supabase.from('sales').select('salesperson_id, created_at').gte('created_at', startDate.toISOString()).in('salesperson_id', sdrs.map(s => s.id));

      const useWeekly = period === 'quarter';
      const intervals = useWeekly
        ? eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start: startDate, end: now });

      const chartData = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeekly ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}` : format(date, 'dd/MM', { locale: ptBR });
        const point: any = { date: dateKey, label, teamAverage: 0, teamMeetings: 0, teamLeads: 0, details: {} };
        let totalMeetings = 0, totalLeads = 0;

        sdrs.forEach(sdr => {
          const matchFn = (d: string) => useWeekly ? format(startOfWeek(new Date(d), { weekStartsOn: 1 }), 'yyyy-MM-dd') === dateKey : format(new Date(d), 'yyyy-MM-dd') === dateKey;
          const meetings = activities?.filter(a => a.salesperson_id === sdr.id && a.outcome === 'scheduled' && matchFn(a.created_at)).length ?? 0;
          const leads = sales?.filter(s => s.salesperson_id === sdr.id && matchFn(s.created_at)).length ?? 0;
          totalMeetings += meetings; totalLeads += leads;
          const rate = leads > 0 ? Math.round((meetings / leads) * 100) : 0;
          point[sdr.id] = rate;
          point.details[sdr.id] = { meetings, leads, rate };
        });

        point.teamMeetings = totalMeetings;
        point.teamLeads = totalLeads;
        point.teamAverage = totalLeads > 0 ? Math.round((totalMeetings / totalLeads) * 100) : 0;
        return point;
      });

      const validAverages = chartData.filter(p => p.teamAverage > 0).map(p => p.teamAverage);
      const overallAverage = validAverages.length > 0 ? Math.round(validAverages.reduce((a: number, b: number) => a + b, 0) / validAverages.length) : 0;
      return { chartData, sdrs, overallAverage };
    },
    staleTime: 60000,
  });
};

export function SDRConversionEvolution({ period }: SDRConversionEvolutionProps) {
  const [selectedSDR, setSelectedSDR] = useState<string>("all");
  const { data, isLoading } = useSDRConversionEvolution(period);

  if (isLoading) {
    return (<Card className="glass border-border/40"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>);
  }

  const { chartData = [], sdrs = [], overallAverage = 0 } = data || {};
  const displayedSDRs = selectedSDR === "all" ? sdrs : sdrs.filter(s => s.id === selectedSDR);

  if (!chartData.length || !sdrs.length) {
    return (
      <Card className="glass border-border/40"><CardHeader><CardTitle className="flex items-center gap-2 font-display"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>Evolução de Conversão SDR</CardTitle></CardHeader><CardContent><div className="h-[300px] flex items-center justify-center text-muted-foreground">Nenhum dado disponível para o período selecionado</div></CardContent></Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            Evolução de Conversão SDR
          </CardTitle>
          {overallAverage > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <span className="text-muted-foreground">Média:</span>
              <span className="font-semibold text-foreground">{overallAverage}%</span>
            </div>
          )}
        </div>
        <Select value={selectedSDR} onValueChange={setSelectedSDR}>
          <SelectTrigger className="w-[180px] h-9 text-sm"><Users className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Filtrar SDR" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os SDRs</SelectItem>
            {sdrs.map(sdr => (<SelectItem key={sdr.id} value={sdr.id}>{sdr.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            {overallAverage > 0 && <ReferenceLine y={overallAverage} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `Média ${overallAverage}%`, position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />}
            <Tooltip content={<SDRConversionTooltip chartData={chartData} sdrs={sdrs} />} />
            <Legend formatter={(value) => value === 'teamAverage' ? 'Média Equipe' : sdrs.find(s => s.id === value)?.name || value} wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="teamAverage" name="teamAverage" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            {displayedSDRs.map((sdr) => {
              const ci = sdrs.findIndex(s => s.id === sdr.id);
              return <Line key={sdr.id} type="monotone" dataKey={sdr.id} name={sdr.id} stroke={COLORS[ci % COLORS.length]} strokeWidth={2} dot={{ fill: COLORS[ci % COLORS.length], strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />;
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
