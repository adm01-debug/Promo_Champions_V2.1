import React, { FC, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvolutionCurves } from '@/hooks/useEvolutionCurves';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COLORS = [
  'hsl(262, 83%, 58%)',  // primary
  'hsl(172, 66%, 45%)',  // secondary
  'hsl(185, 90%, 48%)',  // accent
  'hsl(30, 90%, 55%)',   // orange
  'hsl(340, 75%, 55%)',  // pink
  'hsl(210, 70%, 55%)',  // blue
];

const periodOptions = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

const EvolutionChartComponent: FC = () => {
  const [period, setPeriod] = useState(30);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { chartData, salespeople, isLoading } = useEvolutionCurves(period, selectedIds);

  const togglePerson = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const displayPeople = selectedIds.length > 0
    ? salespeople.filter(sp => selectedIds.includes(sp.id))
    : salespeople;

  if (isLoading) {
    return <div className="h-80 rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Evolução Comparativa
          </CardTitle>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
            {periodOptions.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md font-medium transition-all',
                  period === p.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* People selector */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {salespeople.map((sp, _i) => (
            <button
              key={sp.id}
              onClick={() => togglePerson(sp.id)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all border',
                selectedIds.length === 0 || selectedIds.includes(sp.id)
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/40 text-muted-foreground hover:border-primary/20'
              )}
            >
              {sp.name.split(' ')[0]}
            </button>
          ))}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border/40"
            >
              Todos
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any) =>
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
              }
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString('pt-BR');
              }}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            {displayPeople.map((sp, i) => (
              <Line
                key={sp.id}
                type="monotone"
                dataKey={sp.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export const EvolutionChart = React.memo(EvolutionChartComponent);
