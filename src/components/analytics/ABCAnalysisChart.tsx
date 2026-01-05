import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
};

export const ABCAnalysisChart = () => {
  const { clients, stats, isLoading } = useABCAnalysis();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const chartData = [
    { category: 'A', count: stats?.category_a_count || 0, value: stats?.category_a_revenue || 0 },
    { category: 'B', count: stats?.category_b_count || 0, value: stats?.category_b_revenue || 0 },
    { category: 'C', count: stats?.category_c_count || 0, value: stats?.category_c_revenue || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Análise ABC de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats?.category_a_count || 0}</p>
            <p className="text-sm text-muted-foreground">Categoria A</p>
            <p className="text-xs text-green-600">80% da receita</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.category_b_count || 0}</p>
            <p className="text-sm text-muted-foreground">Categoria B</p>
            <p className="text-xs text-blue-600">15% da receita</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats?.category_c_count || 0}</p>
            <p className="text-sm text-muted-foreground">Categoria C</p>
            <p className="text-xs text-orange-600">5% da receita</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)
              }
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={COLORS[entry.category as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-right p-3">Receita</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 10).map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: COLORS[client.category] + '20',
                        color: COLORS[client.category],
                      }}
                    >
                      {client.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(client.total_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
