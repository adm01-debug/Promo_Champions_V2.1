import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDuplicateOptions { 
  tableName: string; 
  queryKey: string[]; 
  excludeFields?: string[]; 
  transformData?: (data: Record<string, unknown>) => Record<string, unknown>; 
}

const getTable = (tableName: string) => {
  return (supabase as any).from(tableName);
};

export function useDuplicate<T extends { id: string }>({ 
  tableName, 
  queryKey, 
  excludeFields = ['id', 'created_at', 'updated_at'], 
  transformData 
}: UseDuplicateOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: T) => {
      const duplicateData = { ...item } as Record<string, unknown>;
      excludeFields.forEach(f => delete duplicateData[f]);
      if (duplicateData.name) duplicateData.name = `${duplicateData.name} (Cópia)`;
      if (duplicateData.titulo) duplicateData.titulo = `${duplicateData.titulo} (Cópia)`;
      const finalData = transformData ? transformData(duplicateData) : duplicateData;
      const { data, error } = await getTable(tableName).insert(finalData).select().single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Item duplicado com sucesso!');
      return data;
    },
    onError: (error: Error) => toast.error(`Erro ao duplicar: ${error.message}`),
  });
}
