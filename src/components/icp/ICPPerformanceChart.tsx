import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Percent, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ICPPerformanceChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["icp-performance-stats"],
    queryFn: async () => {
      // Fetch all outcomes with client_id
      const { data: outcomes, error } = await supabase
        .from("deal_outcomes")
        .select(`
          outcome,
          sales (amount, client_id)
        `);

      if (error) throw error;

      // Fetch all ICP statuses
      const { data: icpData } = await supabase
        .from("icp_data")
        .select("client_id, is_icp_match");

      const icpMap = new Map<string, boolean>();
      icpData?.forEach(item => icpMap.set(item.client_id, !!item.is_icp_match));

      const performance = {
        icp: { wins: 0, total: 0, amount: 0 },
        nonIcp: { wins: 0, total: 0, amount: 0 }
      };

      outcomes?.forEach((o: any) => {
        const clientId = o.sales?.client_id;
        const isIcp = icpMap.get(clientId) || false;
        const amount = o.sales?.amount || 0;

        const category = isIcp ? performance.icp : performance.nonIcp;
        category.total++;
        if (o.outcome === "won") {
          category.wins++;
          category.amount += amount;
        }
      });

      return [
        {
          name: "ICP",
          winRate: performance.icp.total > 0 ? (performance.icp.wins / performance.icp.total) * 100 : 0,
          avgTicket: performance.icp.wins > 0 ? performance.icp.amount / performance.icp.wins : 0,
          color: "#8b5cf6"
        },
        {
          name: "Non-ICP",
          winRate: performance.nonIcp.total > 0 ? (performance.nonIcp.wins / performance.nonIcp.total) * 100 : 0,
          avgTicket: performance.nonIcp.wins > 0 ? performance.nonIcp.amount / performance.nonIcp.wins : 0,
          color: "#94a3b8"
        }
      ];
    }
  });

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="glass border-border/40 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            Taxa de Conversão: ICP vs Non-ICP
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]} barSize={40}>
                {stats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass border-border/40 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Ticket Médio por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Ticket Médio']}
              />
              <Bar dataKey="avgTicket" radius={[4, 4, 0, 0]} barSize={40}>
                {stats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
