import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type V4DeadLetterStatus = "pending" | "exhausted" | "resolved";

export interface V4DeadLetter {
  id: string;
  external_quote_id: string;
  quote_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  last_error: string | null;
  attempts: number;
  next_retry_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

const MAX_ATTEMPTS = 5;

export function useV4DeadLetters(status: V4DeadLetterStatus, search = "") {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("v4-dead-letters")
      .on("postgres_changes", { event: "*", schema: "public", table: "v4_callback_dead_letters" }, () => {
        qc.invalidateQueries({ queryKey: ["v4-dead-letters"] });
        qc.invalidateQueries({ queryKey: ["v4-callback-kpis"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["v4-dead-letters", status, search],
    queryFn: async (): Promise<V4DeadLetter[]> => {
      let q = supabase
        .from("v4_callback_dead_letters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status === "resolved") q = q.not("resolved_at", "is", null);
      else if (status === "pending") q = q.is("resolved_at", null).lt("attempts", MAX_ATTEMPTS);
      else if (status === "exhausted") q = q.is("resolved_at", null).gte("attempts", MAX_ATTEMPTS);
      if (search.trim()) q = q.ilike("external_quote_id", `%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as V4DeadLetter[];
    },
  });
}

export function useV4CallbackKpis() {
  return useQuery({
    queryKey: ["v4-callback-kpis"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [pending, exhausted, resolved24h, metrics] = await Promise.all([
        supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true }).is("resolved_at", null).lt("attempts", MAX_ATTEMPTS),
        supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true }).is("resolved_at", null).gte("attempts", MAX_ATTEMPTS),
        supabase.from("v4_callback_dead_letters").select("id", { count: "exact", head: true }).gte("resolved_at", since),
        supabase.from("v4_callback_metrics").select("day, sent_ok, failed, exhausted").order("day", { ascending: false }).limit(7),
      ]);
      const totals = (metrics.data ?? []).reduce(
        (a, m) => ({ ok: a.ok + (m.sent_ok ?? 0), failed: a.failed + (m.failed ?? 0), exhausted: a.exhausted + (m.exhausted ?? 0) }),
        { ok: 0, failed: 0, exhausted: 0 },
      );
      const rate = totals.ok + totals.failed > 0 ? (totals.ok / (totals.ok + totals.failed)) * 100 : null;
      return {
        pending: pending.count ?? 0,
        exhausted: exhausted.count ?? 0,
        resolved24h: resolved24h.count ?? 0,
        successRate7d: rate,
        metrics7d: metrics.data ?? [],
      };
    },
  });
}

export function useV4CallbackActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["v4-dead-letters"] });
    qc.invalidateQueries({ queryKey: ["v4-callback-kpis"] });
  };

  const retry = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("v4_callback_dead_letters")
        .update({ next_retry_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => { toast.success(`${n} evento(s) reagendado(s) para agora`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reset = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("v4_callback_dead_letters")
        .update({ attempts: 0, next_retry_at: new Date().toISOString(), last_error: null })
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => { toast.success(`${n} evento(s) com tentativas resetadas`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("v4_callback_dead_letters")
        .update({ resolved_at: new Date().toISOString(), last_error: "manually_archived" })
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => { toast.success(`${n} evento(s) arquivado(s)`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const runDispatcher = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("notify-v4-quote-status", { body: {} });
      if (error) throw error;
      return data as { processed?: number; pending?: number; note?: string };
    },
    onSuccess: (d) => {
      if (d?.note) toast.warning(d.note);
      else toast.success(`Dispatcher executado: ${d?.processed ?? 0} processado(s)`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { retry, reset, archive, runDispatcher };
}
