import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(210, 70%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(280, 60%, 55%)',
];

export const ProductMix: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['product-mix'],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('product_name, amount, category')
        .eq('status', 'completed');

      if (error) throw error;

      // Group by category
      const categoryMap = new Map<string, { count: number; revenue: number }>();
      (sales || []).forEach(s => {
        const cat = s.category || 'Outros';
        const existing = categoryMap.get(cat) || { count: 0, revenue: 0 };
        categoryMap.set(cat, {
          count: existing.count + 1,
          revenue: existing.revenue + (s.amount || 0),
        });
      });

      const totalRevenue = Array.from(categoryMap.values()).reduce((s, v) => s + v.revenue, 0);

      return Array.from(categoryMap.entries())
        .map(([name, { count, revenue }]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: count,
          revenue,
          percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Mix de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!data || data.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda concluída</p>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} vendas (${props.payload.percentage}%)`,
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
