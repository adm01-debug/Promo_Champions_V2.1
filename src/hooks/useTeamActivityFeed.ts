import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { useEffect } from "react";

export interface TeamActivity {
  id: string;
  type: "sale" | "activity" | "deal_move" | "client_new";
  description: string;
  salesperson_name: string;
  avatar_url: string | null;
  amount?: number;
  created_at: string;
}

interface SaleRow {
  id: string;
  client_name: string;
  amount: number;
  status: string;
  created_at: string;
  salesperson_id: string | null;
}

interface ActivityRow {
  id: string;
  activity_type: string;
  contact_name: string | null;
  outcome: string;
  created_at: string;
  salesperson_id: string | null;
}

interface SalespersonMap {
  [id: string]: { name: string; avatar_url: string | null };
}

const ACTIVITY_LABELS: Record<string, string> = {
  call: "Ligação",
  email: "Email",
  meeting: "Reunião",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  visit: "Visita",
};

export const useTeamActivityFeed = (limit = 20) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('team-activity-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["team-activity-feed"] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["team-activity-feed"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<TeamActivity[]>({
    queryKey: ["team-activity-feed", limit],
    queryFn: async () => {
      // Fetch salespeople for name resolution
      const { data: people } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .eq("is_active", true);

      const spMap: SalespersonMap = {};
      (people || []).forEach((p) => {
        spMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
      });

      const resolve = (spId: string | null) =>
        spId && spMap[spId]
          ? spMap[spId]
          : { name: "Sistema", avatar_url: null };

      // Fetch recent sales
      const { data: sales } = await supabase
        .from("sales")
        .select("id, client_name, amount, status, created_at, salesperson_id")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Fetch recent activities
      const { data: activities } = await supabase
        .from("activities")
        .select("id, activity_type, contact_name, outcome, created_at, salesperson_id")
        .order("created_at", { ascending: false })
        .limit(limit);

      const feed: TeamActivity[] = [];

      (sales as SaleRow[] || []).forEach((s) => {
        const sp = resolve(s.salesperson_id);
        feed.push({
          id: `sale-${s.id}`,
          type: s.status === "won" ? "sale" : "deal_move",
          description:
            s.status === "won"
              ? `Fechou venda com ${s.client_name}`
              : `Moveu ${s.client_name} para ${s.status}`,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          amount: s.amount,
          created_at: s.created_at,
        });
      });

      (activities as ActivityRow[] || []).forEach((a) => {
        const sp = resolve(a.salesperson_id);
        const label = ACTIVITY_LABELS[a.activity_type] || a.activity_type;
        feed.push({
          id: `act-${a.id}`,
          type: "activity",
          description: `${label} com ${a.contact_name || "contato"} — ${a.outcome}`,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          created_at: a.created_at,
        });
      });

      feed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return feed.slice(0, limit);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
