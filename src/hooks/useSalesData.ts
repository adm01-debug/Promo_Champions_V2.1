import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSystemSoundSettings } from "@/hooks/useSystemSoundSettings";
import { useRetryMutation } from "@/hooks/useRetryMutation";
import { useIndexEntity } from "@/hooks/semantic/useIndexEntity";
import { triggerRaceEvent } from "@/hooks/race/useRaceTrigger";
import type { SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";

const LEAD_STATUSES = new Set(["lead", "prospecting", "qualified"]);
function saleEntityType(status?: string | null): SemanticEntityType {
  return status && LEAD_STATUSES.has(status) ? "lead" : "deal";
}
export interface Sale {
  id: string;
  client_id: string | null;
  product_id: string | null;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  source: string | null;
  salesperson_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSaleInput {
  client_id?: string;
  product_id?: string;
  client_name: string;
  product_name: string;
  amount: number;
  status?: string;
  category?: string;
  source?: string;
  salesperson_id?: string;
}

const statusMap: Record<string, string> = {
  pending: "pending",
  qualified: "qualified",
  proposal: "proposal",
  negotiation: "negotiation",
  completed: "completed",
  lost: "lost",
};

export const useSalesData = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["sales-list", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select(`
          *,
          client:clients(name),
          product:products(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`client_name.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((sale) => ({
        id: sale.id.substring(0, 8).toUpperCase(),
        fullId: sale.id,
        cliente: (sale as any).client?.name || sale.client_name,
        produto: (sale as any).product?.name || sale.product_name,
        valor: Number(sale.amount),
        status: statusMap[sale.status] || sale.status,
        data: format(new Date(sale.created_at), "dd/MM/yyyy", { locale: ptBR }),
      }));
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { playSoundForCategory } = useSystemSoundSettings();
  const { index } = useIndexEntity();

  return useRetryMutation(
    async (input: CreateSaleInput) => {
      const { data, error } = await supabase
        .from("sales")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      retryConfig: { maxRetries: 3, baseDelay: 1000 },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["sales-list"] });
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
        toast.success("Venda criada com sucesso!");
        playSoundForCategory('newSale');
        if (data?.id) {
          index(saleEntityType(data.status), data.id);
          triggerRaceEvent(data.id);
        }
      },
      onError: (error) => {
        if (import.meta.env.DEV) {
          if (import.meta.env.DEV) console.error("Error creating sale:", error);
        }
        toast.error("Erro ao criar venda após múltiplas tentativas");
      },
    }
  );
};
