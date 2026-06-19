import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ABC_COLORS: Record<string, string> = {
  A: 'hsl(var(--success))',
  B: 'hsl(var(--warning))',
  C: 'hsl(var(--destructive))',
};

interface AbcPieChartProps {
  data: Array<{ classification: string; revenue: number; count: number }>;
  formatCurrency: (value: number | string) => string;
}

const AbcPieChart = ({ data, formatCurrency }: AbcPieChartProps) => (
  <ResponsiveContainer width="100%" height={160}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={35}
        outerRadius={60}
        paddingAngle={3}
        dataKey="revenue"
      >
        {data.map(entry => (
          <Cell key={entry.classification} fill={ABC_COLORS[entry.classification]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number | string) => [formatCurrency(value)]}
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default AbcPieChart;
export { ABC_COLORS };
