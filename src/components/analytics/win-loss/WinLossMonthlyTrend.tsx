import { FC, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Row {
  month: string;
  wins: number;
  losses: number;
}

const WinLossMonthlyTrendBase: FC<{ data: Row[] }> = ({ data }) => (
  <Card className="glass border-border/40">
    <CardHeader className="pb-2">
      <CardTitle className="text-section-title text-sm font-medium flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Histórico de Conversão
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="wins" name="Vitórias" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="losses" name="Perdas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const WinLossMonthlyTrend = memo(WinLossMonthlyTrendBase);
