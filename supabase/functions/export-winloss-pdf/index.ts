import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



interface AnalysisRow { outcome: string; primary_reason: string | null; competitor: string | null; amount: number | null; analyzed_at: string }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: analyses } = await supabase
      .from("win_loss_analyses")
      .select("outcome, primary_reason, competitor, amount, analyzed_at")
      .order("analyzed_at", { ascending: false })
      .limit(500);

    const rows = (analyses ?? []) as AnalysisRow[];
    const wins = rows.filter(r => r.outcome === "won");
    const losses = rows.filter(r => r.outcome === "lost");
    const total = rows.length;
    const winRate = total ? (wins.length / total) * 100 : 0;
    const totalRevenue = wins.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const reasonCounts = new Map<string, number>();
    losses.forEach(r => {
      const k = r.primary_reason ?? "—";
      reasonCounts.set(k, (reasonCounts.get(k) ?? 0) + 1);
    });
    const topReasons = Array.from(reasonCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const competitorCounts = new Map<string, number>();
    rows.forEach(r => {
      if (!r.competitor) return;
      competitorCounts.set(r.competitor, (competitorCounts.get(r.competitor) ?? 0) + 1);
    });
    const topCompetitors = Array.from(competitorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // SVG-based lightweight PDF (no native deps).
    const lines: string[] = [];
    const push = (line: string) => lines.push(line);

    // Build a simple text-based PDF using minimal pdf-lib alternative: emit Markdown for now
    const md = [
      "# Win/Loss Intelligence — Relatório Executivo",
      `_Gerado em ${new Date().toLocaleString("pt-BR")}_`,
      "",
      "## KPIs",
      `- **Win rate:** ${winRate.toFixed(1)}%`,
      `- **Volume:** ${total} análises (${wins.length} ganhos · ${losses.length} perdidos)`,
      `- **Receita ganha:** R$ ${totalRevenue.toLocaleString("pt-BR")}`,
      "",
      "## Top motivos de perda",
      ...topReasons.map(([r, c], i) => `${i + 1}. ${r} — ${c} ocorrências`),
      "",
      "## Concorrentes mais frequentes",
      ...topCompetitors.map(([c, n], i) => `${i + 1}. ${c} — ${n} encontros`),
    ].join("\n");

    // Persist as plain text artifact in storage bucket if available; else return inline.
    const bucket = "winloss-reports";
    const fileName = `winloss-report-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}.md`;

    let signedUrl: string | null = null;
    try {
      // Ensure bucket exists (best-effort)
      await supabase.storage.createBucket(bucket, { public: false }).catch(() => null);
      const { error: upErr } = await supabase.storage.from(bucket).upload(fileName, new Blob([md], { type: "text/markdown" }), {
        contentType: "text/markdown",
        upsert: false,
      });
      if (!upErr) {
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(fileName, 60 * 60);
        signedUrl = signed?.signedUrl ?? null;
      }
    } catch (e) {
      console.warn("storage upload failed, returning inline:", e);
    }

    return new Response(JSON.stringify({ url: signedUrl, format: "markdown", inline: signedUrl ? null : md }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("export-winloss-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
