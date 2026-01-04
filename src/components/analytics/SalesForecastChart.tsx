import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ForecastData {
  date: string;
  actual: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export function SalesForecastChart() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  async function loadForecast() {
    const { data: deals } = await supabase
      .from('deals')
      .select('created_at, value')
      .eq('status', 'won')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    if (!deals) return;

    const grouped = groupByDay(deals);
    const forecast = calculateForecast(grouped);

    setData(forecast);
    setLoading(false);
  }

  function groupByDay(deals: any[]) {
    const groups: Record<string, number> = {};
    
    deals.forEach(deal => {
      const date = deal.created_at.split('T')[0];
      groups[date] = (groups[date] || 0) + deal.value;
    });

    return Object.entries(groups).map(([date, value]) => ({ date, value }));
  }

  function calculateForecast(historical: { date: string; value: number }[]) {
    const result: ForecastData[] = [];
    const windowSize = 7;

    historical.forEach((item) => {
      result.push({
        date: item.date,
        actual: item.value,
        forecast: 0,
        lowerBound: 0,
        upperBound: 0
      });
    });

    for (let i = 0; i < 30; i++) {
      const lastValues = historical.slice(-windowSize).map(h => h.value);
      const avg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
      const std = Math.sqrt(
        lastValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / lastValues.length
      );

      const forecastDate = new Date(historical[historical.length - 1].date);
      forecastDate.setDate(forecastDate.getDate() + i + 1);

      result.push({
        date: forecastDate.toISOString().split('T')[0],
        actual: 0,
        forecast: avg,
        lowerBound: avg - 1.96 * std,
        upperBound: avg + 1.96 * std
      });
    }

    return result;
  }

  if (loading) return <div>Carregando previsão...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Previsão de Vendas - Próximos 30 Dias</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Vendas Reais" />
          <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Previsão" />
          <Line type="monotone" dataKey="upperBound" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" name="Limite Superior" dot={false} />
          <Line type="monotone" dataKey="lowerBound" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" name="Limite Inferior" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
