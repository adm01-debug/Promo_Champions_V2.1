// Melhoria 2.5 - useReportData.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  labels: string[];
  datasets: ReportDataset[];
}

interface ReportDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

type ReportType = 'revenue' | 'conversion' | 'performance';

export const useReportData = (type: ReportType, userId?: string) => {
  return useQuery({
    queryKey: ['report-data', type, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc(`generate_${type}_report`, { user_id: userId });
      
      if (error) throw error;
      return data as ReportData;
    },
  });
};
