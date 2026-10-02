import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from 'recharts';
import { fmtCurrency } from './pricing-ui';
import type { DiscountBucket } from '@/hooks/usePricingIntelligence';

interface PricingDistributionCardProps {
  distribution: Array<DiscountBucket & { revenueShort: number }>;
}

export function PricingDistributionCard({ distribution }: PricingDistributionCardProps) {
  return (
    <Card className="glass border-white/5 overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-section-title font-sora">
              Distribuição de Descontos
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Histograma de agressividade comercial
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            IA Validated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-80 pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="white"
              strokeOpacity={0.05}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <RTooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              }}
              formatter={(v: number | string, name: string) =>
                name === 'revenue' ? fmtCurrency(Number(v)) : [`${v} deals`, 'Volume']
              }
            />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
