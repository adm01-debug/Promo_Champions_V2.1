import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { computeAtRiskDeals, type LossPattern, type OpenDeal } from "./scoring.ts";

const EXCLUDED_STATUSES = ["won", "lost", "completed"];

interface RequestBody {
  force?: boolean;
  threshold?: number;
  limit?: number;
}

function log(event: string, data: Record<string, unknown>) {
  console.info(JSON.stringify({ fn: "detect-winloss-at-risk", event, ...data }));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();

  try {
    let body: RequestBody = {};
    if (req.method === "POST") {
      try {
        const text = await req.text();
        if (text) body = JSON.parse(text) as RequestBody;
      } catch {
        body = {};
      }
    }
    const threshold = typeof body.threshold === "number" && body.threshold >= 0 && body.threshold <= 100
      ? body.threshold
      : 40;
    const limit = typeof body.limit === "number" && body.limit > 0 && body.limit <= 100
      ? body.limit
      : 20;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [{ data: patternsRaw, error: pErr }, { data: salesRaw, error: sErr }] = await Promise.all([
      supabase
        .from("win_loss_patterns")
        .select("pattern_type, label, outcome, frequency, win_rate, avg_cycle_days, avg_amount, confidence")
        .order("confidence", { ascending: false })
        .limit(100),
      supabase
        .from("sales")
        .select("id, client_name, amount, status, category, source, updated_at, created_at")
        .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`)
        .order("updated_at", { ascending: true })
        .limit(300),
    ]);

    if (pErr) log("patterns_error", { message: pErr.message });
    if (sErr) log("sales_error", { message: sErr.message });

    const patterns = (patternsRaw ?? []) as LossPattern[];
    const deals = (salesRaw ?? []) as OpenDeal[];

    const results = computeAtRiskDeals(deals, patterns, new Date(), { threshold, limit });

    log("computed", {
      total_patterns: patterns.length,
      total_deals_evaluated: deals.length,
      total_at_risk: results.length,
      top_score: results[0]?.risk_score ?? 0,
      threshold,
      duration_ms: Date.now() - startedAt,
    });

    return new Response(
      JSON.stringify({
        deals: results,
        total: results.length,
        meta: {
          patterns_used: patterns.length,
          deals_evaluated: deals.length,
          threshold,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    log("error", { message, duration_ms: Date.now() - startedAt });
    return new Response(JSON.stringify({ error: message, deals: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
