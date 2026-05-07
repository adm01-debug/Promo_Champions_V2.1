import React, { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface GoalDistributionChartProps {
  salespeople: {
    id: string;
    name: string;
    progress: number;
    goalAmount: number;
  }[];
}

const STATUS_COLORS = {
  exceeded: "hsl(var(--success))",
  onTrack: "hsl(var(--primary))",
  atRisk: "hsl(var(--warning))",
  behind: "hsl(var(--destructive))",
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-xl font-bold font-display">
        {value}
      </text>
      <text x={cx} y={cy} dy={16} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-[10px] uppercase font-bold tracking-wider">
        Vendedores
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

export const GoalDistributionChart: FC<GoalDistributionChartProps> = ({ salespeople }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const withGoals = salespeople.filter(sp => sp.goalAmount > 0);

  const exceeded = withGoals.filter(sp => sp.progress >= 100).length;
  const onTrack = withGoals.filter(sp => sp.progress >= 70 && sp.progress < 100).length;
  const atRisk = withGoals.filter(sp => sp.progress >= 40 && sp.progress < 70).length;
  const behind = withGoals.filter(sp => sp.progress < 40).length;

  const data = [
    { name: "Batida", value: exceeded, color: STATUS_COLORS.exceeded },
    { name: "No Ritmo", value: onTrack, color: STATUS_COLORS.onTrack },
    { name: "Risco", value: atRisk, color: STATUS_COLORS.atRisk },
    { name: "Atrasado", value: behind, color: STATUS_COLORS.behind },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Sem metas definidas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 card-elevated">
      <CardHeader className="pb-2 border-b border-border/10">
        <CardTitle className="text-sm font-display font-black uppercase tracking-widest flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          Status da Operação
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, i) => (
                  <Cell 
                    key={i} 
                    fill={entry.color} 
                    className="transition-all duration-300 outline-none" 
                    style={{ filter: activeIndex === i ? `drop-shadow(0 0 8px ${entry.color})` : 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-3 rounded-xl border border-border/40 shadow-xl animate-in fade-in zoom-in duration-200">
                        <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: payload[0].payload.color }}>
                          {payload[0].name}
                        </p>
                        <p className="text-sm font-bold">
                          {payload[0].value} Vendedores
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 italic">
                          {((Number(payload[0].value) / withGoals.length) * 100).toFixed(0)}% da base
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((entry, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border transition-all text-left",
                activeIndex === i 
                  ? "bg-muted/50 border-border/40 shadow-sm translate-x-1" 
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] font-bold uppercase tracking-tight">{entry.name}</span>
              </div>
              <span className="text-xs font-black">{entry.value}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
