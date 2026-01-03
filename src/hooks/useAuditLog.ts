import { useQuery } from '@tanstack/react-query';

interface AuditEntry {
  id: string;
  action: string;
  old_data: unknown;
  new_data: unknown;
  created_at: string;
}

// Stub implementation - table doesn't exist yet
export function useAuditLog(_tableName: string, recordId: string) {
  return useQuery({
    queryKey: ['audit', _tableName, recordId],
    queryFn: async (): Promise<AuditEntry[]> => {
      // Table doesn't exist yet, return empty array
      return [];
    },
    enabled: !!recordId,
  });
}
