import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { validateString, validateArray, collectErrors, validationErrorResponse } from "../_shared/validation.ts";

const MAX_QUERY_LENGTH = 500;
const MAX_RESULT_LIMIT = 50;

interface SearchRequest {
  query: string;
  entity_types?: Array<"client" | "lead" | "deal" | "activity" | "call_recording">;
  limit?: number;
  with_answer?: boolean;
}

const cache = new Map<string, { ts: number; data: unknown }>();
const TTL_MS = 2 * 60 * 1000;

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/text-embedding-004", input: text.slice(0, 4000) }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`Embedding error ${res.status}`);
  }
  const json = await res.json();
  return json?.data?.[0]?.embedding ?? [];
}

async function generateAnswer(query: string, results: Array<{ entity_type: string; content: string }>, apiKey: string): Promise<string | null> {
  if (!results.length) return null;
  const ctx = results.slice(0, 5).map((r, i) => `[${i + 1}] (${r.entity_type}) ${r.content.slice(0, 400)}`).join("\n");
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um assistente de CRM. Responda em português, citando as fontes [N] que embasam cada afirmação. Seja direto, máx 4 linhas." },
          { role: "user", content: `Pergunta: ${query}\n\nContexto encontrado:\n${ctx}\n\nResponda citando [1], [2], etc.` },
        ],
      }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate JWT — presence check alone is insufficient
    let authHeader: string;
    try {
      const ctx = await getUserClient(req);
      authHeader = ctx.authHeader;
    } catch (authErr) {
      const isUnauth = authErr instanceof UnauthorizedError;
      return new Response(
        JSON.stringify({ error: isUnauth ? authErr.message : "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { query, entity_types, limit = 20, with_answer = true } = (await req.json()) as SearchRequest;

    const errs = collectErrors([
      validateString(query, "query", { required: true, maxLength: MAX_QUERY_LENGTH }),
      validateArray(entity_types, "entity_types", { maxLength: 5 }),
    ]);
    if (errs.length) return validationErrorResponse(errs, corsHeaders);

    const safeLimit = Math.min(Math.max(1, Number(limit) || 20), MAX_RESULT_LIMIT);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const cacheKey = `${query}::${(entity_types ?? []).join(",")}::${safeLimit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const embedding = await generateEmbedding(query, apiKey);

    // Use user-context client so RLS + RPC see auth.uid()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: matches, error } = await supabase.rpc("match_semantic", {
      _query_embedding: embedding as unknown as string,
      _match_count: safeLimit,
      _entity_types: entity_types ?? null,
    });
    if (error) throw error;

    const results = (matches ?? []) as Array<{
      id: string; entity_type: string; entity_id: string; content: string; metadata: Record<string, unknown>; similarity: number;
    }>;

    let answer: string | null = null;
    if (with_answer && results.length > 0) {
      answer = await generateAnswer(query, results, apiKey);
    }

    const payload = { query, results, count: results.length, answer };
    cache.set(cacheKey, { ts: Date.now(), data: payload });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    if (msg === "RATE_LIMIT") {
      return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (msg === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("semantic-search-universal error:", e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
