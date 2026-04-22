import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EnrollResult {
  sale_id: string;
  enrolled: boolean;
  rule_id?: string;
  cadence_id?: string;
  rule_name?: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let body: { sale_ids?: string[]; mode?: "single" | "batch" } = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { /* empty body */ }
    }

    // Modo batch: pega todas sales sem cadência ativa nas últimas 24h
    let saleIds = body.sale_ids ?? [];
    if (saleIds.length === 0) {
      const { data: recentSales } = await supabase
        .from("sales")
        .select("id")
        .not("status", "in", "(completed,lost,cancelled)")
        .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(200);
      saleIds = (recentSales ?? []).map((s) => s.id);
    }

    const results: EnrollResult[] = [];

    for (const saleId of saleIds) {
      // Avalia regra
      const { data: ruleMatch, error: matchErr } = await supabase
        .rpc("find_matching_cadence_rule", { _sale_id: saleId });

      if (matchErr || !ruleMatch || ruleMatch.length === 0) {
        results.push({ sale_id: saleId, enrolled: false, reason: "no_match" });
        continue;
      }

      const { rule_id, cadence_id, rule_name } = ruleMatch[0];

      // Pega salesperson da venda
      const { data: sale } = await supabase
        .from("sales")
        .select("salesperson_id")
        .eq("id", saleId)
        .single();

      // Pega steps da cadência
      const { data: steps } = await supabase
        .from("cadence_steps")
        .select("*")
        .eq("cadence_id", cadence_id)
        .order("step_order", { ascending: true });

      const today = new Date();
      const firstDay = steps?.[0]?.day_number ?? 1;
      const firstDate = new Date(today);
      firstDate.setDate(firstDate.getDate() + firstDay - 1);

      const { data: enrollment, error: enrollErr } = await supabase
        .from("prospect_cadences")
        .insert({
          sale_id: saleId,
          cadence_id,
          salesperson_id: sale?.salesperson_id ?? null,
          enrolled_via_rule_id: rule_id,
          enrollment_source: "auto",
          next_action_date: firstDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (enrollErr || !enrollment) {
        results.push({ sale_id: saleId, enrolled: false, reason: enrollErr?.message ?? "insert_failed" });
        continue;
      }

      if (steps && steps.length > 0) {
        const tasks = steps.map((step) => {
          const d = new Date(today);
          d.setDate(d.getDate() + step.day_number - 1);
          return {
            prospect_cadence_id: enrollment.id,
            cadence_step_id: step.id,
            scheduled_date: d.toISOString().split("T")[0],
          };
        });
        await supabase.from("cadence_tasks").insert(tasks);
      }

      results.push({ sale_id: saleId, enrolled: true, rule_id, cadence_id, rule_name });
    }

    const enrolledCount = results.filter((r) => r.enrolled).length;

    return new Response(
      JSON.stringify({ processed: results.length, enrolled: enrolledCount, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
