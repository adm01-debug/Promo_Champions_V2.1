import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(252, 87%, 64%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
];

export function GamificationComparativeChart() {
  const [period, setPeriod] = useState<"7" | "14" | "30">("14");
  const [selectedSalespeople, setSelectedSalespeople] = useState<string[]>([]);

  // Fetch salespeople with XP
  const { data: salespeople, isLoading: isLoadingSalespeople } = useQuery({
    queryKey: ["salespeople-with-xp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select(`
          id,
          name,
          salesperson_xp (total_xp, current_level)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch XP history for selected period
  const { data: xpHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["xp-history-comparative", period, selectedSalespeople],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(period));
      
      let query = supabase
        .from("xp_history")
        .select("salesperson_id, xp_amount, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (selectedSalespeople.length > 0) {
        query = query.in("salesperson_id", selectedSalespeople);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: salespeople && salespeople.length > 0,
  });

  // Process data for chart
  const chartData = useMemo(() => {
    if (!xpHistory || !salespeople) return [];

    const startDate = subDays(new Date(), parseInt(period));
    const days = eachDayOfInterval({ start: startDate, end: new Date() });

    // Get active salespeople (selected or top 5 by XP)
    const activeSalespeople = selectedSalespeople.length > 0
      ? salespeople.filter(s => selectedSalespeople.includes(s.id))
      : salespeople
          .filter(s => s.salesperson_xp)
          .sort((a, b) => (b.salesperson_xp?.total_xp || 0) - (a.salesperson_xp?.total_xp || 0))
          .slice(0, 5);

    // Create cumulative XP per day per salesperson
    const cumulativeData: Record<string, Record<string, number>> = {};
    
    activeSalespeople.forEach(sp => {
      cumulativeData[sp.id] = {};
      let cumulative = 0;
      
      days.forEach(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayXP = xpHistory
          .filter(h => 
            h.salesperson_id === sp.id && 
            format(new Date(h.created_at), "yyyy-MM-dd") === dayStr
          )
          .reduce((sum, h) => sum + h.xp_amount, 0);
        
        cumulative += dayXP;
        cumulativeData[sp.id][dayStr] = cumulative;
      });
    });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dataPoint: Record<string, any> = {
        date: format(day, "dd/MM", { locale: ptBR }),
        fullDate: dayStr,
      };

      activeSalespeople.forEach(sp => {
        dataPoint[sp.name] = cumulativeData[sp.id][dayStr] || 0;
      });

      return dataPoint;
    });
  }, [xpHistory, salespeople, selectedSalespeople, period]);

  // Get displayed salespeople names
  const displayedSalespeople = useMemo(() => {
    if (!salespeople) return [];
    if (selectedSalespeople.length > 0) {
      return salespeople.filter(s => selectedSalespeople.includes(s.id));
    }
    return salespeople
      .filter(s => s.salesperson_xp)
      .sort((a, b) => (b.salesperson_xp?.total_xp || 0) - (a.salesperson_xp?.total_xp || 0))
      .slice(0, 5);
  }, [salespeople, selectedSalespeople]);

  const handleSalespersonToggle = (id: string) => {
    setSelectedSalespeople(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 8) return prev;
      return [...prev, id];
    });
  };

  if (isLoadingSalespeople) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Dashboard Comparativo de XP</CardTitle>
              <p className="text-sm text-muted-foreground">Evolução de XP entre vendedores</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={(v) => setPeriod(v as "7" | "14" | "30")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salesperson selector */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Selecione até 8 vendedores para comparar (ou deixe vazio para ver top 5):
          </p>
          <div className="flex flex-wrap gap-2">
            {salespeople?.map((sp) => (
              <Badge
                key={sp.id}
                variant={selectedSalespeople.includes(sp.id) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => handleSalespersonToggle(sp.id)}
              >
                {sp.name}
                {sp.salesperson_xp && (
                  <span className="ml-1 opacity-70">
                    ({sp.salesperson_xp.total_xp} XP)
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingHistory ? (
          <Skeleton className="h-80 w-full" />
        ) : chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                  label={{ value: 'XP Acumulado', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                  labelStyle={{ fontWeight: "bold", marginBottom: "8px" }}
                />
                <Legend />
                {displayedSalespeople.map((sp, index) => (
                  <Line
                    key={sp.id}
                    type="monotone"
                    dataKey={sp.name}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum dado de XP encontrado para o período selecionado</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
