import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bitrix24 } from '@/lib/bitrix24';
import { toast } from 'sonner';

export interface Contact {
  ID: string;
  NAME: string;
  SECOND_NAME?: string;
  LAST_NAME?: string;
  EMAIL?: string[];
  PHONE?: string[];
  COMPANY_ID?: string;
}

export function useContactsReal() {
  return useQuery({
    queryKey: ['contacts-real'],
    queryFn: async () => {
      const response = await bitrix24.getContacts({
        select: ['ID', 'NAME', 'SECOND_NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_ID']
      });
      return response.items as Contact[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Partial<Contact>) => {
      return await bitrix24.call('crm.contact.add', { fields: contact });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts-real'] });
      toast.success('Contato criado!');
    },
  });
}
