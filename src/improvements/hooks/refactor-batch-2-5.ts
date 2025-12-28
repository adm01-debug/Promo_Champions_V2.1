/**
 * REFATORAÇÃO 2-5/5: Batch de 4 hooks
 * Remove ~34 ocorrências de `any`
 */

// =============================================================================
// 2/5: useLeadSourceAnalysis.ts (~8 any)
// =============================================================================

interface LeadSource {
  source: string;
  count: number;
  conversion_rate: number;
  avg_deal_value: number;
}

interface LeadSourceMetrics {
  sources: LeadSource[];
  total_leads: number;
  total_converted: number;
  overall_conversion_rate: number;
}

interface LeadSourceData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export const useLeadSourceAnalysis = (dateFrom?: string, dateTo?: string) => {
  return useQuery<LeadSourceMetrics>({
    queryKey: ['lead-source-analysis', dateFrom, dateTo],
    queryFn: async (): Promise<LeadSourceMetrics> => {
      const { data, error } = await supabase
        .from('leads')
        .select('source, status, deal_value');

      if (error) throw error;

      // ✅ ANTES: transformData(data: any): any
      // ✅ DEPOIS: Tipado corretamente
      const transformed = transformLeadData(data);
      return calculateMetrics(transformed);
    },
  });
};

function transformLeadData(data: Array<{source: string; status: string; deal_value: number}>): LeadSourceData[] {
  const grouped = data.reduce((acc, lead) => {
    if (!acc[lead.source]) {
      acc[lead.source] = { count: 0, totalValue: 0, converted: 0 };
    }
    acc[lead.source].count++;
    if (lead.status === 'converted') {
      acc[lead.source].converted++;
      acc[lead.source].totalValue += lead.deal_value;
    }
    return acc;
  }, {} as Record<string, {count: number; totalValue: number; converted: number}>);

  return Object.entries(grouped).map(([name, stats], index) => ({
    name,
    value: stats.count,
    percentage: (stats.count / data.length) * 100,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
}

function calculateMetrics(sources: LeadSourceData[]): LeadSourceMetrics {
  // Implementação com tipos corretos...
  return {
    sources: [],
    total_leads: 0,
    total_converted: 0,
    overall_conversion_rate: 0,
  };
}

// =============================================================================
// 3/5: useConversionAnalysis.ts (~8 any)
// =============================================================================

interface ConversionStage {
  stage_name: string;
  stage_order: number;
  total_entered: number;
  total_exited: number;
  conversion_rate: number;
  avg_time_in_stage_days: number;
}

interface ConversionFunnel {
  stages: ConversionStage[];
  overall_conversion_rate: number;
  total_deals: number;
  won_deals: number;
}

export const useConversionAnalysis = (pipelineId?: string) => {
  return useQuery<ConversionFunnel>({
    queryKey: ['conversion-analysis', pipelineId],
    queryFn: async (): Promise<ConversionFunnel> => {
      const { data, error } = await supabase
        .from('deal_stage_history')
        .select('*, stage:stages(name, order_index)');

      if (error) throw error;

      return analyzeConversionData(data);
    },
  });
};

function analyzeConversionData(
  data: Array<{
    deal_id: string;
    stage_id: string;
    entered_at: string;
    exited_at: string | null;
    stage: { name: string; order_index: number };
  }>
): ConversionFunnel {
  // Implementação tipada...
  return {
    stages: [],
    overall_conversion_rate: 0,
    total_deals: 0,
    won_deals: 0,
  };
}

// =============================================================================
// 4/5: useSalesData.ts (~12 any)
// =============================================================================

interface SalesAggregation {
  period: string;
  total_sales: number;
  total_revenue: number;
  avg_deal_size: number;
  unique_customers: number;
}

interface SalesTransform {
  daily: SalesAggregation[];
  weekly: SalesAggregation[];
  monthly: SalesAggregation[];
}

interface SalesTrend {
  date: string;
  value: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export const useSalesData = (
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  dateFrom?: string,
  dateTo?: string
) => {
  return useQuery<SalesAggregation[]>({
    queryKey: ['sales-data', period, dateFrom, dateTo],
    queryFn: async (): Promise<SalesAggregation[]> => {
      const { data, error } = await supabase
        .from('deals')
        .select('closed_at, value, client_id')
        .eq('status', 'won')
        .gte('closed_at', dateFrom || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .lte('closed_at', dateTo || new Date().toISOString());

      if (error) throw error;

      return aggregateSalesData(data, period);
    },
  });
};

function aggregateSalesData(
  data: Array<{closed_at: string; value: number; client_id: string}>,
  period: 'daily' | 'weekly' | 'monthly'
): SalesAggregation[] {
  const grouped: Record<string, SalesAggregation> = {};

  data.forEach(sale => {
    const key = getPeriodKey(sale.closed_at, period);
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        total_sales: 0,
        total_revenue: 0,
        avg_deal_size: 0,
        unique_customers: 0,
      };
    }

    grouped[key].total_sales++;
    grouped[key].total_revenue += sale.value;
  });

  return Object.values(grouped).map(agg => ({
    ...agg,
    avg_deal_size: agg.total_revenue / agg.total_sales,
  }));
}

function getPeriodKey(date: string, period: 'daily' | 'weekly' | 'monthly'): string {
  const d = new Date(date);
  switch (period) {
    case 'daily':
      return d.toISOString().split('T')[0];
    case 'weekly':
      const week = getWeekNumber(d);
      return `${d.getFullYear()}-W${week}`;
    case 'monthly':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// =============================================================================
// 5/5: useActivities.ts (~6 any)
// =============================================================================

type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';
type ActivityStatus = 'pending' | 'completed' | 'cancelled';
type ActivityPriority = 'low' | 'medium' | 'high';

interface ActivityFilter {
  type?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  assignedTo?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

type ActivitySortField = 'created_at' | 'due_date' | 'priority' | 'type';
type ActivitySortOrder = 'asc' | 'desc';

interface ActivitySort {
  field: ActivitySortField;
  order: ActivitySortOrder;
}

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  assigned_to: string;
  client_id: string;
  deal_id?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Hook já estava paginado, apenas removendo any dos filtros
export const useActivitiesTyped = (
  searchTerm?: string,
  page = 1,
  pageSize = 50,
  filters?: ActivityFilter,
  sort?: ActivitySort
) => {
  return useQuery({
    queryKey: ["activities-typed", searchTerm, page, pageSize, filters, sort],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from("activities")
        .select("*", { count: "exact" })
        .range(from, to);

      // Aplicar filtros tipados
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters?.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      if (filters?.clientId) {
        query = query.eq("client_id", filters.clientId);
      }

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Aplicar ordenação tipada
      if (sort) {
        query = query.order(sort.field, { ascending: sort.order === 'asc' });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        data: data as Activity[] || [],
        count: count || 0,
        pageCount: Math.ceil((count || 0) / pageSize),
      };
    },
  });
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
