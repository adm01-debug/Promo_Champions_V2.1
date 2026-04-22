import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STAGE_WEIGHTS: Record<string, number> = {
  lead: 0.05,
  prospecting: 0.1,
  qualified: 0.2,
  proposal: 0.4,
  negotiation: 0.6,
  won: 1,
  closed: 1,
  lost: 0,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const today = new Date();
    const periodStart =
      body.period_start ??
      new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const periodEnd =
      body.period_end ??
      new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    const source = body.source ?? "weighted";

    const { data: sales, error: salesErr } = await supabase
      .from("sales")
      .select("id, amount, stage, salesperson_id, status")
      .in("status", ["pending", "in_progress", "negotiation"]);
    if (salesErr) throw salesErr;

    const grouped = new Map<
      string,
      {
        owner_id: string | null;
        forecast_amount: number;
        forecast_deals: number;
        weighted_amount: number;
        commit_amount: number;
        best_case_amount: number;
      }
    >();

    for (const s of sales ?? []) {
      const owner = s.salesperson_id ?? "unassigned";
      const w = STAGE_WEIGHTS[(s.stage ?? "").toLowerCase()] ?? 0.1;
      const amount = Number(s.amount ?? 0);
      const g = grouped.get(owner) ?? {
        owner_id: s.salesperson_id ?? null,
        forecast_amount: 0,
        forecast_deals: 0,
        weighted_amount: 0,
        commit_amount: 0,
        best_case_amount: 0,
      };
      g.forecast_amount += amount;
      g.forecast_deals += 1;
      g.weighted_amount += amount * w;
      if (w >= 0.6) g.commit_amount += amount;
      if (w >= 0.4) g.best_case_amount += amount;
      grouped.set(owner, g);
    }

    const rows = Array.from(grouped.values()).map((g) => ({
      ...g,
      period_start: periodStart,
      period_end: periodEnd,
      source,
    }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr, data: inserted } = await supabase
      .from("forecast_snapshots")
      .insert(rows)
      .select("id");
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ inserted: inserted?.length ?? 0, period_start: periodStart, period_end: periodEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
