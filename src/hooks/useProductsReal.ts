import { useQuery } from '@tanstack/react-query';
import { bitrix24 } from '@/lib/bitrix24';

export interface Product {
  ID: string;
  NAME: string;
  PRICE: string;
  CURRENCY_ID: string;
  DESCRIPTION?: string;
  SECTION_ID?: string;
}

export function useProductsReal() {
  return useQuery({
    queryKey: ['products-real'],
    queryFn: async () => {
      const response = await bitrix24.getProducts({
        select: ['ID', 'NAME', 'PRICE', 'CURRENCY_ID', 'DESCRIPTION', 'SECTION_ID']
      });
      return response.items as Product[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
