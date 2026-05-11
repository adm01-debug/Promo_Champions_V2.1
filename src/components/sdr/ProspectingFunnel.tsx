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
import { Target, Info } from "lucide-react";
import { motion } from "framer-motion";

export function ProspectingFunnel() {
  const { data: funnelData, isLoading } = useProspectingFunnel();

  if (isLoading) return <div className="h-[300px] flex items-center justify-center">Carregando funil...</div>;

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Funil de Prospecção
          </CardTitle>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
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
                tick={{ fontSize: 10, fontWeight: 'bold', fill: 'currentColor' }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-2 border-primary/30 rounded-lg shadow-xl">
                        <p className="text-[10px] font-bold uppercase">{payload[0].payload.stage}</p>
                        <p className="text-sm font-black text-primary">{payload[0].value} Leads</p>
                        <p className="text-[10px] text-muted-foreground">{payload[0].payload.percentage.toFixed(1)}% do total</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]} 
                barSize={32}
              >
                {funnelData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-5 gap-1">
           {funnelData?.map((item) => (
             <div key={item.stage} className="text-center">
               <div className="text-[10px] font-bold tabular-nums">{item.count}</div>
               <div className="text-[8px] text-muted-foreground uppercase truncate px-0.5">{item.stage}</div>
             </div>
           ))}
        </div>
      </CardContent>
    </Card>
  );
}