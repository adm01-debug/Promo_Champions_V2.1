// Melhoria 83 - useAuditLog Hook
export const useAuditLog = (filters?: { table?: string; user?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['audit-log', filters],
    queryFn: async () => {
      let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false });
      if (filters?.table) query = query.eq('table_name', filters.table);
      if (filters?.user) query = query.eq('user_id', filters.user);
      if (filters?.limit) query = query.limit(filters.limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
