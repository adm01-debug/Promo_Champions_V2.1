import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ForecastData {
  month: string;
  actual: number;
  forecast: number;
  upperBound: number;
  lowerBound: number;
}

const mockData: ForecastData[] = [
  { month: 'Jan', actual: 45000, forecast: 45000, upperBound: 50000, lowerBound: 40000 },
  { month: 'Fev', actual: 52000, forecast: 52000, upperBound: 57000, lowerBound: 47000 },
  { month: 'Mar', actual: 48000, forecast: 48000, upperBound: 53000, lowerBound: 43000 },
  { month: 'Abr', actual: 61000, forecast: 61000, upperBound: 66000, lowerBound: 56000 },
  { month: 'Mai', actual: 0, forecast: 65000, upperBound: 72000, lowerBound: 58000 },
  { month: 'Jun', actual: 0, forecast: 70000, upperBound: 78000, lowerBound: 62000 },
  { month: 'Jul', actual: 0, forecast: 75000, upperBound: 84000, lowerBound: 66000 },
];

export const SalesForecastChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Previsão de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)
              }
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#confidenceArea)"
              name="Intervalo de Confiança"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="url(#confidenceArea)"
            />
            
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Real"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Previsão"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              R$ {(61000).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">Último Mês Real</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">
              R$ {(70000).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">Previsão Próx. Mês</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-lg font-bold text-purple-600">+14.8%</p>
            <p className="text-xs text-muted-foreground">Crescimento Previsto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
