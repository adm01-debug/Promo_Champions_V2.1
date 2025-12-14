import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchDashboard = () => {
    // Prefetch KPIs
    queryClient.prefetchQuery({
      queryKey: ["dashboard-kpis"],
      queryFn: async () => {
        const { data } = await supabase
          .from("sales")
          .select("id, amount, status, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchPipeline = () => {
    queryClient.prefetchQuery({
      queryKey: ["pipeline"],
      queryFn: async () => {
        const { data } = await supabase
          .from("sales")
          .select("id, client_name, product_name, amount, status, salesperson_id, created_at")
          .neq("status", "completed")
          .neq("status", "lost")
          .order("created_at", { ascending: false });
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchSales = () => {
    queryClient.prefetchQuery({
      queryKey: ["sales"],
      queryFn: async () => {
        const { data } = await supabase
          .from("sales")
          .select("id, client_name, product_name, amount, status, category, salesperson_id, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchClients = () => {
    queryClient.prefetchQuery({
      queryKey: ["clients"],
      queryFn: async () => {
        const { data } = await supabase
          .from("clients")
          .select("id, name, email, company, total_value")
          .order("created_at", { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchProducts = () => {
    queryClient.prefetchQuery({
      queryKey: ["products"],
      queryFn: async () => {
        const { data } = await supabase
          .from("products")
          .select("id, name, price, category, status, sales_count")
          .order("sales_count", { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchRanking = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    queryClient.prefetchQuery({
      queryKey: ["competitive-ranking"],
      queryFn: async () => {
        const [salespeopleResult, salesResult] = await Promise.all([
          supabase
            .from("salespeople")
            .select("id, name, avatar_url, role")
            .eq("is_active", true),
          supabase
            .from("sales")
            .select("salesperson_id, amount")
            .eq("status", "completed")
            .gte("created_at", monthStart.toISOString())
            .lte("created_at", monthEnd.toISOString()),
        ]);
        return { salespeople: salespeopleResult.data, sales: salesResult.data };
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchTasks = () => {
    queryClient.prefetchQuery({
      queryKey: ["tasks"],
      queryFn: async () => {
        const { data } = await supabase
          .from("tasks")
          .select("id, title, status, priority, due_date, salesperson_id")
          .neq("status", "completed")
          .neq("status", "cancelled")
          .order("due_date", { ascending: true })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchActivities = () => {
    queryClient.prefetchQuery({
      queryKey: ["activities"],
      queryFn: async () => {
        const { data } = await supabase
          .from("activities")
          .select("id, activity_type, outcome, salesperson_id, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  // Map routes to prefetch functions
  const prefetchForRoute = (route: string) => {
    const prefetchMap: Record<string, () => void> = {
      "/": prefetchDashboard,
      "/pipeline": prefetchPipeline,
      "/vendas": prefetchSales,
      "/clientes": prefetchClients,
      "/produtos": prefetchProducts,
      "/ranking": prefetchRanking,
      "/tarefas": prefetchTasks,
      "/atividades": prefetchActivities,
      "/metas-atividades": prefetchActivities,
      "/sdr": prefetchActivities,
      "/closer": prefetchPipeline,
    };

    const prefetchFn = prefetchMap[route];
    if (prefetchFn) {
      prefetchFn();
    }
  };

  return { prefetchForRoute };
}
