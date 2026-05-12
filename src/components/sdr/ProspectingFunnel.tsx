import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProspectingFunnel() {
  return useQuery({
    queryKey: ["prospecting-funnel"],
    queryFn: async () => {
      const { data: sales } = await supabase.from("sales").select("status");
      
      const statusCounts = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        completed: 0,
      };

      sales?.forEach(sale => {
        const status = sale.status as keyof typeof statusCounts;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      const total = sales?.length || 1;

      return [
        { stage: "Leads", count: statusCounts.lead, percentage: (statusCounts.lead / total) * 100, color: "#6366f1" },
        { stage: "Qualificados", count: statusCounts.qualified, percentage: (statusCounts.qualified / total) * 100, color: "#8b5cf6" },
        { stage: "Proposta", count: statusCounts.proposal, percentage: (statusCounts.proposal / total) * 100, color: "#a855f7" },
        { stage: "Negociação", count: statusCounts.negotiation, percentage: (statusCounts.negotiation / total) * 100, color: "#d946ef" },
        { stage: "Fechados", count: statusCounts.completed, percentage: (statusCounts.completed / total) * 100, color: "#22c55e" },
      ];
    },
  });
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Target, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function ProspectingFunnel() {
  const { data: funnelData, isLoading } = useProspectingFunnel();

  if (isLoading) return (
    <Card className="glass border-primary/20 h-[380px] flex items-center justify-center">
       <div className="flex flex-col items-center gap-2">
         <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
         <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Analyzing Funnel...</span>
       </div>
    </Card>
  );

  return (
    <Card className="glass border-primary/30 bg-black/40 backdrop-blur-xl overflow-hidden relative group">
      {/* Decorative scanline */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 z-0 pointer-events-none"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <CardHeader className="pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="h-3.5 w-3.5" />
            </div>
            Prospecting Funnel
          </CardTitle>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-success uppercase tracking-widest bg-success/10 px-2 py-0.5 rounded border border-success/20">
            <Zap className="h-3 w-3" />
            Active Sync
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 relative z-10">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="stage" 
                type="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 800, fill: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-4 border-primary/30 rounded-xl shadow-2xl backdrop-blur-xl">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.stage}</p>
                        <p className="text-xl font-mono font-black text-primary italic tracking-tighter">{payload[0].value} LEADS</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${payload[0].payload.percentage}%` }} />
                           </div>
                           <p className="text-[10px] font-mono font-bold text-primary">{payload[0].payload.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 8, 8, 0]} 
                barSize={24}
              >
                {funnelData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    fillOpacity={0.6}
                    stroke={entry.color}
                    strokeWidth={1}
                    className="hover:fill-opacity-100 transition-all duration-300 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 grid grid-cols-5 gap-2">
           {funnelData?.map((item) => (
             <div key={item.stage} className="text-center group/item hover:scale-110 transition-transform">
               <div className="text-xs font-mono font-black tabular-nums text-foreground">{item.count}</div>
               <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest truncate mt-1 group-hover/item:text-primary transition-colors">{item.stage}</div>
               <div className="mt-1.5 h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full" style={{ backgroundColor: item.color, width: `${item.percentage}%` }} />
               </div>
             </div>
           ))}
        </div>
      </CardContent>
    </Card>
  );
}
