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

export interface ClientsQueryResult {
  data: Client[];
  count: number;
  pageCount: number;
}

export const useClients = (
  searchTerm?: string, 
  page = 1, 
  pageSize = 50
) => {
  return useQuery({
    queryKey: ["clients", searchTerm, page, pageSize],
    queryFn: async (): Promise<ClientsQueryResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchTerm && searchTerm.trim() !== "") {
        query = query.or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching clients:", error);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        pageCount: Math.ceil((count || 0) / pageSize),
      };
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
        .insert([
          {
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            company: input.company || null,
            total_value: input.total_value || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newClient) => {
      toast.success("Cliente criado com sucesso!");
      invalidateDomain("clients");
      
      // Atualizar cache de forma otimista
      queryClient.setQueryData<ClientsQueryResult>(
        ["clients", undefined, 1, 50],
        (old) => {
          if (!old) return { data: [newClient], count: 1, pageCount: 1 };
          return {
            data: [newClient, ...old.data],
            count: old.count + 1,
            pageCount: Math.ceil((old.count + 1) / 50),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente. Tente novamente.");
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Client>;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedClient) => {
      toast.success("Cliente atualizado com sucesso!");
      invalidateDomain("clients");
      
      // Atualizar cache de forma otimista
      queryClient.setQueriesData<ClientsQueryResult>(
        { queryKey: ["clients"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(item => item.id === updatedClient.id ? updatedClient : item),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente. Tente novamente.");
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
      return id;
    },
    onSuccess: (deletedId) => {
      toast.success("Cliente excluído com sucesso!");
      invalidateDomain("clients");
      
      // Atualizar cache de forma otimista
      queryClient.setQueriesData<ClientsQueryResult>(
        { queryKey: ["clients"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: removeItemFromArray(old.data, deletedId),
            count: old.count - 1,
            pageCount: Math.ceil((old.count - 1) / 50),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente. Tente novamente.");
    },
  });
};
