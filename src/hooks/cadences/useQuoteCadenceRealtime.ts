import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Subscribes to realtime changes on prospect_cadences and cadence_tasks
 * tied to quote follow-ups. Invalidates relevant React Query caches and
 * surfaces a subtle toast when a new task arrives.
 */
export function useQuoteCadenceRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("quote-cadences-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prospect_cadences" },
        () => {
          qc.invalidateQueries({ queryKey: ["quote-cadences"] });
          qc.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
          qc.invalidateQueries({ queryKey: ["quote-cadence-comparison"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cadence_tasks" },
        () => {
          qc.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
          qc.invalidateQueries({ queryKey: ["cadence-tasks-by-enrollment"] });
          toast.message("Nova tarefa de follow-up", { duration: 2500 });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "cadence_tasks" },
        () => {
          qc.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
          qc.invalidateQueries({ queryKey: ["cadence-tasks-by-enrollment"] });
          qc.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
