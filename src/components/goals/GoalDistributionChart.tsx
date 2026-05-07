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
  const [activeIndex, setActiveIndex] = React.useState(0);
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
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          Distribuição de Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, name: string) => [`${v} vendedores`, name]}
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
