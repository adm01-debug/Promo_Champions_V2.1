import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInvalidateCache } from "@/hooks/useInvalidateCache";
import { updateItemInArray, removeItemFromArray } from "@/hooks/useOptimisticUpdate";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  total_value: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  total_value?: number;
}

export const useClients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async (): Promise<Client[]> => {
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const { data, error } = await supabase
        .from("clients")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newClient) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previousClients = queryClient.getQueryData<Client[]>(["clients"]);
      
      const optimisticClient: Client = {
        id: `temp-${Date.now()}`,
        name: newClient.name,
        email: newClient.email || null,
        phone: newClient.phone || null,
        company: newClient.company || null,
        total_value: newClient.total_value || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        old ? [optimisticClient, ...old] : [optimisticClient]
      );
      
      return { previousClients };
    },
    onError: (_err, _newClient, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["clients"], context.previousClients);
      }
      toast.error("Erro ao criar cliente");
    },
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
    },
    onSettled: () => {
      invalidateDomain("clients");
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previousClients = queryClient.getQueryData<Client[]>(["clients"]);
      
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        updateItemInArray(old, id, updates)
      );
      
      return { previousClients };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["clients"], context.previousClients);
      }
      toast.error("Erro ao atualizar cliente");
    },
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
    },
    onSettled: () => {
      invalidateDomain("clients");
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (clientId) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previousClients = queryClient.getQueryData<Client[]>(["clients"]);
      
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        removeItemFromArray(old, clientId)
      );
      
      return { previousClients };
    },
    onError: (_err, _clientId, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["clients"], context.previousClients);
      }
      toast.error("Erro ao excluir cliente");
    },
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso!");
    },
    onSettled: () => {
      invalidateDomain("clients");
    },
  });
};
