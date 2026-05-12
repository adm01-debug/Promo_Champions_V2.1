import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TableUpdate } from "@/lib/supabase/typed-payloads";

export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled";

export interface Commission {
  id: string;
  sale_id: string;
  salesperson_id: string;
  rule_id: string | null;
  base_amount: number;
  percentage: number;
  commission_amount: number;
  status: CommissionStatus;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  payment_notes: string | null;
  created_at: string;
  updated_at: string;
  sales?: {
    client_name: string;
    product_name: string;
    amount: number;
  } | null;
  salespeople?: { name: string } | null;
}

export const useMyCommissions = () => {
  return useQuery({
    queryKey: ["commissions", "mine"],
    queryFn: async () => {
      // Get current salesperson ID first
      const { data: salesperson } = await supabase
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (!salesperson) return [];

      const { data, error } = await supabase
        .from("commissions")
        .select("*, sales(client_name, product_name, amount), salespeople(name)")
        .eq('salesperson_id', salesperson.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as Commission[];
    },
  });
};

export const useAllCommissions = (statusFilter?: CommissionStatus) => {
  return useQuery({
    queryKey: ["commissions", "all", statusFilter ?? "any"],
    queryFn: async () => {
      let query = supabase
        .from("commissions")
        .select("*, sales(client_name, product_name, amount), salespeople(name)")
        .order("created_at", { ascending: false });
      if (statusFilter) query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Commission[];
    },
  });
};

export const useUpdateCommissionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      payment_notes,
    }: {
      id: string;
      status: CommissionStatus;
      payment_notes?: string;
    }) => {
      const updates: TableUpdate<"commissions"> = { status };
      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
        const user = (await supabase.auth.getUser()).data.user;
        if (user) updates.approved_by = user.id;
      }
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
        const user = (await supabase.auth.getUser()).data.user;
        if (user) updates.paid_by = user.id;
        if (payment_notes) updates.payment_notes = payment_notes;
      }
      const { error } = await supabase.from("commissions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success(
        vars.status === "approved"
          ? "Comissão aprovada"
          : vars.status === "paid"
          ? "Comissão paga"
          : vars.status === "cancelled"
          ? "Comissão cancelada"
          : "Status atualizado",
      );
    },
    onError: () => toast.error("Erro ao atualizar comissão"),
  });
};
