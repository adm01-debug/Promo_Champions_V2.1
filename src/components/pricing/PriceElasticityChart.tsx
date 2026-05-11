import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export const PriceElasticityChart = memo(function PriceElasticityChart({ data, optimalPrice = 2200 }: Props) {
  const chartData = useMemo(() => data ?? generateMockData(), [data]);

  return (
    <Card className="glass border-white/5 overflow-hidden shadow-2xl bg-slate-950/40 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.1),transparent)] pointer-events-none" />
      
      <CardHeader className="bg-white/5 border-b border-white/5 backdrop-blur-md pb-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-black font-sora tracking-tight">Price Elasticity Curve</CardTitle>
                <Badge variant="outline" className="text-[8px] font-black uppercase py-0 border-primary/30 text-primary">Live Model</Badge>
              </div>
              <CardDescription className="text-xs font-medium">
                Correlação neural entre preço praticado e probabilidade de conversão (Win-Rate).
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price Shield Proteção</span>
              <Badge className="gap-2 bg-success text-white border-none shadow-[0_0_20px_rgba(34,197,94,0.4)] font-black text-xs px-4 py-1.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 fill-current" />
                PREÇO ÓTIMO: {optimalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Badge>
            </div>
          </div>
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ElasticityPoint;
                  const isNearOptimal = Math.abs(data.price - optimalPrice) / optimalPrice < 0.1;
                  
                  return (
                    <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs max-w-[200px]">
                      <div className="font-bold mb-1 flex items-center justify-between">
                        <span>R$ {data.price.toLocaleString("pt-BR")}</span>
                        {isNearOptimal && <Badge className="bg-success/20 text-success border-none h-4 px-1 text-[10px]">Ideal</Badge>}
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Win Rate:</span>
                          <span className="font-mono text-foreground">{data.win_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="font-mono text-foreground">{data.volume} deals</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border italic text-[10px] text-primary/80">
                        {data.win_rate > 70 
                          ? "Alta conversão. Considere testar preços ligeiramente superiores." 
                          : data.win_rate < 30 
                            ? "Baixa conversão. Preço pode estar acima do valor percebido."
                            : "Equilíbrio saudável entre volume e preço."}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              x={optimalPrice * 0.9} 
              stroke="hsl(var(--success))" 
              strokeDasharray="3 3" 
              label={{ position: 'top', value: 'Piso Seguro', fill: 'hsl(var(--success))', fontSize: 10 }}
            />
            <ReferenceLine 
              x={optimalPrice * 1.1} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="3 3" 
              label={{ position: 'top', value: 'Teto Alerta', fill: 'hsl(var(--warning))', fontSize: 10 }}
            />
            <ReferenceLine 
              x={optimalPrice} 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              label={{ position: 'insideBottomRight', value: 'PREÇO ÓTIMO IA', fill: 'hsl(var(--primary))', fontSize: 10, fontWeight: 'bold' }}
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
});
