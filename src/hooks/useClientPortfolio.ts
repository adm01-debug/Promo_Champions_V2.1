import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientPortfolioItem {
  id: string;
  client_id: string;
  salesperson_id: string;
  status: 'active' | 'inactive';
  last_purchase_date: string | null;
  assigned_at: string;
  assigned_by: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    total_value: number;
  } | null;
  salesperson: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface PortfolioStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalValue: number;
  icpMatch: number;
  icpPartial: number;
  icpNone: number;
}

export function useClientPortfolio(salespersonId?: string) {
  return useQuery({
    queryKey: ["client-portfolio", salespersonId],
    queryFn: async () => {
      let query = supabase
        .from("client_portfolio")
        .select(`
          *,
          client:clients(id, name, email, phone, company, total_value)
        `)
        .order("assigned_at", { ascending: false });

      if (salespersonId) {
        query = query.eq("salesperson_id", salespersonId);
      }

      const { data: portfolioData, error } = await query;

      if (error) throw error;

      // Fetch salespeople separately to avoid relationship hint issues
      const salespersonIds = [...new Set(portfolioData?.map(p => p.salesperson_id) || [])];
      const { data: salespeopleData } = await supabase
        .from("salespeople")
        .select("id, name, role")
        .in("id", salespersonIds);

      const salespeopleMap = new Map(salespeopleData?.map(sp => [sp.id, sp]) || []);

      return portfolioData?.map(item => ({
        ...item,
        salesperson: salespeopleMap.get(item.salesperson_id) || null,
      })) as ClientPortfolioItem[];
    },
  });
}

export function usePortfolioStats(salespersonId?: string) {
  return useQuery({
    queryKey: ["portfolio-stats", salespersonId],
    queryFn: async () => {
      let query = supabase
        .from("client_portfolio")
        .select(`
          status,
          client_id,
          client:clients(total_value)
        `);

      if (salespersonId) {
        query = query.eq("salesperson_id", salespersonId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get ICP data for these clients
      const clientIds = data?.map(item => item.client_id).filter(Boolean) || [];
      const { data: icpData } = await supabase
        .from("icp_data")
        .select("client_id, is_icp_match, ramo_atividade, grupo_nicho")
        .in("client_id", clientIds);

      const icpMap = new Map(icpData?.map(icp => [icp.client_id, icp]) || []);

      // Calculate ICP stats
      let icpMatch = 0;
      let icpPartial = 0;
      let icpNone = 0;

      data?.forEach(item => {
        const icp = icpMap.get(item.client_id);
        if (icp?.is_icp_match) {
          icpMatch++;
        } else if (icp?.ramo_atividade || icp?.grupo_nicho) {
          icpPartial++;
        } else {
          icpNone++;
        }
      });

      const stats: PortfolioStats = {
        totalClients: data?.length || 0,
        activeClients: data?.filter(item => item.status === 'active').length || 0,
        inactiveClients: data?.filter(item => item.status === 'inactive').length || 0,
        totalValue: data?.reduce((sum, item) => {
          const value = (item.client as any)?.total_value || 0;
          return sum + Number(value);
        }, 0) || 0,
        icpMatch,
        icpPartial,
        icpNone,
      };

      return stats;
    },
  });
}

export function useAssignClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      salespersonId,
      source = 'manual',
    }: {
      clientId: string;
      salespersonId: string;
      source?: string;
    }) => {
      // Check if client is already assigned
      const { data: existing } = await supabase
        .from("client_portfolio")
        .select("id")
        .eq("client_id", clientId)
        .single();

      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from("client_portfolio")
          .update({
            salesperson_id: salespersonId,
            source,
            updated_at: new Date().toISOString(),
          })
          .eq("client_id", clientId);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from("client_portfolio")
          .insert({
            client_id: clientId,
            salesperson_id: salespersonId,
            status: 'inactive',
            source,
          });

        if (error) throw error;
      }

      // Log the routing
      await supabase.from("lead_routing_log").insert({
        client_id: clientId,
        to_salesperson_id: salespersonId,
        routing_reason: source === 'manual' ? 'Manual assignment' : source,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-stats"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atribuído com sucesso!");
    },
    onError: (error) => {
      console.error("Error assigning client:", error);
      toast.error("Erro ao atribuir cliente");
    },
  });
}

export function useUpdatePortfolioStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      status,
      lastPurchaseDate,
    }: {
      portfolioId: string;
      status: 'active' | 'inactive';
      lastPurchaseDate?: string;
    }) => {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (lastPurchaseDate) {
        updateData.last_purchase_date = lastPurchaseDate;
      }

      const { error } = await supabase
        .from("client_portfolio")
        .update(updateData)
        .eq("id", portfolioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-stats"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    },
  });
}

export function useRemoveFromPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase
        .from("client_portfolio")
        .delete()
        .eq("id", portfolioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-stats"] });
      toast.success("Cliente removido do portfólio!");
    },
    onError: (error) => {
      console.error("Error removing from portfolio:", error);
      toast.error("Erro ao remover cliente");
    },
  });
}

export function useUnassignedClients() {
  return useQuery({
    queryKey: ["unassigned-clients"],
    queryFn: async () => {
      // Get all clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, email, phone, company, total_value")
        .order("name");

      if (clientsError) throw clientsError;

      // Get assigned client IDs
      const { data: assigned, error: assignedError } = await supabase
        .from("client_portfolio")
        .select("client_id");

      if (assignedError) throw assignedError;

      const assignedIds = new Set(assigned?.map(a => a.client_id) || []);

      // Filter unassigned clients
      return clients?.filter(client => !assignedIds.has(client.id)) || [];
    },
  });
}
