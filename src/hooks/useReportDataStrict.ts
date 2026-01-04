import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportFilter {
  userId?: string;
  teamId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'won' | 'lost' | 'open';
}

export interface SalesReport {
  period: string;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  revenue: number;
  avgDealSize: number;
  winRate: number;
  conversionRate: number;
}

export const useReportData = (filters: ReportFilter) => {
  return useQuery<SalesReport, Error>({
    queryKey: ['reportData', filters],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*');
      
      if (filters.userId) {
        query = query.eq('owner_id', filters.userId);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const won = data?.filter(d => d.status === 'won') || [];
      const lost = data?.filter(d => d.status === 'lost') || [];
      const revenue = won.reduce((sum, d) => sum + (d.value || 0), 0);
      const total = data?.length || 0;
      
      return {
        period: `${filters.startDate?.toLocaleDateString()} - ${filters.endDate?.toLocaleDateString()}`,
        totalDeals: total,
        wonDeals: won.length,
        lostDeals: lost.length,
        revenue,
        avgDealSize: won.length > 0 ? revenue / won.length : 0,
        winRate: total > 0 ? (won.length / total) * 100 : 0,
        conversionRate: total > 0 ? (won.length / total) * 100 : 0,
      };
    },
  });
};

export const useExportReport = () => {
  const exportToPDF = (data: SalesReport) => {
    // Implementation using pdfGenerator
    console.log('Exporting report:', data);
  };
  
  const exportToCSV = (data: SalesReport) => {
    const csv = Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
  };
  
  return { exportToPDF, exportToCSV };
};
