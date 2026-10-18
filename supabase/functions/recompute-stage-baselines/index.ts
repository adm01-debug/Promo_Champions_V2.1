import { getCorsHeaders } from "../_shared/cors.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { withRequestId } from "../_shared/request-id.ts";
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function toRow(stage: string, segment: string, ownerId: string | null, hours: number[]) {
  const days = hours.map((h) => h / 24).sort((a, b) => a - b);
  const avgDays = days.reduce((s, n) => s + n, 0) / days.length;
  const now = new Date().toISOString();
  return {
    stage,
    segment,
    owner_id: ownerId,
    p50_hours: Number(percentile(hours, 50).toFixed(2)),
    p75_hours: Number(percentile(hours, 75).toFixed(2)),
    p90_hours: Number(percentile(hours, 90).toFixed(2)),
    avg_days: Number(avgDays.toFixed(2)),
    median_days: Number(percentile(days, 50).toFixed(2)),
    p75_days: Number(percentile(days, 75).toFixed(2)),
    sample_size: hours.length,
    computed_at: now,
    calculated_at: now,
  };
}

Deno.serve(withRequestId("recompute-stage-baselines", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Varredura do historico de toda a equipe — restrito a admin/manager.
    let caller;
    try {
      caller = await getUserClient(req);
    } catch (authErr) {
      const msg = authErr instanceof UnauthorizedError ? authErr.message : "unauthorized";
      return new Response(JSON.stringify({ error: msg }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isPrivileged, error: roleError } = await caller.client.rpc(
      "is_admin_or_manager" as never,
      { _user_id: caller.userId } as never,
    );
    if (roleError) throw roleError;
    if (!isPrivileged) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bypass de RLS necessario: baselines cobrem historico de toda a equipe.
    const supabase = getServiceClient(
      "baselines de velocidade cobrem historico de estagios de toda a equipe",
    );

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: transitions, error } = await supabase
      .from("deal_stage_transitions")
      .select("sale_id, to_stage, duration_hours")
      .not("duration_hours", "is", null)
      .gte("entered_at", since)
      .limit(50000);

    if (error) throw error;

    // Mapa sale -> auth_user_id do vendedor, para baselines por dono.
    const saleIds = [
      ...new Set((transitions ?? []).map((t: { sale_id: string }) => t.sale_id)),
    ];
    const ownerBySale = new Map<string, string | null>();
    if (saleIds.length) {
      type SaleRow = { id: string; salespeople?: { auth_user_id?: string | null }[] | null };
      const sales = await chunkedIn<SaleRow>(
        saleIds,
        (chunk) =>
          supabase
            .from("sales")
            .select("id, salesperson_id, salespeople:salesperson_id(auth_user_id)")
            .in("id", chunk),
        { maxConcurrency: 4, label: "recompute-stage-baselines.sales" },
      );
      for (const s of sales) {
        ownerBySale.set(s.id, s.salespeople?.[0]?.auth_user_id ?? null);
      }
    }

    const byStage = new Map<string, number[]>();
    const byStageOwner = new Map<string, number[]>();
    for (const t of transitions || []) {
      const dur = Number(t.duration_hours);
      if (!isFinite(dur) || dur < 0) continue;
      if (!byStage.has(t.to_stage)) byStage.set(t.to_stage, []);
      byStage.get(t.to_stage)!.push(dur);
      const owner = ownerBySale.get(t.sale_id) ?? null;
      if (owner) {
        const key = `${t.to_stage}|${owner}`;
        if (!byStageOwner.has(key)) byStageOwner.set(key, []);
        byStageOwner.get(key)!.push(dur);
      }
    }

    const upserts: Array<Record<string, unknown>> = [];
    for (const [stage, arr] of byStage.entries()) {
      arr.sort((a, b) => a - b);
      upserts.push(toRow(stage, "all", null, arr));
    }
    for (const [key, arr] of byStageOwner.entries()) {
      const sep = key.indexOf("|");
      const stage = key.slice(0, sep);
      const owner = key.slice(sep + 1);
      arr.sort((a, b) => a - b);
      upserts.push(toRow(stage, `owner:${owner}`, owner, arr));
    }

    if (upserts.length) {
      const { error: upErr } = await supabase
        .from("stage_velocity_baselines")
        .upsert(upserts, { onConflict: "stage,segment" });
      if (upErr) throw upErr;
    }

    return new Response(JSON.stringify({ ok: true, baselines: upserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recompute-stage-baselines error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
