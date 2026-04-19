import { corsHeaders } from "../_shared/cors.ts";

interface CommentaryRequest {
  seasonName?: string;
  roleType?: 'closer' | 'sdr';
  leaderboard: Array<{
    rank: number;
    name: string;
    progress: number;
    total_sales?: number;
    deals_count?: number;
  }>;
  recentEvents?: Array<{
    type: string;
    actor?: string;
    metadata?: Record<string, unknown>;
  }>;
  context?: 'overtake' | 'leader_change' | 'checkpoint' | 'periodic';
  secondsToEnd?: number;
}

// In-memory TTL cache to coalesce concurrent narration requests across clients
// (TV + closer + admin). Lives for the lifetime of an isolate (~minutes).
const COMMENTARY_CACHE_TTL_MS = 60_000;
const commentaryCache = new Map<string, { value: string; expires: number }>();
function cacheKey(b: CommentaryRequest): string {
  const top = (b.leaderboard ?? []).slice(0, 3).map(e => `${e.rank}:${e.name}`).join('|');
  return `${b.roleType ?? 'closer'}::${b.context ?? 'periodic'}::${top}`;
}
function getCached(key: string): string | null {
  const hit = commentaryCache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) { commentaryCache.delete(key); return null; }
  return hit.value;
}
function setCached(key: string, value: string) {
  commentaryCache.set(key, { value, expires: Date.now() + COMMENTARY_CACHE_TTL_MS });
  // bound memory: drop oldest entries when too large
  if (commentaryCache.size > 200) {
    const firstKey = commentaryCache.keys().next().value;
    if (firstKey) commentaryCache.delete(firstKey);
  }
}

const SYSTEM_PROMPT = `Você é um narrador esportivo brasileiro de corrida de vendas, estilo F1.
Crie narrações curtas (1-2 frases, máx 180 caracteres), empolgantes, com gírias de pista
("ultrapassagem cirúrgica", "comeback histórico", "última volta", "freada na curva", etc).
Use nomes próprios. Nunca invente números — use apenas os fornecidos. Português do Brasil.
NUNCA inclua hashtags, emojis em excesso (máx 1), ou aspas. Tom: animado, jornalístico.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Return 200 + skipped flag so the UI doesn't blank-screen when AI isn't configured
      return new Response(
        JSON.stringify({ commentary: "", skipped: true, reason: "no_api_key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as CommentaryRequest;
    if (!body.leaderboard || !Array.isArray(body.leaderboard)) {
      return new Response(JSON.stringify({ error: "Invalid leaderboard" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Coalesce concurrent identical requests via TTL cache (60s)
    const key = cacheKey(body);
    const cached = getCached(key);
    if (cached) {
      return new Response(
        JSON.stringify({ commentary: cached, cached: true, generated_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const top5 = body.leaderboard.slice(0, 5);
    const userPrompt = [
      `Pista: ${body.roleType === 'sdr' ? 'SDRs (prospecção)' : 'Closers (fechamento)'}.`,
      body.seasonName ? `Temporada: ${body.seasonName}.` : '',
      `Top 5 (rank · nome · progresso%):`,
      ...top5.map(e => `  P${e.rank} ${e.name} — ${(e.progress * 100).toFixed(1)}%${e.deals_count ? ` (${e.deals_count} deals)` : ''}`),
      body.recentEvents?.length
        ? `Eventos recentes:\n${body.recentEvents.slice(0, 3).map(e => `  - ${e.type}${e.actor ? ` (${e.actor})` : ''}`).join('\n')}`
        : '',
      body.secondsToEnd !== undefined && body.secondsToEnd > 0
        ? `Faltam ${Math.floor(body.secondsToEnd / 3600)}h para o fim.`
        : '',
      `Contexto: ${body.context ?? 'periodic'}.`,
      `Gere UMA narração curta sobre o momento mais marcante.`,
    ].filter(Boolean).join('\n');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s cap

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 120,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const aborted = (err as Error)?.name === "AbortError";
      console.error("AI gateway fetch failed:", err);
      // Return 200 with empty commentary so the UI doesn't blank-screen on timeouts
      return new Response(
        JSON.stringify({
          commentary: "",
          skipped: true,
          reason: aborted ? "ai_timeout" : "ai_unreachable",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    clearTimeout(timeoutId);

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const commentary = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (commentary) setCached(key, commentary);

    return new Response(
      JSON.stringify({ commentary, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("race-commentary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
