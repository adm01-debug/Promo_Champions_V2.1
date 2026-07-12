import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { chunkedIn } from "@/lib/supabase/chunkedIn";
import { toast } from "sonner";

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["quote-cadences"] });
  qc.invalidateQueries({ queryKey: ["quote-cadence-stats"] });
  qc.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
}

type BulkInput = { ids: string[] };

async function bulkUpdate(
  ids: string[],
  patch: { status: "paused" | "active" | "cancelled"; completed_at?: string },
  label: string,
) {
  if (ids.length === 0) return;
  await chunkedIn<{ id: string }>(
    ids,
    (chunk) => supabase
      .from("prospect_cadences")
      .update(patch)
      .in("id", chunk as string[])
      .select("id"),
    { label },
  );
}

export function useBulkPauseQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) => bulkUpdate(ids, { status: "paused" }, "cadences.pause"),
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) pausado(s)`);
    },
    onError: () => toast.error("Erro ao pausar em lote"),
  });
}

export function useBulkResumeQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) => bulkUpdate(ids, { status: "active" }, "cadences.resume"),
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) retomado(s)`);
    },
    onError: () => toast.error("Erro ao retomar em lote"),
  });
}

export function useBulkCancelQuoteCadences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: BulkInput) =>
      bulkUpdate(ids, { status: "cancelled", completed_at: new Date().toISOString() }, "cadences.cancel"),
    onSuccess: (_, v) => {
      invalidate(qc);
      toast.success(`${v.ids.length} follow-up(s) cancelado(s)`);
    },
    onError: () => toast.error("Erro ao cancelar em lote"),
  });
}
