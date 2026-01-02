import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bitrix24 } from '@/lib/bitrix24';
import { toast } from 'sonner';

export interface Deal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  CONTACT_ID?: string;
  COMPANY_ID?: string;
  ASSIGNED_BY_ID?: string;
  DATE_CREATE: string;
  DATE_MODIFY: string;
}

export function useDealsReal() {
  return useQuery({
    queryKey: ['deals-real'],
    queryFn: async () => {
      const response = await bitrix24.getDeals({
        select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CONTACT_ID', 'ASSIGNED_BY_ID', 'DATE_CREATE'],
        filter: { '>OPPORTUNITY': '0' }
      });
      return response.items as Deal[];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      return await bitrix24.createDeal(deal);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals-real'] });
      toast.success('Negócio criado!');
    },
    onError: () => {
      toast.error('Erro ao criar negócio');
    },
  });
}
