import { FC, useMemo } from "react";
import React from "react";
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

export const FunnelChart: FC = React.memo(() => {
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
    <Card className="h-full border-none bg-gradient-to-br from-card/30 to-background shadow-lg shadow-black/5 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          Vortex de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.some(d => d.value > 0) ? (
          <div className="space-y-6">
            <div className="relative">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={80}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover/95 backdrop-blur-md border border-border/50 p-2 rounded-lg shadow-xl">
                            <p className="text-[10px] font-black uppercase text-muted-foreground">{payload[0].payload.stage}</p>
                            <p className="text-sm font-black text-foreground">{payload[0].value} Negócios</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                    {data.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.color} 
                        className="filter drop-shadow-[0_0_4px_rgba(var(--primary-rgb),0.2)]"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Conversion rates between stages */}
            <div className="flex items-center justify-around bg-muted/30 py-2 rounded-xl border border-border/10">
              {data.slice(0, -1).map((stage, i) => {
                const next = data[i + 1];
                const convRate = stage.value > 0 ? Math.round((next.value / stage.value) * 100) : 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-black text-primary">{convRate}%</span>
                    <div className="h-0.5 w-4 bg-primary/20 rounded-full" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <Filter className="h-10 w-10 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Aguardando Leads...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FunnelChart.displayName = "FunnelChart";
