import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StagnantTasksResult {
  message: string;
  tasksCreated: number;
  stagnantDealsFound?: number;
  dealsAlreadyWithTasks?: number;
  thresholdDays?: number;
}

export function useCreateStagnantTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (): Promise<StagnantTasksResult> => {
      const { data, error } = await supabase.functions.invoke('create-stagnant-tasks');

      if (error) throw error;
      return data as StagnantTasksResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (data.tasksCreated > 0) {
        toast({
          title: 'Tarefas criadas!',
          description: `${data.tasksCreated} tarefa(s) de follow-up criada(s) para deals estagnados.`,
        });
      } else {
        toast({
          title: 'Nenhum deal estagnado',
          description: 'Todos os deals estão em movimento ou já possuem tarefas pendentes.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar tarefas',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
