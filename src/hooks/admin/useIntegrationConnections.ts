import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { insertPayload, updatePayload, type TableInsert, type TableUpdate } from "@/lib/supabase/typed-payloads";

export type IntegrationKind = "database" | "bitrix24" | "n8n" | "mcp" | "webhook" | "other";
export type IntegrationSource = "db" | "env" | "secret";

export interface IntegrationConnection {
  id: string;
  kind: IntegrationKind;
  label: string;
  config: Record<string, unknown>;
  secret_refs: string[];
  source: IntegrationSource;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useIntegrationConnections(kind?: IntegrationKind) {
  return useQuery({
    queryKey: ["integration-connections", kind ?? "all"],
    queryFn: async () => {
      let q = supabase.from("integration_connections").select("*").order("created_at", { ascending: false });
      if (kind) q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as IntegrationConnection[];
    },
  });
}

export function useCreateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      kind: IntegrationKind;
      label: string;
      config?: Record<string, unknown>;
      secret_refs?: string[];
      source?: IntegrationSource;
      enabled?: boolean;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const payload = insertPayload("integration_connections", {
        kind: input.kind,
        label: input.label,
        config: (input.config ?? {}) as TableInsert<"integration_connections">["config"],
        secret_refs: input.secret_refs ?? [],
        source: input.source ?? "db",
        enabled: input.enabled ?? true,
        created_by: auth.user?.id ?? null,
      });
      const { data, error } = await supabase.from("integration_connections").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integration-connections"] });
      toast.success("Conexão criada");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useUpdateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<IntegrationConnection, "id" | "created_at" | "updated_at" | "created_by">>) => {
      const patch = updatePayload("integration_connections", {
        label: updates.label,
        config: updates.config as TableUpdate<"integration_connections">["config"],
        secret_refs: updates.secret_refs,
        source: updates.source,
        enabled: updates.enabled,
      });
      const { error } = await supabase.from("integration_connections").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration-connections"] }),
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("integration_connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integration-connections"] });
      toast.success("Conexão removida");
    },
  });
}

export function useTestConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connection_id: string) => {
      const { data, error } = await supabase.functions.invoke("test-integration-connection", {
        body: { connection_id, triggered_by: "manual" },
      });
      if (error) throw error;
      return data as { ok: boolean; status: string; latency_ms: number; error: string | null; label: string };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["integration-health"] });
      if (data?.ok) toast.success(`${data.label}: OK (${data.latency_ms}ms)`);
      else toast.error(`${data?.label ?? "Conexão"}: ${data?.error ?? "falhou"}`);
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export interface IntegrationHealthCheck {
  id: string;
  connection_id: string;
  status: string;
  latency_ms: number | null;
  error: string | null;
  checked_at: string;
  triggered_by: string | null;
}

export function useIntegrationHealth(
  connectionId?: string,
  limit = 100,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ["integration-health", connectionId ?? "all", limit],
    queryFn: async () => {
      let q = supabase
        .from("integration_health_checks")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(limit);
      if (connectionId) q = q.eq("connection_id", connectionId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as IntegrationHealthCheck[];
    },
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
  });
}
