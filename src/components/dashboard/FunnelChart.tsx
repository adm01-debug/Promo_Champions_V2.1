import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const STAGE_ORDER = ["pending", "qualified", "proposal", "negotiation", "completed"];
const STAGE_LABELS: Record<string, string> = {
  pending: "Leads",
  qualified: "Qualificados",
  proposal: "Proposta",
  negotiation: "Negociação",
  completed: "Fechados",
};
const STAGE_COLORS = [
  "hsl(var(--primary))",
  "hsl(262, 70%, 60%)",
  "hsl(var(--warning))",
  "hsl(30, 85%, 55%)",
  "hsl(var(--success))",
];

export const FunnelChart: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["funnel-chart-real"],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("status");
      if (error) throw error;

      const counts: Record<string, number> = {};
      (sales || []).forEach(s => {
        const status = s.status || "pending";
        counts[status] = (counts[status] || 0) + 1;
      });

      return STAGE_ORDER.map((stage, i) => ({
        stage: STAGE_LABELS[stage] || stage,
        value: counts[stage] || 0,
        color: STAGE_COLORS[i],
      }));
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;


  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Funil de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.some(d => d.value > 0) ? (
          <div className="space-y-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 5 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={80}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [`${v} deals`, "Quantidade"]}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Conversion rates between stages */}
            <div className="flex items-center justify-between px-2">
              {data.slice(0, -1).map((stage, i) => {
                const next = data[i + 1];
                const convRate = stage.value > 0 ? Math.round((next.value / stage.value) * 100) : 0;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-primary">{convRate}%</span>
                    <span className="text-[9px] text-muted-foreground">→</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados no funil</p>
        )}
      </CardContent>
    </Card>
  );
};
