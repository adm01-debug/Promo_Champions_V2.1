import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWinLossRealtime(opts?: { onNewPattern?: () => void }) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("win-loss-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "win_loss_analyses" }, () => {
        qc.invalidateQueries({ queryKey: ["wl-analyses-filtered"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "win_loss_patterns" }, (payload) => {
        qc.invalidateQueries({ queryKey: ["win-loss-patterns"] });
        const p = payload.new as { name?: string } | null;
        toast.success("Novo padrão detectado!", {
          description: p?.name ?? "Padrão Win/Loss identificado pela IA.",
          action: opts?.onNewPattern ? { label: "Ver", onClick: () => opts.onNewPattern!() } : undefined,
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "win_loss_patterns" }, () => {
        qc.invalidateQueries({ queryKey: ["win-loss-patterns"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "win_loss_insights" }, () => {
        qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, opts]);
}
