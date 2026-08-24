import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueAreaChartProps {
  data: Array<{ month: string; value: number }>;
  formatCurrency: (value: number | string) => string;
}

const RevenueAreaChart = ({ data, formatCurrency }: RevenueAreaChartProps) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <YAxis
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
        }}
        formatter={(value: number | string) => [formatCurrency(value), 'Receita']}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="hsl(var(--primary))"
        strokeWidth={3}
        fillOpacity={1}
        fill="url(#colorRevenue)"
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default RevenueAreaChart;
