import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Objection {
  id: string;
  objection: string;
  response: string;
  category: string;
  effectiveness_score: number | null;
  usage_count: number | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
}

interface NewObjection {
  objection: string;
  response: string;
  category: string;
  tags?: string[];
  effectiveness_score?: number;
  created_by?: string;
}

export function useObjectionsLibrary(category?: string) {
  return useQuery({
    queryKey: ['objections-library', category],
    queryFn: async (): Promise<Objection[]> => {
      let query = supabase
        .from('objections_library')
        .select('*')
        .order('usage_count', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    }
  });
}

export function useAddObjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newObjection: NewObjection) => {
      const { data, error } = await supabase
        .from('objections_library')
        .insert(newObjection)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objections-library'] });
      toast.success('Objeção adicionada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao adicionar objeção');
    }
  });
}

export function useUpdateObjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Objection> & { id: string }) => {
      const { data, error } = await supabase
        .from('objections_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objections-library'] });
      toast.success('Objeção atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar objeção');
    }
  });
}

export function useIncrementObjectionUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current, error: fetchError } = await supabase
        .from('objections_library')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('objections_library')
        .update({ usage_count: (current?.usage_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objections-library'] });
    }
  });
}

export function useDeleteObjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('objections_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objections-library'] });
      toast.success('Objeção removida');
    },
    onError: () => {
      toast.error('Erro ao remover objeção');
    }
  });
}
