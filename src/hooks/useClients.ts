import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente");
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    },
  });
};
