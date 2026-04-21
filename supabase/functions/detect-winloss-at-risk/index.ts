import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Pattern { id: string; pattern_name: string | null; description: string | null; trigger_keywords: string[] | null; severity: string | null }
interface Sale { id: string; client_name: string | null; amount: number | null; status: string | null; stage: string | null; notes: string | null; updated_at: string | null }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: patterns } = await supabase
      .from("win_loss_patterns")
      .select("id, pattern_name, description, trigger_keywords, severity")
      .eq("outcome", "lost")
      .limit(50);

    const { data: sales } = await supabase
      .from("sales")
      .select("id, client_name, amount, status, stage, notes, updated_at")
      .not("status", "in", "(won,lost)")
      .order("updated_at", { ascending: false })
      .limit(200);

    const patternList = (patterns ?? []) as Pattern[];
    const dealList = (sales ?? []) as Sale[];

    const results = dealList.map(deal => {
      const haystack = `${deal.notes ?? ""} ${deal.stage ?? ""}`.toLowerCase();
      let bestScore = 0;
      let matchedPattern = "";
      let action = "";
      for (const pat of patternList) {
        const keywords = (pat.trigger_keywords ?? []).filter(Boolean);
        if (!keywords.length) continue;
        const hits = keywords.filter(k => haystack.includes(k.toLowerCase())).length;
        if (!hits) continue;
        const sevWeight = pat.severity === "critical" ? 1.5 : pat.severity === "high" ? 1.2 : 1;
        const score = Math.min(100, Math.round((hits / keywords.length) * 80 * sevWeight));
        if (score > bestScore) {
          bestScore = score;
          matchedPattern = pat.pattern_name ?? "Padrão de risco";
          action = pat.description ?? "Revisar abordagem";
        }
      }
      return {
        sale_id: deal.id,
        client_name: deal.client_name,
        amount: Number(deal.amount) || 0,
        stage: deal.stage,
        risk_score: bestScore,
        matched_pattern: matchedPattern,
        suggested_action: action,
      };
    }).filter(r => r.risk_score >= 40)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 20);

    return new Response(JSON.stringify({ deals: results, total: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-winloss-at-risk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", deals: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
