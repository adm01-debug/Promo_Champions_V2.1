import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditEntry {
  id: string;
  action: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

export function useAuditLog(tableName: string, recordId: string) {
  return useQuery({
    queryKey: ['audit', tableName, recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!recordId,
  });
}
