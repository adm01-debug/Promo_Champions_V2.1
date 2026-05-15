import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  entity_type?: string;
  actor_email?: string;
  from?: string;
  to?: string;
}

export function useAuditLogs(filters: AuditFilters = {}, limit = 200) {
  return useQuery({
    queryKey: ["audit-logs", filters, limit],
    queryFn: async () => {
      let q = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (filters.action) q = q.eq("action", filters.action);
      if (filters.entity_type) q = q.eq("entity_type", filters.entity_type);
      if (filters.actor_email) q = q.ilike("actor_email", `%${filters.actor_email}%`);
      if (filters.from) q = q.gte("created_at", filters.from);
      if (filters.to) q = q.lte("created_at", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

export function useLogAuditEvent() {
  return useMutation({
    mutationFn: async (params: {
      action: string;
      entity_type: string;
      entity_id?: string;
      changes?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.rpc("log_audit_event", {
        _action: params.action,
        _entity_type: params.entity_type,
        _entity_id: params.entity_id,
        _changes: (params.changes ?? {}) as any,
        _metadata: (params.metadata ?? {}) as any,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function exportAuditLogsToCSV(logs: AuditLog[]): void {
  const headers = ["ID", "Data", "Ator", "Email", "Ação", "Entidade", "ID Entidade", "Mudanças", "IP"];
  const rows = logs.map(l => [
    l.id,
    new Date(l.created_at).toLocaleString("pt-BR"),
    l.actor_id ?? "",
    l.actor_email ?? "",
    l.action,
    l.entity_type,
    l.entity_id ?? "",
    JSON.stringify(l.changes).replace(/"/g, '""'),
    l.ip_address ?? "",
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${logs.length} registros exportados`);
}
