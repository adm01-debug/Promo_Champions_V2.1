
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeadDetailedLog {
  id: string;
  client_id: string;
  event_type: 'interaction' | 'trigger' | 'transition' | 'task_created' | 'alert';
  action: string;
  details: any;
  created_at: string;
  created_by?: string;
}

export function useLeadDetailedLogs(clientId: string) {
  return useQuery({
    queryKey: ["lead-detailed-logs", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_detailed_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeadDetailedLog[];
    },
    enabled: !!clientId,
  });
}
