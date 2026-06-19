import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface LtvChartPoint {
  date: string;
  amount: number;
  cumulativeLtv: number;
}

interface LtvChartProps {
  data: LtvChartPoint[];
  className?: string;
}

export function LtvChart({ data, className }: LtvChartProps) {
  return (
    <Card
      className={
        className ??
        'lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden'
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução Financeira (LTV)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `R$${v}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeLtv"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorLtv)"
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={0.1}
                fill="#10b981"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              LTV Acumulado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Valor do Pedido
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
