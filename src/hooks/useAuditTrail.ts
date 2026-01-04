import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

interface AuditFilters {
  userId?: string;
  tableName?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  recordId?: string;
}

export const useAuditTrail = (filters?: AuditFilters) => {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-trail', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.tableName) {
        query = query.eq('table_name', filters.tableName);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.recordId) {
        query = query.eq('record_id', filters.recordId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as AuditLog[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecordHistory = (recordId: string, tableName: string) => {
  return useQuery<AuditLog[]>({
    queryKey: ['record-history', recordId, tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .eq('record_id', recordId)
        .eq('table_name', tableName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as AuditLog[];
    },
  });
};
