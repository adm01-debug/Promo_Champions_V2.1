import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface VisualSearchRequest {
  image: string; // data URL or base64
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, limit = 20 } = (await req.json()) as VisualSearchRequest;

    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "image (base64 or data URL) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Normalize to data URL
    const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    // 1. Analyze image via Gemini multimodal
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              "Você analisa imagens de produtos (brindes corporativos, itens promocionais). Identifique o objeto e descreva-o com palavras-chave em português, categoria e atributos visuais (cor, material).",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifique este produto e extraia palavras-chave para busca." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "describe_product_image",
              description: "Describe the product visible in the image with searchable keywords.",
              parameters: {
                type: "object",
                properties: {
                  product_name: { type: "string", description: "Nome curto do produto identificado." },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 5-10 palavras-chave em português.",
                  },
                  category: { type: "string", description: "Categoria provável." },
                  color: { type: "string", description: "Cor predominante (opcional)." },
                  material: { type: "string", description: "Material aparente (opcional)." },
                  description: { type: "string", description: "Descrição curta do produto." },
                },
                required: ["product_name", "keywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "describe_product_image" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    let analysis: {
      product_name: string;
      keywords: string[];
      category?: string;
      color?: string;
      material?: string;
      description?: string;
    } = { product_name: "", keywords: [] };

    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    if (!analysis.keywords || analysis.keywords.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Não foi possível identificar o produto na imagem. Tente uma foto mais nítida.",
          analysis,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Search similar products via RPC
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const searchQuery = [analysis.product_name, analysis.category, analysis.color, analysis.material]
      .filter(Boolean)
      .join(" ");

    // Generate query embedding for true semantic search
    const embRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/text-embedding-004",
        input: searchQuery,
      }),
    });

    if (!embRes.ok) {
      console.error("Embedding error:", await embRes.text());
      throw new Error("Failed to generate query embedding");
    }

    const embData = await embRes.json();
    const queryEmbedding = embData?.data?.[0]?.embedding;

    if (!queryEmbedding) {
      throw new Error("Invalid embedding response from AI Gateway");
    }

    const { data: products, error } = await supabase.rpc("search_products_vector", {
      _query_embedding: queryEmbedding,
      _limit: limit,
    });

    if (error) {
      console.error("RPC error:", error);
      // Fallback to legacy keyword search if vector search fails
      const { data: legacyProducts } = await supabase.rpc("search_products_semantic", {
        _keywords: analysis.keywords,
        _query: searchQuery,
        _limit: limit,
      });
      return new Response(
        JSON.stringify({ analysis, results: legacyProducts ?? [], count: (legacyProducts ?? []).length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        analysis,
        results: products ?? [],
        count: (products ?? []).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("visual-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
