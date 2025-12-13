import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Target } from "lucide-react";
import { SalespersonActivityData } from "@/hooks/useSalespersonActivityReport";

interface ActivityOutcomesChartProps {
  data: SalespersonActivityData[];
}

const OUTCOME_COLORS = {
  connected: { color: "hsl(142, 76%, 36%)", label: "Conectou" },
  scheduled: { color: "hsl(217, 91%, 60%)", label: "Agendou" },
  qualified: { color: "hsl(280, 87%, 63%)", label: "Qualificou" },
  no_answer: { color: "hsl(45, 93%, 47%)", label: "Sem Resposta" },
  not_interested: { color: "hsl(0, 84%, 60%)", label: "Sem Interesse" },
};

export function ActivityOutcomesChart({ data }: ActivityOutcomesChartProps) {
  const totals = data.reduce(
    (acc, sp) => ({
      connected: acc.connected + sp.connected,
      scheduled: acc.scheduled + sp.scheduled,
      qualified: acc.qualified + sp.qualified,
      no_answer: acc.no_answer + sp.no_answer,
      not_interested: acc.not_interested + sp.not_interested,
    }),
    { connected: 0, scheduled: 0, qualified: 0, no_answer: 0, not_interested: 0 }
  );

  const chartData = Object.entries(totals)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: OUTCOME_COLORS[key as keyof typeof OUTCOME_COLORS]?.label || key,
      value,
      color: OUTCOME_COLORS[key as keyof typeof OUTCOME_COLORS]?.color || "hsl(var(--muted))",
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Distribuição de Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Nenhum resultado registrado
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Quantidade"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "10px" }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
