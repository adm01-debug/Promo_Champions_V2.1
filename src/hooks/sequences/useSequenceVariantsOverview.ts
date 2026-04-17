import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StepVariantOverviewRow {
  step_id: string;
  step_order: number;
  channel: string;
  variant_id: string;
  label: "A" | "B";
  sent: number;
  replied: number;
  reply_rate: number;
}

export function useSequenceVariantsOverview(sequenceId: string | undefined) {
  return useQuery({
    queryKey: ["sequence-variants-overview", sequenceId],
    queryFn: async (): Promise<StepVariantOverviewRow[]> => {
      if (!sequenceId) return [];
      const { data: steps, error: stepsErr } = await supabase
        .from("sequence_steps")
        .select("id, step_order, channel")
        .eq("sequence_id", sequenceId)
        .order("step_order", { ascending: true });
      if (stepsErr) throw stepsErr;
      const stepIds = (steps ?? []).map((s) => s.id);
      if (stepIds.length === 0) return [];

      const { data: perf, error: perfErr } = await supabase
        .from("sequence_variant_performance")
        .select("step_id, variant_id, label, sent, replied, reply_rate")
        .in("step_id", stepIds);
      if (perfErr) throw perfErr;

      const stepMap = new Map((steps ?? []).map((s) => [s.id, s]));
      return (perf ?? []).map((p) => ({
        step_id: p.step_id as string,
        step_order: stepMap.get(p.step_id as string)?.step_order ?? 0,
        channel: stepMap.get(p.step_id as string)?.channel ?? "email",
        variant_id: p.variant_id as string,
        label: p.label as "A" | "B",
        sent: Number(p.sent ?? 0),
        replied: Number(p.replied ?? 0),
        reply_rate: Number(p.reply_rate ?? 0),
      }));
    },
    enabled: !!sequenceId,
  });
}
