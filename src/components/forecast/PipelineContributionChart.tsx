import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { formatCompactBRL, scenarioChartColor } from "./forecastHelpers";
import { UserCheck, BarChart3, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

interface OwnerRow {
  salesperson_id: string | null;
  weighted_forecast: number;
  pessimistic_30d: number;
  optimistic_30d: number;
}

interface Props {
  perOwner: OwnerRow[];
  ownerNames?: Record<string, string>;
}

export const PipelineContributionChart: FC<Props> = ({ perOwner, ownerNames = {} }) => {
  const data = useMemo(
    () =>
      [...perOwner]
        .filter((r) => r.salesperson_id)
        .sort((a, b) => Number(b.weighted_forecast) - Number(a.weighted_forecast))
        .slice(0, 8)
        .map((r) => ({
          name: ownerNames[r.salesperson_id ?? ""] ?? (r.salesperson_id ?? "").slice(0, 6),
          pessimista: Math.round(Number(r.pessimistic_30d)),
          realista: Math.round(Number(r.weighted_forecast)),
          otimista: Math.round(Number(r.optimistic_30d)),
        })),
    [perOwner, ownerNames],
  );

  if (data.length === 0) {
    return (
      <Card className="glass border-white/5 p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/10">
          <Users className="h-8 w-8 text-muted-foreground opacity-20" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
          Nenhum combatente ativo no pipeline neural
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 p-8 opacity-5 -ml-4 -mt-4 group-hover:-rotate-6 transition-transform duration-700">
        <Users className="h-24 w-24" />
      </div>
      
      <CardHeader className="pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
              <BarChart3 className="h-4 w-4" />
            </div>
            Matriz de Contribuição por Combatente
          </CardTitle>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Pessimista</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Realista</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Otimista</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 relative z-10">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ left: 30, right: 40, top: 0, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactBRL(Number(v))}
                className="text-[10px] font-black fill-muted-foreground/50 tracking-tighter"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                className="text-[10px] font-black fill-foreground/80 tracking-tight"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "rgba(10, 10, 10, 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
                formatter={(v: any) => [formatCompactBRL(v), "Forecast"]}
              />
              <Bar dataKey="pessimista" fill="#f97316" radius={[0, 6, 6, 0]} barSize={8} />
              <Bar dataKey="realista" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={12} />
              <Bar dataKey="otimista" fill="#10b981" radius={[0, 6, 6, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-50">
          <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-primary" />
            Vendedores rankeados por volume ponderado
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest">
            Amostra de Elite: Top 8
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
