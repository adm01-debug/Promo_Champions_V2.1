import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const body = await req.json().catch(() => ({}));
    const periodStart = body.period_start ?? new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const periodEnd = body.period_end ?? new Date().toISOString().slice(0, 10);
    const periodLabel = body.period_label ?? `Q ${periodStart} → ${periodEnd}`;
    const salespersonId = body.salesperson_id ?? null;

    let salesQ = supabase
      .from("sales")
      .select("amount,status,forecast_category,category,source,created_at,salesperson_id")
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd + "T23:59:59");
    if (salespersonId) salesQ = salesQ.eq("salesperson_id", salespersonId);

    const { data: sales, error: sErr } = await salesQ;
    if (sErr) throw sErr;

    const total = sales?.length ?? 0;
    const won = sales?.filter((s) => s.status === "completed") ?? [];
    const lost = sales?.filter((s) => ["lost", "cancelled"].includes(s.status)) ?? [];
    const revenue = won.reduce((sum, s) => sum + Number(s.amount), 0);
    const closedCount = won.length + lost.length;
    const winRate = closedCount > 0 ? (won.length / closedCount) * 100 : 0;
    const avgDeal = won.length > 0 ? revenue / won.length : 0;

    const byCategory: Record<string, { count: number; revenue: number }> = {};
    won.forEach((s) => {
      const k = s.category || "outros";
      if (!byCategory[k]) byCategory[k] = { count: 0, revenue: 0 };
      byCategory[k].count++;
      byCategory[k].revenue += Number(s.amount);
    });

    const metrics = {
      total_deals: total,
      won_deals: won.length,
      lost_deals: lost.length,
      revenue,
      win_rate: Math.round(winRate * 10) / 10,
      avg_deal_size: Math.round(avgDeal),
      by_category: byCategory,
    };

    // AI narrative via Lovable AI Gateway
    let narrative = "";
    let recommendations: string[] = [];
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Você é um VP de Vendas analisando um QBR. Gere uma narrativa executiva em PT-BR de 4-5 parágrafos cobrindo: highlights, lowlights, principais riscos, e foco do próximo trimestre. Seja específico, baseado em dados, e direto.",
            },
            {
              role: "user",
              content: `Período: ${periodLabel}\nMétricas: ${JSON.stringify(metrics)}`,
            },
          ],
        }),
      });
      if (aiRes.ok) {
        const data = await aiRes.json();
        narrative = data.choices?.[0]?.message?.content ?? "";

        const recRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "Liste 5 recomendações acionáveis para o próximo trimestre baseadas nas métricas. Retorne JSON {\"recommendations\":[\"...\",\"...\"]}",
              },
              { role: "user", content: JSON.stringify(metrics) },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          try {
            const parsed = JSON.parse(recData.choices?.[0]?.message?.content ?? "{}");
            recommendations = parsed.recommendations ?? [];
          } catch {
            recommendations = [];
          }
        }
      }
    }

    const { data: inserted, error: iErr } = await supabase
      .from("qbr_reports")
      .insert({
        period_label: periodLabel,
        period_start: periodStart,
        period_end: periodEnd,
        salesperson_id: salespersonId,
        metrics,
        ai_narrative: narrative,
        recommendations,
      })
      .select()
      .single();

    if (iErr) throw iErr;

    return new Response(JSON.stringify(inserted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
