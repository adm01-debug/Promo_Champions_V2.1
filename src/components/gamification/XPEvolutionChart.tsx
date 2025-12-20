import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, Zap, Target, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LEVEL_THRESHOLDS } from "@/hooks/useSalespersonXP";

interface XPEvolutionChartProps {
  salespersonId?: string;
}

export function XPEvolutionChart({ salespersonId }: XPEvolutionChartProps) {
  const [period, setPeriod] = useState<"7" | "14" | "30" | "90">("30");

  // Fetch salespeople for selector
  const { data: salespeople } = useQuery({
    queryKey: ["salespeople-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const [selectedSalesperson, setSelectedSalesperson] = useState<string>(salespersonId || "");

  // Fetch XP history
  const { data: xpData, isLoading } = useQuery({
    queryKey: ["xp-evolution", selectedSalesperson, period],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(period));
      
      // Get XP history
      const { data: history, error: historyError } = await supabase
        .from("xp_history")
        .select("xp_amount, created_at, source_type, description")
        .eq("salesperson_id", selectedSalesperson)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (historyError) throw historyError;

      // Get current total XP
      const { data: xpRecord, error: xpError } = await supabase
        .from("salesperson_xp")
        .select("total_xp, current_level")
        .eq("salesperson_id", selectedSalesperson)
        .single();

      if (xpError && xpError.code !== "PGRST116") throw xpError;

      return {
        history: history || [],
        currentXP: xpRecord?.total_xp || 0,
        currentLevel: xpRecord?.current_level || 1,
      };
    },
    enabled: !!selectedSalesperson,
  });

  // Process chart data
  const chartData = useMemo(() => {
    if (!xpData?.history) return [];

    const startDate = subDays(new Date(), parseInt(period));
    const days = eachDayOfInterval({ start: startDate, end: new Date() });

    // Calculate starting XP (current total minus all XP gained in period)
    const totalGainedInPeriod = xpData.history.reduce((sum, h) => sum + h.xp_amount, 0);
    let runningTotal = xpData.currentXP - totalGainedInPeriod;

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayXP = xpData.history
        .filter(h => format(new Date(h.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((sum, h) => sum + h.xp_amount, 0);
      
      runningTotal += dayXP;

      return {
        date: format(day, "dd/MM", { locale: ptBR }),
        fullDate: format(day, "dd 'de' MMMM", { locale: ptBR }),
        xp: runningTotal,
        dailyGain: dayXP,
      };
    });
  }, [xpData, period]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!xpData?.history || xpData.history.length === 0) {
      return { totalGained: 0, avgDaily: 0, bestDay: 0, streak: 0 };
    }

    const totalGained = xpData.history.reduce((sum, h) => sum + h.xp_amount, 0);
    const daysWithXP = new Set(xpData.history.map(h => format(new Date(h.created_at), "yyyy-MM-dd"))).size;
    const avgDaily = daysWithXP > 0 ? Math.round(totalGained / daysWithXP) : 0;
    
    // Find best day
    const xpByDay: Record<string, number> = {};
    xpData.history.forEach(h => {
      const day = format(new Date(h.created_at), "yyyy-MM-dd");
      xpByDay[day] = (xpByDay[day] || 0) + h.xp_amount;
    });
    const bestDay = Math.max(...Object.values(xpByDay), 0);

    return { totalGained, avgDaily, bestDay, streak: daysWithXP };
  }, [xpData]);

  // Get next level threshold
  const nextLevelXP = xpData?.currentLevel 
    ? LEVEL_THRESHOLDS[Math.min(xpData.currentLevel, LEVEL_THRESHOLDS.length - 1)]
    : undefined;

  if (!salespersonId && salespeople?.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-xp/20 to-primary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-xp" />
            </div>
            <div>
              <CardTitle className="text-lg">Evolução de XP</CardTitle>
              <p className="text-sm text-muted-foreground">Acompanhe seu progresso ao longo do tempo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!salespersonId && (
              <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople?.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats row */}
        {selectedSalesperson && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-gradient-to-br from-xp/10 to-xp/5 rounded-lg p-3 border border-xp/20">
              <div className="flex items-center gap-2 text-xp mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Ganho no Período</span>
              </div>
              <p className="text-xl font-bold">{stats.totalGained.toLocaleString()} XP</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Média Diária</span>
              </div>
              <p className="text-xl font-bold">{stats.avgDaily.toLocaleString()} XP</p>
            </div>
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-3 border border-success/20">
              <div className="flex items-center gap-2 text-success mb-1">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">Melhor Dia</span>
              </div>
              <p className="text-xl font-bold">{stats.bestDay.toLocaleString()} XP</p>
            </div>
            <div className="bg-gradient-to-br from-streak/10 to-streak/5 rounded-lg p-3 border border-streak/20">
              <div className="flex items-center gap-2 text-streak mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Dias Ativos</span>
              </div>
              <p className="text-xl font-bold">{stats.streak} dias</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!selectedSalesperson ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            <p>Selecione um vendedor para ver a evolução de XP</p>
          </div>
        ) : isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--xp))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--xp))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                {nextLevelXP && (
                  <ReferenceLine 
                    y={nextLevelXP} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                    label={{ value: `Próximo Nível`, position: 'right', fontSize: 10 }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} XP`,
                    name === "xp" ? "Total" : "Ganho no dia"
                  ]}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(var(--xp))"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                  dot={{ r: 3, fill: "hsl(var(--xp))" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum XP ganho no período selecionado</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
