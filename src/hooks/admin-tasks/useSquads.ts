import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SquadRecord {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  member_count?: number;
}

export interface SquadMember {
  squad_id: string;
  user_id: string;
  added_at: string;
}

export const useSquads = () => {
  const qc = useQueryClient();

  const list = useQuery<SquadRecord[]>({
    queryKey: ['squads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('squads')
        .select('*, squad_members(user_id)')
        .order('name');
      if (error) throw error;
      return (data || []).map((s: { id: string; name: string; description: string | null; color: string; created_at: string; squad_members?: { user_id: string }[] }) => ({
        ...s,
        member_count: s.squad_members?.length || 0,
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('squads').insert({
        name: input.name,
        description: input.description || null,
        color: input.color || '#6366f1',
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      toast.success('Squad criado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('squads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      toast.success('Squad removido');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addMember = useMutation({
    mutationFn: async (input: { squad_id: string; user_id: string }) => {
      const { error } = await supabase.from('squad_members').insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      qc.invalidateQueries({ queryKey: ['squad-members'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: async (input: { squad_id: string; user_id: string }) => {
      const { error } = await supabase
        .from('squad_members')
        .delete()
        .eq('squad_id', input.squad_id)
        .eq('user_id', input.user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      qc.invalidateQueries({ queryKey: ['squad-members'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignToSquad = useMutation({
    mutationFn: async (input: {
      catalog_id: string;
      squad_id: string;
      due_date?: string | null;
      recurrence?: string | null;
    }) => {
      const { data, error } = await supabase.rpc('assign_task_to_squad', {
        _catalog_id: input.catalog_id,
        _squad_id: input.squad_id,
        _due_date: input.due_date ?? null,
        _recurrence: input.recurrence ?? null,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['task-assignments'] });
      toast.success(`${count} atribuições criadas`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...list, create, remove, addMember, removeMember, assignToSquad };
};

export const useSquadMembers = (squadId?: string) => {
  return useQuery<SquadMember[]>({
    queryKey: ['squad-members', squadId],
    queryFn: async () => {
      if (!squadId) return [];
      const { data, error } = await supabase
        .from('squad_members')
        .select('*')
        .eq('squad_id', squadId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!squadId,
  });
};
