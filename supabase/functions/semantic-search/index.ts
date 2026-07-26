import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { validateString, collectErrors, validationErrorResponse } from "../_shared/validation.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";

interface SearchRequest {
  query: string;
  limit?: number;
}

interface ProductResult {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  sales_count: number;
  status: string;
  similarity_score: number;
}

// Simple in-memory cache (TTL 5min)
const cache = new Map<string, { ts: number; data: unknown }>();
const TTL_MS = 5 * 60 * 1000;

Deno.serve(withRequestId("semantic-search", async (req, _ctx) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const { query, limit = 20 } = (await req.json()) as SearchRequest;

    const errs = collectErrors([
      validateString(query, "query", { required: true, maxLength: 500 }),
    ]);
    if (errs.length) return validationErrorResponse(errs, getCorsHeaders(req));

    const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 50);
    const cacheKey = `${query.trim().toLowerCase()}::${safeLimit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        headers: { getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1. Extract keywords + intent via Lovable AI (tool calling)
    const aiRes = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um analista de busca para um catálogo de brindes corporativos e produtos promocionais. Extraia palavras-chave RELEVANTES (em português) e categorias do produto descrito pelo usuário. Seja generoso com sinônimos.",
          },
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_search_intent",
              description: "Extract product keywords and category hints from the user query.",
              parameters: {
                type: "object",
                properties: {
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de palavras-chave (3-8) representando o produto desejado.",
                  },
                  category: {
                    type: "string",
                    description: "Categoria provável (opcional).",
                  },
                  intent: {
                    type: "string",
                    description: "Resumo curto da intenção do usuário.",
                  },
                },
                required: ["keywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_search_intent" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402,
          headers: { getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    let keywords: string[] = [];
    let intent = "";
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
        intent = parsed.intent ?? "";
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    // Fallback: split query in words
    if (keywords.length === 0) {
      keywords = query.split(/\s+/).filter((w) => w.length > 2);
    }

    // 2. Run semantic RPC
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: products, error } = await supabase.rpc("search_products_semantic", {
      _keywords: keywords,
      _query: query,
      _limit: safeLimit,
    });

    if (error) {
      console.error("RPC error:", error);
      throw error;
    }

    const result = {
      query,
      keywords,
      intent,
      results: (products ?? []) as ProductResult[],
      count: (products ?? []).length,
    };

    cache.set(cacheKey, { ts: Date.now(), data: result });

    return new Response(JSON.stringify(result), {
      headers: { getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
}));
