import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfMonth, endOfMonth } from "date-fns";

export interface RoutingLogEntry {
  id: string;
  client_id: string | null;
  from_salesperson_id: string | null;
  to_salesperson_id: string | null;
  routing_reason: string;
  notes: string | null;
  created_at: string;
  client?: { id: string; name: string } | null;
  from_salesperson?: { id: string; name: string } | null;
  to_salesperson?: { id: string; name: string } | null;
}

export interface SalespersonPerformance {
  id: string;
  name: string;
  role: string;
  totalSales: number;
  dealsCount: number;
  conversionRate: number;
  activeClientsCount: number;
  rank: number;
}

// Fetch routing history
export function useRoutingHistory(limit = 50) {
  return useQuery({
    queryKey: ["routing-history", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_routing_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch related data separately
      const clientIds = [...new Set(data?.map(d => d.client_id).filter(Boolean) || [])];
      const salespersonIds = [...new Set([
        ...data?.map(d => d.from_salesperson_id).filter(Boolean) || [],
        ...data?.map(d => d.to_salesperson_id).filter(Boolean) || [],
      ])];

      const [clientsResult, salespeopleResult] = await Promise.all([
        clientIds.length > 0
          ? supabase.from("clients").select("id, name").in("id", clientIds)
          : Promise.resolve({ data: [] }),
        salespersonIds.length > 0
          ? supabase.from("salespeople").select("id, name").in("id", salespersonIds as string[])
          : Promise.resolve({ data: [] }),
      ]);

      const clientsMap = new Map<string, { id: string; name: string }>();
      clientsResult.data?.forEach(c => clientsMap.set(c.id, c));

      const salespeopleMap = new Map<string, { id: string; name: string }>();
      salespeopleResult.data?.forEach(s => salespeopleMap.set(s.id, s));

      return data?.map(entry => ({
        ...entry,
        client: entry.client_id ? clientsMap.get(entry.client_id) || null : null,
        from_salesperson: entry.from_salesperson_id ? salespeopleMap.get(entry.from_salesperson_id) || null : null,
        to_salesperson: entry.to_salesperson_id ? salespeopleMap.get(entry.to_salesperson_id) || null : null,
      })) as RoutingLogEntry[];
    },
  });
}

// Get salesperson performance ranking for routing decisions
export function useSalespersonPerformance() {
  return useQuery({
    queryKey: ["salesperson-performance-routing"],
    queryFn: async (): Promise<SalespersonPerformance[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch all data in parallel
      const [salespeopleResult, salesResult, portfolioResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id, name, role")
          .eq("is_active", true)
          .in("role", ["closer", "hybrid"]), // Only closers manage portfolios
        supabase
          .from("sales")
          .select("salesperson_id, amount, status")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("client_portfolio")
          .select("salesperson_id, status"),
      ]);

      if (salespeopleResult.error) throw salespeopleResult.error;
      if (salesResult.error) throw salesResult.error;

      const salespeople = salespeopleResult.data || [];
      const sales = salesResult.data || [];
      const portfolios = portfolioResult.data || [];

      // Calculate performance metrics
      const performanceData = salespeople.map(sp => {
        const spSales = sales.filter(s => s.salesperson_id === sp.id);
        const completedSales = spSales.filter(s => s.status === "completed");
        const totalDeals = spSales.length;
        const wonDeals = completedSales.length;
        const totalSales = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
        const activeClients = portfolios.filter(
          p => p.salesperson_id === sp.id && p.status === "active"
        ).length;

        return {
          id: sp.id,
          name: sp.name,
          role: sp.role,
          totalSales,
          dealsCount: wonDeals,
          conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
          activeClientsCount: activeClients,
          rank: 0, // Will be set after sorting
        };
      });

      // Sort by total sales (primary) and conversion rate (secondary)
      performanceData.sort((a, b) => {
        if (b.totalSales !== a.totalSales) return b.totalSales - a.totalSales;
        return b.conversionRate - a.conversionRate;
      });

      // Assign ranks
      performanceData.forEach((sp, index) => {
        sp.rank = index + 1;
      });

      return performanceData;
    },
    staleTime: 60000,
  });
}

// Get top performer for automatic routing
export function useTopPerformer() {
  const { data: performers } = useSalespersonPerformance();
  return performers?.[0] || null;
}

// Manual route lead
export function useRouteLeadManually() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      toSalespersonId,
      fromSalespersonId,
      reason,
      notes,
    }: {
      clientId: string;
      toSalespersonId: string;
      fromSalespersonId?: string;
      reason: string;
      notes?: string;
    }) => {
      // Update client_portfolio
      const { data: existing } = await supabase
        .from("client_portfolio")
        .select("id")
        .eq("client_id", clientId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from("client_portfolio")
          .update({
            salesperson_id: toSalespersonId,
            source: "routed",
            updated_at: new Date().toISOString(),
          })
          .eq("client_id", clientId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("client_portfolio")
          .insert({
            client_id: clientId,
            salesperson_id: toSalespersonId,
            status: "inactive",
            source: "routed",
          });

        if (insertError) throw insertError;
      }

      // Log the routing
      const { error: logError } = await supabase.from("lead_routing_log").insert({
        client_id: clientId,
        from_salesperson_id: fromSalespersonId || null,
        to_salesperson_id: toSalespersonId,
        routing_reason: reason,
        notes: notes || null,
      });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routing-history"] });
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
      toast.success("Lead roteado com sucesso!");
    },
    onError: (error) => {
      console.error("Error routing lead:", error);
      toast.error("Erro ao rotear lead");
    },
  });
}

