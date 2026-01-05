import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

interface AuditFilters {
  user_id?: string;
  table_name?: string;
  action?: string;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  per_page?: number;
}

export const useAuditTrail = (filters: AuditFilters = {}) => {
  const {
    user_id,
    table_name,
    action,
    start_date,
    end_date,
    page = 1,
    per_page = 50,
  } = filters;

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-trail', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user:user_id (
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (table_name) {
        query = query.eq('table_name', table_name);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (start_date) {
        query = query.gte('created_at', start_date.toISOString());
      }

      if (end_date) {
        query = query.lte('created_at', end_date.toISOString());
      }

      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const entries: AuditLogEntry[] = data.map((entry) => ({
        ...entry,
        user_email: entry.user?.email || 'Unknown',
        created_at: new Date(entry.created_at),
      }));

      return {
        entries,
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
      };
    },
  });

  return {
    entries: data?.entries || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.total_pages || 1,
    isLoading,
    error,
  };
};

export const useRecordHistory = (table_name: string, record_id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['record-history', table_name, record_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          user:user_id (
            email,
            full_name
          )
        `)
        .eq('table_name', table_name)
        .eq('record_id', record_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((entry) => ({
        ...entry,
        user_name: entry.user?.full_name || entry.user?.email || 'Unknown',
        created_at: new Date(entry.created_at),
      }));
    },
  });

  return {
    history: data || [],
    isLoading,
  };
};

export const useSecurityEvents = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data.map((event) => ({
        ...event,
        created_at: new Date(event.created_at),
      }));
    },
  });

  return {
    events: data || [],
    isLoading,
  };
};
