import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SourceBarChartProps {
  data: Array<{ source: string; value: number }>;
  formatCurrency: (value: number | string) => string;
}

const SourceBarChart = ({ data, formatCurrency }: SourceBarChartProps) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
      <XAxis
        type="number"
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
      />
      <YAxis
        type="category"
        dataKey="source"
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        width={80}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
        }}
        formatter={(value: number | string) => [formatCurrency(value), 'Valor']}
      />
      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default SourceBarChart;