// Auto-route to top performer
export function useAutoRouteToTopPerformer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      fromSalespersonId,
    }: {
      clientId: string;
      fromSalespersonId?: string;
    }) => {
      // Get top performer
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, role")
        .eq("is_active", true)
        .in("role", ["closer", "hybrid"]);

      if (spError) throw spError;

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      if (salesError) throw salesError;

      // Find top performer
      const performanceMap = new Map<string, number>();
      salespeople?.forEach(sp => performanceMap.set(sp.id, 0));
      sales?.forEach(s => {
        if (s.salesperson_id && performanceMap.has(s.salesperson_id)) {
          performanceMap.set(
            s.salesperson_id,
            (performanceMap.get(s.salesperson_id) || 0) + Number(s.amount)
          );
        }
      });

      let topPerformer = salespeople?.[0];
      let maxSales = 0;

      performanceMap.forEach((total, spId) => {
        if (total > maxSales) {
          maxSales = total;
          topPerformer = salespeople?.find(sp => sp.id === spId);
        }
      });

      if (!topPerformer) {
        throw new Error("Nenhum Closer disponível para receber o lead");
      }

      // Update client_portfolio
      const { data: existing } = await supabase
        .from("client_portfolio")
        .select("id")
        .eq("client_id", clientId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from("client_portfolio")
          .update({
            salesperson_id: topPerformer.id,
            source: "auto_performance",
            updated_at: new Date().toISOString(),
          })
          .eq("client_id", clientId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("client_portfolio")
          .insert({
            client_id: clientId,
            salesperson_id: topPerformer.id,
            status: "inactive",
            source: "auto_performance",
          });

        if (insertError) throw insertError;
      }

      // Log the routing
      const { error: logError } = await supabase.from("lead_routing_log").insert({
        client_id: clientId,
        from_salesperson_id: fromSalespersonId || null,
        to_salesperson_id: topPerformer.id,
        routing_reason: `Roteamento automático - Top Performer (R$ ${maxSales.toLocaleString("pt-BR")})`,
        notes: `Atribuído automaticamente ao melhor vendedor do mês: ${topPerformer.name}`,
      });

      if (logError) throw logError;

      return { topPerformer, totalSales: maxSales };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routing-history"] });
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
      toast.success(`Lead atribuído a ${data.topPerformer.name} (Top Performer)`);
    },
    onError: (error) => {
      console.error("Error auto-routing lead:", error);
      toast.error("Erro ao rotear lead automaticamente");
    },
  });
}

// Round-robin routing (equal distribution)
export function useRoundRobinRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      fromSalespersonId,
    }: {
      clientId: string;
      fromSalespersonId?: string;
    }) => {
      // Get all closers
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, role")
        .eq("is_active", true)
        .in("role", ["closer", "hybrid"]);

      if (spError) throw spError;
      if (!salespeople?.length) {
        throw new Error("Nenhum Closer disponível");
      }

      // Get portfolio counts
      const { data: portfolios, error: portError } = await supabase
        .from("client_portfolio")
        .select("salesperson_id");

      if (portError) throw portError;

      // Count clients per salesperson
      const countMap = new Map<string, number>();
      salespeople.forEach(sp => countMap.set(sp.id, 0));
      portfolios?.forEach(p => {
        if (countMap.has(p.salesperson_id)) {
          countMap.set(p.salesperson_id, (countMap.get(p.salesperson_id) || 0) + 1);
        }
      });

      // Find salesperson with fewest clients
      let minCount = Infinity;
      let selectedSp = salespeople[0];

      countMap.forEach((count, spId) => {
        if (count < minCount) {
          minCount = count;
          selectedSp = salespeople.find(sp => sp.id === spId) || salespeople[0];
        }
      });

      // Update client_portfolio
      const { data: existing } = await supabase
        .from("client_portfolio")
        .select("id")
        .eq("client_id", clientId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from("client_portfolio")
          .update({
            salesperson_id: selectedSp.id,
            source: "round_robin",
            updated_at: new Date().toISOString(),
          })
          .eq("client_id", clientId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("client_portfolio")
          .insert({
            client_id: clientId,
            salesperson_id: selectedSp.id,
            status: "inactive",
            source: "round_robin",
          });

        if (insertError) throw insertError;
      }

      // Log the routing
      const { error: logError } = await supabase.from("lead_routing_log").insert({
        client_id: clientId,
        from_salesperson_id: fromSalespersonId || null,
        to_salesperson_id: selectedSp.id,
        routing_reason: `Distribuição equilibrada (Round-Robin)`,
        notes: `${selectedSp.name} possui ${minCount} clientes na carteira`,
      });

      if (logError) throw logError;

      return { selectedSp, clientCount: minCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routing-history"] });
      queryClient.invalidateQueries({ queryKey: ["client-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
      toast.success(`Lead atribuído a ${data.selectedSp.name} (Distribuição equilibrada)`);
    },
    onError: (error) => {
      console.error("Error round-robin routing lead:", error);
      toast.error("Erro ao rotear lead");
    },
  });
}
