import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWinLossRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("win-loss-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "win_loss_analyses" }, () => {
        qc.invalidateQueries({ queryKey: ["wl-analyses-filtered"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "win_loss_patterns" }, () => {
        qc.invalidateQueries({ queryKey: ["win-loss-patterns"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "win_loss_insights" }, () => {
        qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
}
