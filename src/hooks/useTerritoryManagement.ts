import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface TerritoryMetrics {
  region: string;
  salespeople: number;
  clients: number;
  revenue: number;
  deals: number;
  avgDealSize: number;
  winRate: number;
  coverage: number;
}

export interface TerritoryManagementResult {
  territories: TerritoryMetrics[];
  totalRevenue: number;
  totalClients: number;
  topTerritory: TerritoryMetrics | null;
  underperformingTerritories: TerritoryMetrics[];
}

export function useTerritoryManagement() {
  return useQuery({
    queryKey: ['territory-management'],
    queryFn: async (): Promise<TerritoryManagementResult> => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Buscar clientes (usando company como proxy de região/território)
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, company, total_value');

      if (clientsError) throw clientsError;

      // Buscar vendas do mês
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, amount, status, client_name, salesperson_id, category')
        .gte('created_at', thisMonth.toISOString());

      if (salesError) throw salesError;

      // Buscar salespeople
      const { data: salespeople, error: spError } = await supabase
        .from('salespeople')
        .select('id, name');

      if (spError) throw spError;

      // Agrupar por categoria de produto como "território"
      const regionData: Record<string, {
        salespeople: Set<string>;
        clients: Set<string>;
        revenue: number;
        won: number;
        lost: number;
        deals: number;
      }> = {};

      // Associar vendas às regiões (usando category como território)
      sales?.forEach(sale => {
        const region = sale.category || 'Geral';
        
        if (!regionData[region]) {
          regionData[region] = {
            salespeople: new Set(),
            clients: new Set(),
            revenue: 0,
            won: 0,
            lost: 0,
            deals: 0,
          };
        }

        regionData[region].deals++;
        regionData[region].clients.add(sale.client_name);
        
        if (sale.salesperson_id) {
          regionData[region].salespeople.add(sale.salesperson_id);
        }
        
        if (sale.status === 'completed') {
          regionData[region].revenue += sale.amount;
          regionData[region].won++;
        } else if (sale.status === 'cancelled') {
          regionData[region].lost++;
        }
      });

      // Processar métricas por território
      const territories: TerritoryMetrics[] = Object.entries(regionData).map(([region, data]) => {
        const totalClosed = data.won + data.lost;
        return {
          region,
          salespeople: data.salespeople.size,
          clients: data.clients.size,
          revenue: data.revenue,
          deals: data.deals,
          avgDealSize: data.won > 0 ? data.revenue / data.won : 0,
          winRate: totalClosed > 0 ? (data.won / totalClosed) * 100 : 0,
          coverage: data.clients.size > 0 ? (data.deals / data.clients.size) * 100 : 0,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      const totalRevenue = territories.reduce((sum, t) => sum + t.revenue, 0);
      const totalClients = territories.reduce((sum, t) => sum + t.clients, 0);
      const topTerritory = territories[0] || null;
      
      // Territórios com performance abaixo da média
      const avgRevenue = totalRevenue / (territories.length || 1);
      const underperformingTerritories = territories.filter(t => t.revenue < avgRevenue * 0.5);

      return {
        territories,
        totalRevenue,
        totalClients,
        topTerritory,
        underperformingTerritories,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
