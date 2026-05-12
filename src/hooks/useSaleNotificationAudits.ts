import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SaleNotificationAudit {
  id: string;
  sale_id: string;
  seller_id: string;
  seller_name: string;
  sale_amount: number;
  seller_rank_at_time: number;
  recipient_id: string;
  recipient_rank_at_time: number;
  notification_type: string;
  status: string;
  created_at: string;
}

export function useSaleNotificationAudits(limit = 100) {
  return useQuery({
    queryKey: ["sale-notification-audits", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_notifications_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as SaleNotificationAudit[];
    },
  });
}
