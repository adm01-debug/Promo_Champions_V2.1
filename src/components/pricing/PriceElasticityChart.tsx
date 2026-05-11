import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface ElasticityPoint {
  price: number;
  win_rate: number;
  volume: number;
  category?: string;
}

interface Props {
  data?: ElasticityPoint[];
  optimalPrice?: number;
}

const generateMockData = (): ElasticityPoint[] => {
  const data: ElasticityPoint[] = [];
  for (let i = 0; i < 25; i++) {
    const price = 1000 + i * 200;
    // Simulated elasticity curve: win_rate decreases as price increases, with peak around 2200
    const idealOffset = Math.abs(price - 2200);
    const win_rate = Math.max(10, 80 - (idealOffset / 100) * 2 + (Math.random() - 0.5) * 15);
    data.push({
      price,
      win_rate: Math.round(win_rate),
      volume: Math.round(20 + Math.random() * 80),
    });
  }
  return data;
};

export function PriceElasticityChart({ data, optimalPrice = 2200 }: Props) {
  const chartData = useMemo(() => data ?? generateMockData(), [data]);

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-background to-transparent pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-display">Curva de Elasticidade de Preço</CardTitle>
            </div>
            <CardDescription>
              Correlação entre preço praticado e probabilidade de fechamento.
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 bg-success/5 text-success border-success/30">
            <TrendingUp className="h-3 w-3" />
            Preço Ótimo: R$ {optimalPrice.toLocaleString("pt-BR")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              dataKey="price" 
              name="Preço" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis 
              type="number" 
              dataKey="win_rate" 
              name="Win Rate" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              unit="%"
            />
            <ZAxis type="number" dataKey="volume" range={[60, 400]} name="Volume" />
            <RTooltip 
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: any, name: any) => {
                if (name === "Preço") return `R$ ${Number(value).toLocaleString("pt-BR")}`;
                if (name === "Win Rate") return `${value}%`;
                return `${value} deals`;
              }}
            />
            <ReferenceLine 
              x={optimalPrice} 
              stroke="hsl(var(--success))" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ value: "Ponto Ótimo", position: "top", fill: "hsl(var(--success))", fontSize: 11, fontWeight: "bold" }}
            />
            <Scatter 
              data={chartData} 
              fill="hsl(var(--primary))" 
              fillOpacity={0.6}
              stroke="hsl(var(--primary))"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
