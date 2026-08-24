import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ABTest {
  id: string;
  name: string;
  description: string | null;
  variant_a_id: string;
  variant_b_id: string;
  traffic_split: number;
  status: "draft" | "running" | "paused" | "completed";
  hypothesis: string | null;
  winner_variant: "a" | "b" | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface ABTestResult {
  variant: "a" | "b";
  cadence_name: string;
  enrolled: number;
  completed: number;
  replied: number;
  converted: number;
  reply_rate: number;
  conversion_rate: number;
}

export function useABTests() {
  return useQuery({
    queryKey: ["cadence-ab-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadence_ab_tests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ABTest[];
    },
  });
}

export function useABTestResults(testId?: string) {
  return useQuery({
    queryKey: ["cadence-ab-test-results", testId],
    queryFn: async () => {
      if (!testId) return [];
      const { data, error } = await supabase.rpc("get_ab_test_results", { _ab_test_id: testId });
      if (error) throw error;
      return (data as ABTestResult[]) ?? [];
    },
    enabled: !!testId,
    staleTime: 30_000,
  });
}

export function useCreateABTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      variant_a_id: string;
      variant_b_id: string;
      traffic_split?: number;
      hypothesis?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("cadence_ab_tests")
        .insert({ ...input, traffic_split: input.traffic_split ?? 50 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-ab-tests"] });
      toast.success("Teste A/B criado!");
    },
    onError: () => toast.error("Erro ao criar teste A/B (verifique permissão admin/manager)"),
  });
}

export function useUpdateABTestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ABTest["status"] }) => {
      const updates: Partial<ABTest> = { status };
      if (status === "running") updates.started_at = new Date().toISOString();
      if (status === "completed") updates.ended_at = new Date().toISOString();
      const { error } = await supabase.from("cadence_ab_tests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-ab-tests"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });
}

export function useDeclareWinner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, winner }: { id: string; winner: "a" | "b" }) => {
      const { error } = await supabase
        .from("cadence_ab_tests")
        .update({ winner_variant: winner, status: "completed", ended_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadence-ab-tests"] });
      toast.success("Vencedor declarado! 🏆");
    },
    onError: () => toast.error("Erro ao declarar vencedor"),
  });
}
