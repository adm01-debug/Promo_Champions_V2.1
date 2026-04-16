import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ApprovalWorkflow {
  id: string;
  name: string;
  workflow_type: string;
  description: string | null;
  threshold_amount: number | null;
  threshold_percentage: number | null;
  required_approvers: number;
  auto_approve_below: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  workflow_id: string;
  requester_id: string;
  deal_id: string | null;
  deal_name: string | null;
  requested_value: number;
  original_value: number | null;
  discount_percentage: number | null;
  justification: string | null;
  status: string;
  current_level: number;
  expires_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ApprovalDecision {
  id: string;
  request_id: string;
  approver_id: string;
  decision: string;
  comments: string | null;
  level: number;
  decided_at: string;
}

export function useApprovalWorkflows() {
  return useQuery({
    queryKey: ["approval-workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_workflows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ApprovalWorkflow[];
    },
  });
}

export function useApprovalRequests(statusFilter?: string) {
  return useQuery({
    queryKey: ["approval-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("approval_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as ApprovalRequest[];
    },
  });
}

export function useApprovalDecisions(requestId: string) {
  return useQuery({
    queryKey: ["approval-decisions", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_decisions")
        .select("*")
        .eq("request_id", requestId)
        .order("decided_at", { ascending: true });
      if (error) throw error;
      return data as ApprovalDecision[];
    },
    enabled: !!requestId,
  });
}

export function useCreateApprovalRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      workflow_id: string;
      deal_id?: string;
      deal_name?: string;
      requested_value: number;
      original_value?: number;
      discount_percentage?: number;
      justification?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("approval_requests")
        .insert({
          ...params,
          requester_id: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
      toast.success("Solicitação de aprovação enviada!");
    },
    onError: () => toast.error("Erro ao criar solicitação"),
  });
}

export function useDecideApproval() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      request_id: string;
      decision: "approved" | "rejected";
      comments?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Create decision
      const { error: decisionError } = await supabase
        .from("approval_decisions")
        .insert({
          request_id: params.request_id,
          approver_id: user.id,
          decision: params.decision,
          comments: params.comments,
        });
      if (decisionError) throw decisionError;

      // Update request status
      const { error: updateError } = await supabase
        .from("approval_requests")
        .update({
          status: params.decision,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", params.request_id);
      if (updateError) throw updateError;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["approval-decisions"] });
      toast.success(vars.decision === "approved" ? "Aprovado! ✅" : "Rejeitado ❌");
    },
    onError: () => toast.error("Erro ao processar decisão"),
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: Partial<ApprovalWorkflow>) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("approval_workflows")
        .insert({ ...params, created_by: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-workflows"] });
      toast.success("Workflow criado!");
    },
    onError: () => toast.error("Erro ao criar workflow"),
  });
}
