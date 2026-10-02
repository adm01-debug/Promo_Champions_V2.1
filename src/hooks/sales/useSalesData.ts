import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSystemSoundSettings } from "@/hooks/useSystemSoundSettings";
import { useRetryMutation } from "@/hooks/useRetryMutation";
import { useIndexEntity } from "@/hooks/semantic/useIndexEntity";
import { triggerRaceEvent } from "@/hooks/race/useRaceTrigger";
import { salesService } from "@/services/salesService";
import type { SalesListFilters, SalesPageQuery } from "@/services/salesService";
import { CreateSaleInput } from "@/types/sales";
import type { SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";

const LEAD_STATUSES = new Set(["lead", "prospecting", "qualified"]);

function saleEntityType(status?: string | null): SemanticEntityType {
  return status && LEAD_STATUSES.has(status) ? "lead" : "deal";
}

export const useSalesData = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["sales-list", searchTerm],
    queryFn: () => salesService.getSales(searchTerm),
    staleTime: 30000,
    gcTime: 1000 * 60 * 5,
  });
};

/** Página server-side da lista /vendas (range + count no PostgREST). */
export const useSalesPage = (query: SalesPageQuery) => {
  return useQuery({
    queryKey: ["sales-list", "page", query],
    queryFn: () => salesService.getSalesPage(query),
    staleTime: 30000,
    gcTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
  });
};

/** Resumo de markup sobre TODAS as linhas do filtro atual (não só a página). */
export const useSalesMarkupSummary = (filters: SalesListFilters) => {
  return useQuery({
    queryKey: ["sales-list", "markup-summary", filters],
    queryFn: () => salesService.getSalesMarkupSummary(filters),
    staleTime: 30000,
    gcTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { playSoundForCategory } = useSystemSoundSettings();
  const { index } = useIndexEntity();

  return useRetryMutation(
    (input: CreateSaleInput) => salesService.createSale(input),
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
          console.error("Error creating sale:", error);
        }
        toast.error("Erro ao criar venda após múltiplas tentativas");
      },
    }
  );
};
