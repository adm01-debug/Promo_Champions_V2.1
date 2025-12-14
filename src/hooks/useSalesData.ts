import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSystemSoundSettings } from "@/hooks/useSystemSoundSettings";

export interface Sale {
  id: string;
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
  client_name: string;
  product_name: string;
  amount: number;
  status?: string;
  category?: string;
  source?: string;
  salesperson_id?: string;
}

const statusMap: Record<string, string> = {
  pending: "pendente",
  qualified: "qualificada",
  proposal: "proposta",
  negotiation: "negociação",
  completed: "concluída",
  lost: "cancelada",
};

export const useSalesData = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["sales-list", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("*")
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
        cliente: sale.client_name,
        produto: sale.product_name,
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

  return useMutation({
    mutationFn: async (input: CreateSaleInput) => {
      const { data, error } = await supabase
        .from("sales")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-list"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      toast.success("Venda criada com sucesso!");
      playSoundForCategory('newSale');
    },
    onError: (error) => {
      console.error("Error creating sale:", error);
      toast.error("Erro ao criar venda");
    },
  });
};
