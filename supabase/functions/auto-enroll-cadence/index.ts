import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { withRequestId } from "../_shared/request-id.ts";



interface EnrollResult {
  sale_id: string;
  enrolled: boolean;
  rule_id?: string;
  cadence_id?: string;
  rule_name?: string;
  reason?: string;
}

Deno.serve(withRequestId('auto-enroll-cadence', async (req, _ctx) => {
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

    // Phase 1: run all rule-match RPCs in parallel (was sequential per saleId)
    const ruleMatchResults = await Promise.all(
      saleIds.map((saleId) =>
        supabase
          .rpc("find_matching_cadence_rule", { _sale_id: saleId })
          .then((r) => ({ saleId, data: r.data, error: r.error }))
      ),
    );

    const matched: Array<{ saleId: string; rule_id: string; cadence_id: string; rule_name: string }> = [];
    const noMatchIds: string[] = [];
    for (const r of ruleMatchResults) {
      if (r.error || !r.data || r.data.length === 0) {
        noMatchIds.push(r.saleId);
      } else {
        matched.push({ saleId: r.saleId, ...r.data[0] });
      }
    }

    // Phase 2: batch-fetch salesperson_ids for all matched sales (was N queries)
    const matchedSaleIds = matched.map((m) => m.saleId);
    const salespersonBySaleId = new Map<string, string | null>();
    if (matchedSaleIds.length > 0) {
      const { data: salesData } = await supabase
        .from("sales")
        .select("id, salesperson_id")
        .in("id", matchedSaleIds);
      for (const s of salesData ?? []) salespersonBySaleId.set(s.id, s.salesperson_id);
    }

    // Phase 3: batch-fetch steps for all unique cadence_ids (was N queries)
    const uniqueCadenceIds = [...new Set(matched.map((m) => m.cadence_id))];
    const stepsByCadenceId = new Map<string, Array<{ id: string; day_number: number }>>();
    if (uniqueCadenceIds.length > 0) {
      const { data: allSteps } = await supabase
        .from("cadence_steps")
        .select("id, day_number, cadence_id")
        .in("cadence_id", uniqueCadenceIds)
        .order("day_number", { ascending: true });
      for (const step of allSteps ?? []) {
        const bucket = stepsByCadenceId.get(step.cadence_id) ?? [];
        bucket.push({ id: step.id, day_number: step.day_number });
        stepsByCadenceId.set(step.cadence_id, bucket);
      }
    }

    // Phase 4: insert enrollments in parallel — each row needs its own id back
    const today = new Date();
    const enrollmentInserts = await Promise.all(
      matched.map((m) => {
        const steps = stepsByCadenceId.get(m.cadence_id) ?? [];
        const firstDay = steps[0]?.day_number ?? 1;
        const firstDate = new Date(today);
        firstDate.setDate(firstDate.getDate() + firstDay - 1);
        return supabase
          .from("prospect_cadences")
          .insert({
            sale_id: m.saleId,
            cadence_id: m.cadence_id,
            salesperson_id: salespersonBySaleId.get(m.saleId) ?? null,
            enrolled_via_rule_id: m.rule_id,
            enrollment_source: "auto",
            next_action_date: firstDate.toISOString().split("T")[0],
          })
          .select("id, sale_id, cadence_id")
          .single()
          .then((r) => ({ m, data: r.data, error: r.error }));
      }),
    );

    // Phase 5: batch insert ALL cadence tasks in one call (was N inserts)
    const allTasks: Array<{ prospect_cadence_id: string; cadence_step_id: string; scheduled_date: string }> = [];
    for (const ins of enrollmentInserts) {
      if (!ins.data) continue;
      const steps = stepsByCadenceId.get(ins.data.cadence_id) ?? [];
      for (const step of steps) {
        const d = new Date(today);
        d.setDate(d.getDate() + step.day_number - 1);
        allTasks.push({
          prospect_cadence_id: ins.data.id,
          cadence_step_id: step.id,
          scheduled_date: d.toISOString().split("T")[0],
        });
      }
    }
    if (allTasks.length > 0) {
      await supabase.from("cadence_tasks").insert(allTasks);
    }

    // Build consolidated results
    const results: EnrollResult[] = [
      ...noMatchIds.map((saleId) => ({ sale_id: saleId, enrolled: false, reason: "no_match" })),
      ...enrollmentInserts.map((ins) => {
        if (ins.error || !ins.data) {
          return { sale_id: ins.m.saleId, enrolled: false, reason: ins.error?.message ?? "insert_failed" };
        }
        return { sale_id: ins.m.saleId, enrolled: true, rule_id: ins.m.rule_id, cadence_id: ins.m.cadence_id, rule_name: ins.m.rule_name };
      }),
    ];

    const enrolledCount = results.filter((r) => r.enrolled).length;

    return new Response(
      JSON.stringify({ processed: results.length, enrolled: enrolledCount, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error('auto-enroll-cadence error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
}));
