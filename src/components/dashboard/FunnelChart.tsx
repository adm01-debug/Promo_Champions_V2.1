import { FC, useMemo } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGE_ORDER = ["pending", "qualified", "proposal", "negotiation", "completed"];
const STAGE_LABELS: Record<string, string> = {
  pending: "Leads",
  qualified: "Verified",
  proposal: "Proposal",
  negotiation: "Sync",
  completed: "Locked",
};
const STAGE_COLORS = [
  "rgba(14, 165, 233, 0.4)",
  "rgba(14, 165, 233, 0.55)",
  "rgba(14, 165, 233, 0.7)",
  "rgba(14, 165, 233, 0.85)",
  "rgba(34, 197, 94, 0.8)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl border-l-4 border-l-primary">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {payload[0].payload.stage}
        </p>
        <div className="flex items-center gap-2">
           <p className="text-lg font-mono font-black text-foreground tabular-nums">
            {payload[0].value} <span className="text-[10px] text-muted-foreground uppercase">Units</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

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

  if (isLoading) {
    return (
      <Card className="h-full bg-black/40 border-white/5 backdrop-blur-md">
        <div className="p-6 h-[300px] flex items-center justify-center">
           <div className="flex flex-col items-center gap-3">
              <Zap className="h-8 w-8 text-primary/40 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-primary/40 animate-pulse">Mapping Funnel Layers</span>
           </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Filter className="h-3.5 w-3.5" />
          </div>
          Conversion Vortex
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        {data && data.some(d => d.value > 0) ? (
          <div className="space-y-6">
            <div className="relative">
               {/* Vertical decorative stream */}
              <div className="absolute left-[79px] top-0 bottom-0 w-[1px] bg-white/5" />
              
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={80}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {data.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.color} 
                        className="transition-all duration-300"
                        style={{ filter: `drop-shadow(0 0 10px ${entry.color.replace('0.4', '0.2')})` }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Macro Conversion stats */}
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
              {data.slice(0, -1).map((stage, i) => {
                const next = data[i + 1];
                const convRate = stage.value > 0 ? Math.round((next.value / stage.value) * 100) : 0;
                return (
                  <div key={i} className="flex flex-col items-center justify-center p-1.5 border-r border-white/5 last:border-r-0">
                    <span className="text-[10px] font-mono font-black text-primary" style={{ textShadow: '0 0 8px rgba(14,165,233,0.3)' }}>{convRate}%</span>
                    <span className="text-[7px] font-mono uppercase tracking-tighter text-muted-foreground/60">Stage {i+1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 opacity-30">
            <Filter className="h-8 w-8 text-muted-foreground animate-pulse mb-3" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-center">Spectral frequency: Empty Vortex</p>
          </div>
        )}
      </CardContent>

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 left-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </Card>
  );
});

FunnelChart.displayName = "FunnelChart";