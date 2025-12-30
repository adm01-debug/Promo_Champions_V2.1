// Melhoria 83 - useAuditLog Hook
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
  user?: { email: string; name: string };
}

interface AuditFilters {
  table_name?: string;
  user_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export const useAuditLog = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['audit-log', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select('*, user:users(email, name)')
        .order('created_at', { ascending: false });

      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_audit_stats');
      if (error) throw error;
      return data;
    },
  });
};
